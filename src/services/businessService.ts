import { site } from '@/config/site';
import { fieldScore, matchesAll, tokenize } from '@/lib/search';
import { slugify } from '@/lib/slug';
import { isOpenNow } from '@/utils/hours';
import type { Business, BusinessQuery, Paginated } from '@/types';
import { categoryService } from './categoryService';
import { getDataSource } from './dataSource';
import { districtService } from './districtService';

interface IndexedBusiness {
  business: Business;
  nameTokens: string[];
  categoryTokens: string[];
  serviceTokens: string[];
  placeTokens: string[];
  allTokens: string[];
  parentCategoryIds: Set<string>;
}

let indexCache: { source: Business[]; index: IndexedBusiness[] } | null = null;

function buildIndex(list: Business[]): IndexedBusiness[] {
  if (indexCache?.source === list) return indexCache.index;
  const index = list.map((business) => {
    const subs = (business.subcategoryIds ?? [])
      .map((id) => categoryService.getSubcategory(id))
      .filter((s) => s !== undefined);
    const district = districtService.getDistrict(business.district);
    const nameTokens = tokenize(business.name);
    const categoryTokens = tokenize(
      [business.categoryName, ...subs.map((s) => [s.name, ...(s.keywords ?? [])].join(' '))].join(' '),
    );
    const serviceTokens = tokenize([...(business.services ?? []), business.shortDescription ?? ''].join(' '));
    const placeTokens = tokenize([district?.name, business.city, business.locality].filter(Boolean).join(' '));
    const parentCategoryIds = new Set([business.categoryId, ...subs.flatMap((s) => s.categoryIds)]);
    return {
      business,
      nameTokens,
      categoryTokens,
      serviceTokens,
      placeTokens,
      allTokens: [...nameTokens, ...categoryTokens, ...serviceTokens, ...placeTokens],
      parentCategoryIds,
    };
  });
  indexCache = { source: list, index };
  return index;
}

const baseRank = (b: Business) => (b.featured ? 3 : 0) + (b.verified ? 2 : 0) + (b.rating ?? 0) / 2;

/** Splits a free-text query into a district (if mentioned) and remaining keywords. */
export function interpretQuery(q: string | undefined, district: string | undefined) {
  if (!q?.trim()) return { keywords: [] as string[], district };
  const { districtSlug, rest } = districtService.extractPlace(q);
  const useExtracted = districtSlug && (!district || district === districtSlug);
  const text = useExtracted ? rest : q;
  return {
    keywords: tokenize(text, { dropStopWords: true }),
    district: useExtracted ? districtSlug : district,
  };
}

function applyQuery(index: IndexedBusiness[], query: BusinessQuery) {
  const { keywords, district } = interpretQuery(query.q, query.district);
  const citySlug = query.city;
  const localitySlug = query.locality;
  const letter = query.letter?.toUpperCase();

  const scored: Array<{ entry: IndexedBusiness; score: number }> = [];
  for (const entry of index) {
    const b = entry.business;
    if (b.status && b.status !== 'approved') continue;
    if (district && b.district !== district) continue;
    if (citySlug && slugify(b.city ?? '') !== citySlug) continue;
    if (localitySlug && slugify(b.locality ?? '') !== localitySlug) continue;
    if (query.category && !entry.parentCategoryIds.has(query.category)) continue;
    if (query.subcategory && !b.subcategoryIds?.includes(query.subcategory)) continue;
    if (query.verified && !b.verified) continue;
    if (query.featured && !b.featured) continue;
    if (query.minRating && (b.rating ?? 0) < query.minRating) continue;
    if (query.openNow && !isOpenNow(b.openingHours)) continue;
    if (letter) {
      const first = b.name.trim().charAt(0).toUpperCase();
      if (letter === '0-9' ? !/[0-9]/.test(first) : first !== letter) continue;
    }

    let score = 0;
    if (keywords.length) {
      if (!matchesAll(keywords, entry.allTokens)) continue;
      score =
        fieldScore(keywords, entry.nameTokens) * 3 +
        fieldScore(keywords, entry.categoryTokens) * 2 +
        fieldScore(keywords, entry.serviceTokens) +
        fieldScore(keywords, entry.placeTokens);
    }
    scored.push({ entry, score });
  }
  return scored;
}

