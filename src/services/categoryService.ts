import { categories, subcategories } from '@/data/categories';
import { fieldScore, tokenize } from '@/lib/search';
import type { Category, ResolvedCategory, Subcategory } from '@/types';

const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
const subcategoryBySlug = new Map(subcategories.map((s) => [s.slug, s]));

const subcategoryTokens = new Map(
  subcategories.map((s) => [s.slug, tokenize([s.name, ...(s.keywords ?? [])].join(' '))]),
);

export const categoryService = {
  getAll(): Category[] {
    return categories;
  },

  getSorted(): Category[] {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  },

  getFeatured(): Category[] {
    return categories.filter((c) => c.featured);
  },

  getCategory(slug: string): Category | undefined {
    return categoryBySlug.get(slug);
  },

  getSubcategory(slug: string): Subcategory | undefined {
    return subcategoryBySlug.get(slug);
  },

  getAllSubcategories(): Subcategory[] {
    return subcategories;
  },

  /** Primary parent for a subcategory. */
  getParent(subcategory: Subcategory): Category {
    return categoryBySlug.get(subcategory.categoryIds[0])!;
  },

  /** Resolves a category URL slug to a top-level category or a subcategory. */
  resolve(slug: string | undefined): ResolvedCategory | undefined {
    if (!slug) return undefined;
    const category = categoryBySlug.get(slug);
    if (category) return { kind: 'category', category };
    const subcategory = subcategoryBySlug.get(slug);
    if (subcategory) return { kind: 'subcategory', subcategory, parent: this.getParent(subcategory) };
    return undefined;
  },

  /** Display name for a resolved slug. */
  nameOf(resolved: ResolvedCategory): string {
    return resolved.kind === 'category' ? resolved.category.name : resolved.subcategory.name;
  },

  /**
   * Heading label: "Digital Marketing" → "Digital Marketing Companies",
   * "Dental Clinics" stays as-is because it is already a plural noun.
   */
  headingLabel(resolved: ResolvedCategory): string {
    if (resolved.kind === 'category') return resolved.category.pluralLabel ?? resolved.category.name;
    const name = resolved.subcategory.name;
    if (/(service|services)$/i.test(name)) return `${name} Providers`;
    if (/(marketing|development|software|automation|ads|security|studios?)$/i.test(name)) return `${name} Companies`;
    if (/(coaching|training)$/i.test(name)) return `${name} Centres`;
    if (/(repair|installation|cleaning|nursing|catering|printing|photography|videography|decoration|lighting|roofing|waterproofing|fabrication|machining|packaging|transport|housekeeping|gardening|landscaping|detailing)$/i.test(name)) {
      return `${name} Services`;
    }
    if (/s$/i.test(name)) return name;
    return `${name} Businesses`;
  },

  /** Ranked subcategory/category matches for a free-text term. */
  search(term: string, limit = 8): Array<{ subcategory?: Subcategory; category?: Category; score: number }> {
    const q = tokenize(term, { dropStopWords: true });
    if (!q.length) return [];
    const results: Array<{ subcategory?: Subcategory; category?: Category; score: number }> = [];

    for (const category of categories) {
      const score = fieldScore(q, tokenize(category.name));
      if (score >= q.length * 2) results.push({ category, score: score + 1 });
    }
    for (const subcategory of subcategories) {
      const tokens = subcategoryTokens.get(subcategory.slug)!;
      const score = fieldScore(q, tokens);
      if (score >= q.length * 2) results.push({ subcategory, score });
    }
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  },
};
