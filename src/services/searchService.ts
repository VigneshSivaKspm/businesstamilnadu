import { districts } from '@/data/districts';
import { normalize, tokenize } from '@/lib/search';
import type { Suggestion } from '@/types';
import { businessService } from './businessService';
import { categoryService } from './categoryService';

export interface SuggestionGroups {
  categories: Suggestion[];
  businesses: Suggestion[];
  districts: Suggestion[];
}

const EMPTY: SuggestionGroups = { categories: [], businesses: [], districts: [] };

export const searchService = {
  /** Grouped autocomplete suggestions for the search box. */
  async suggest(term: string, district?: string): Promise<SuggestionGroups> {
    const text = term.trim();
    if (text.length < 2) return EMPTY;

    const categories: Suggestion[] = categoryService.search(text, 5).map(({ category, subcategory }) => {
      if (category) {
        return {
          id: `cat-${category.slug}`,
          type: 'category',
          label: category.name,
          sublabel: `${category.subcategories.length} subcategories`,
          href: district ? `/district/${district}/${category.slug}` : `/categories/${category.slug}`,
        };
      }
      const parent = categoryService.getParent(subcategory!);
      return {
        id: `sub-${subcategory!.slug}`,
        type: 'category',
        label: subcategory!.name,
        sublabel: parent.name,
        href: district ? `/district/${district}/${subcategory!.slug}` : `/categories/${subcategory!.slug}`,
      };
    });

    const { items } = await businessService.query({ q: text, district, pageSize: 4 });
    const businesses: Suggestion[] = items.map((b) => ({
      id: `biz-${b.slug}`,
      type: 'business',
      label: b.name,
      sublabel: [b.categoryName, b.locality ?? b.city].filter(Boolean).join(' · '),
      href: `/business/${b.slug}`,
    }));

    const q = tokenize(text);
    const normalized = normalize(text);
    const districtMatches: Suggestion[] = districts
      .filter((d) => {
        const name = normalize(d.name);
        return name.startsWith(normalized) || q.some((t) => t.length > 2 && name.startsWith(t));
      })
      .slice(0, 3)
      .map((d) => ({
        id: `dist-${d.slug}`,
        type: 'district',
        label: d.name,
        sublabel: 'District',
        href: `/district/${d.slug}`,
      }));

    return { categories, businesses, districts: districtMatches };
  },
};
