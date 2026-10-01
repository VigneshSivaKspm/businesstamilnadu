import { cities } from '@/data/cities';
import { districts, regionLabels } from '@/data/districts';
import { normalize } from '@/lib/search';
import { slugify } from '@/lib/slug';
import type { City, District, Region } from '@/types';

const districtBySlug = new Map(districts.map((d) => [d.slug, d]));
const cityBySlug = new Map(cities.map((c) => [c.slug, c]));

/** Lowercase place name → district slug, including cities and towns. */
const placeIndex = new Map<string, string>();
for (const d of districts) placeIndex.set(normalize(d.name), d.slug);
for (const c of cities) if (!placeIndex.has(normalize(c.name))) placeIndex.set(normalize(c.name), c.districtSlug);
// Common alternate spellings.
const aliases: Record<string, string> = {
  trichy: 'tiruchirappalli',
  tiruchi: 'tiruchirappalli',
  kovai: 'coimbatore',
  tuticorin: 'thoothukudi',
  nellai: 'tirunelveli',
  ooty: 'nilgiris',
  'the nilgiris': 'nilgiris',
  kanyakumari: 'kanniyakumari',
  nagercoil: 'kanniyakumari',
  villupuram: 'viluppuram',
  tirupur: 'tiruppur',
  thiruvallur: 'tiruvallur',
  kancheepuram: 'kanchipuram',
};
for (const [alias, slug] of Object.entries(aliases)) placeIndex.set(alias, slug);

export const districtService = {
  getAll(): District[] {
    return districts;
  },

  getFeatured(): District[] {
    return districts.filter((d) => d.featured);
  },

  getDistrict(slug: string | undefined): District | undefined {
    return slug ? districtBySlug.get(slug) : undefined;
  },

  getByRegion(): Array<{ region: Region; label: string; districts: District[] }> {
    return (Object.keys(regionLabels) as Region[]).map((region) => ({
      region,
      label: regionLabels[region],
      districts: districts.filter((d) => d.region === region),
    }));
  },

  /** Districts in the same region, closest first. */
  getRelated(slug: string, limit = 6): District[] {
    const current = districtBySlug.get(slug);
    if (!current) return [];
    const distance = (d: District) =>
      Math.hypot(d.latitude - current.latitude, d.longitude - current.longitude);
    return districts
      .filter((d) => d.slug !== slug)
      .sort((a, b) => distance(a) - distance(b))
      .slice(0, limit);
  },

  getCities(districtSlug?: string): City[] {
    return districtSlug ? cities.filter((c) => c.districtSlug === districtSlug) : cities;
  },

  getCity(slug: string | undefined): City | undefined {
    return slug ? cityBySlug.get(slug) : undefined;
  },

  getHubs(): City[] {
    return cities.filter((c) => c.isHub);
  },

  getLocalities(districtSlug: string): string[] {
    return districtBySlug.get(districtSlug)?.localities ?? [];
  },

  localitySlug: (name: string) => slugify(name),

  /**
   * Finds a district mentioned in free text ("dentist chennai", "builders in kovai").
   * Returns the district slug and the text with the place name removed.
   */
  extractPlace(text: string): { districtSlug?: string; rest: string } {
    const normalized = normalize(text);
    if (!normalized) return { rest: '' };
    const words = normalized.split(' ');
    // Try longest phrases first so "the nilgiris" beats "nilgiris".
    for (let size = Math.min(3, words.length); size >= 1; size--) {
      for (let start = 0; start + size <= words.length; start++) {
        const phrase = words.slice(start, start + size).join(' ');
        const slug = placeIndex.get(phrase);
        if (slug) {
          const rest = [...words.slice(0, start), ...words.slice(start + size)].join(' ');
          return { districtSlug: slug, rest };
        }
      }
    }
    return { rest: normalized };
  },
};
