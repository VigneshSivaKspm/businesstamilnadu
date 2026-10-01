import { randomUUID } from 'node:crypto';
import { categories } from '../../../src/data/categories.ts';
import { districts } from '../../../src/data/districts.ts';
import { slugify } from '../../../src/lib/slug.ts';
import type { Business, OpeningHours } from '../../../src/types/index.ts';
import type { BusinessDoc, Collections, RegistrationDoc } from '../db.ts';
import type { BusinessInputParsed } from '../schemas.ts';
import { normalizeUrl } from '../schemas.ts';

const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));
const districtCoords = new Map(districts.map((d) => [d.slug, { latitude: d.latitude, longitude: d.longitude }]));

/** Returns `base`, or `base-2`, `base-3`… — the first slug not used by another business. */
export async function uniqueSlug(c: Collections, base: string, excludeId?: string) {
  const root = slugify(base).slice(0, 100) || 'business';
  for (let n = 1; n < 500; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const clash = await c.businesses.findOne({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }, { projection: { _id: 1 } });
    if (!clash) return candidate;
  }
  return `${root}-${randomUUID().slice(0, 8)}`;
}

/** Drops empty strings, empty arrays and nullish values so stored documents stay clean. */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === '' || value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out as Partial<T>;
}

/**
 * Builds a stored business from validated admin input. Fields the admin form
 * doesn't manage (ratings, views, origin registration, createdAt) are carried
 * over from the existing document.
 */
export function buildBusiness(input: BusinessInputParsed, slug: string, existing?: BusinessDoc): BusinessDoc {
  const now = new Date().toISOString();
  const coords = districtCoords.get(input.district);
  const { slug: _ignored, latitude, longitude, yearEstablished, openingHours, ...rest } = input;
  void _ignored;
  const fields = compact({
    ...rest,
    whatsapp: rest.whatsapp ? rest.whatsapp.replace(/\D/g, '') : '',
    yearEstablished: yearEstablished ?? undefined,
    openingHours: openingHours && Object.keys(openingHours).length ? (openingHours as OpeningHours) : undefined,
    latitude: latitude ?? coords?.latitude,
    longitude: longitude ?? coords?.longitude,
  });
  return {
    ...fields,
    _id: existing?._id ?? randomUUID(),
    slug,
    name: input.name,
    categoryId: input.categoryId,
    categoryName: categoryNames.get(input.categoryId) ?? input.categoryId,
    district: input.district,
    description: input.description,
    verified: input.verified,
    featured: input.featured,
    isDemo: input.isDemo,
    rating: existing?.rating,
    reviewCount: existing?.reviewCount,
    views: existing?.views ?? 0,
    registrationId: existing?.registrationId,
    ownerId: existing?.ownerId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  } as BusinessDoc;
}

const splitList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);

/** Turns an approved registration into a live listing. */
export function businessFromRegistration(
  reg: RegistrationDoc,
  slug: string,
  options: { verified: boolean; featured: boolean },
): BusinessDoc {
  const now = new Date().toISOString();
  const coords = districtCoords.get(reg.district);
  const business: Omit<Business, 'id'> & { _id: string } = {
    _id: randomUUID(),
    slug,
    name: reg.businessName,
    categoryId: reg.categoryId,
    categoryName: categoryNames.get(reg.categoryId) ?? reg.categoryId,
    subcategoryIds: reg.subcategoryId ? [reg.subcategoryId] : [],
    district: reg.district,
    city: reg.city,
    locality: reg.locality || undefined,
    address: reg.address,
    pinCode: reg.pinCode,
    description: reg.shortDescription,
    shortDescription: reg.shortDescription,
    contactPerson: reg.contactPerson,
    phone: reg.phone,
    whatsapp: (reg.whatsapp || reg.phone).replace(/\D/g, ''),
    email: reg.email || undefined,
    website: reg.website ? normalizeUrl(reg.website) : undefined,
    services: splitList(reg.services),
    serviceAreas: splitList(reg.serviceAreas),
    yearEstablished: reg.yearEstablished ? Number(reg.yearEstablished) : undefined,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    verified: options.verified,
    featured: options.featured,
    plan: options.featured ? 'featured' : options.verified ? 'verified' : 'free',
    status: 'approved',
    isDemo: false,
    views: 0,
    registrationId: reg._id,
    createdAt: now,
    updatedAt: now,
  };
  return compact(business) as BusinessDoc;
}

/** Fields never exposed on the public API. */
export const PUBLIC_PROJECTION = { registrationId: 0, ownerId: 0, contactPerson: 0 } as const;