function sortResults(results: Array<{ entry: IndexedBusiness; score: number }>, sort: BusinessQuery['sort']) {
  const list = [...results];
  const byName = (a: Business, b: Business) => a.name.localeCompare(b.name);
  switch (sort) {
    case 'az':
      return list.sort((a, b) => byName(a.entry.business, b.entry.business));
    case 'recent':
      return list.sort((a, b) => (b.entry.business.createdAt ?? '').localeCompare(a.entry.business.createdAt ?? ''));
    case 'views':
      return list.sort((a, b) => (b.entry.business.views ?? 0) - (a.entry.business.views ?? 0));
    case 'featured':
      return list.sort(
        (a, b) =>
          Number(b.entry.business.featured) - Number(a.entry.business.featured) ||
          Number(b.entry.business.verified) - Number(a.entry.business.verified) ||
          byName(a.entry.business, b.entry.business),
      );
    case 'recommended':
    default:
      return list.sort(
        (a, b) =>
          b.score - a.score ||
          baseRank(b.entry.business) - baseRank(a.entry.business) ||
          byName(a.entry.business, b.entry.business),
      );
  }
}

async function getIndex() {
  return buildIndex(await getDataSource().listBusinesses());
}

export const businessService = {
  async query(query: BusinessQuery): Promise<Paginated<Business>> {
    const index = await getIndex();
    const sorted = sortResults(applyQuery(index, query), query.sort);
    const pageSize = query.pageSize ?? site.listing.pageSize;
    const total = sorted.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, query.page ?? 1), pageCount);
    const items = sorted.slice((page - 1) * pageSize, page * pageSize).map((r) => r.entry.business);
    return { items, total, page, pageSize, pageCount };
  },

  async getBySlug(slug: string): Promise<Business | undefined> {
    const list = await getDataSource().listBusinesses();
    return list.find((b) => b.slug === slug);
  },

  async getFeatured(limit = 6, filter: Pick<BusinessQuery, 'district' | 'category' | 'subcategory'> = {}) {
    const { items } = await this.query({ ...filter, featured: true, sort: 'recommended', pageSize: limit });
    return items;
  },

  async getRecent(limit = 6) {
    const { items } = await this.query({ sort: 'recent', pageSize: limit });
    return items;
  },

  /** Same subcategory/category, preferring the same district. */
  async getSimilar(business: Business, limit = 3): Promise<Business[]> {
    const list = await getDataSource().listBusinesses();
    const subs = new Set(business.subcategoryIds ?? []);
    return list
      .filter((b) => b.id !== business.id)
      .map((b) => {
        const sharedSubs = (b.subcategoryIds ?? []).filter((s) => subs.has(s)).length;
        const score = sharedSubs * 3 + (b.categoryId === business.categoryId ? 2 : 0) + (b.district === business.district ? 1 : 0);
        return { b, score };
      })
      .filter((r) => r.score >= 2)
      .sort((a, b) => b.score - a.score || baseRank(b.b) - baseRank(a.b))
      .slice(0, limit)
      .map((r) => r.b);
  },

  /** Other businesses in the same district, then the closest districts. */
  async getNearby(business: Business, limit = 3): Promise<Business[]> {
    const list = await getDataSource().listBusinesses();
    const order = [business.district, ...districtService.getRelated(business.district, 5).map((d) => d.slug)];
    return list
      .filter((b) => b.id !== business.id && order.includes(b.district))
      .sort((a, b) => order.indexOf(a.district) - order.indexOf(b.district) || baseRank(b) - baseRank(a))
      .slice(0, limit);
  },

  /** Live listing counts used by district and category cards, optionally within one district. */
  async getCounts(district?: string) {
    const list = await getDataSource().listBusinesses();
    const index = buildIndex(list).filter((entry) => !district || entry.business.district === district);
    const byDistrict: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const bySubcategory: Record<string, number> = {};
    const byLetter: Record<string, number> = {};
    for (const entry of index) {
      const b = entry.business;
      byDistrict[b.district] = (byDistrict[b.district] ?? 0) + 1;
      for (const id of entry.parentCategoryIds) byCategory[id] = (byCategory[id] ?? 0) + 1;
      for (const id of b.subcategoryIds ?? []) bySubcategory[id] = (bySubcategory[id] ?? 0) + 1;
      const letter = b.name.charAt(0).toUpperCase();
      byLetter[letter] = (byLetter[letter] ?? 0) + 1;
    }
    return { total: index.length, byDistrict, byCategory, bySubcategory, byLetter };
  },

  /** Localities that actually have listings in a district, merged with seeded ones. */
  async getLocalities(districtSlug: string): Promise<string[]> {
    const list = await getDataSource().listBusinesses();
    const fromListings = list.filter((b) => b.district === districtSlug && b.locality).map((b) => b.locality!);
    return Array.from(new Set([...fromListings, ...districtService.getLocalities(districtSlug)]));
  },
};

export type DirectoryCounts = Awaited<ReturnType<typeof businessService.getCounts>>;
