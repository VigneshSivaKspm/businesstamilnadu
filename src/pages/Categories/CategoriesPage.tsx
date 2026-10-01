import { useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/States';
import { CategoryCard } from '@/components/category/CategoryCard';
import { controlClass } from '@/components/forms/Field';
import { useCounts } from '@/hooks/useCounts';
import { cn } from '@/lib/cn';
import { breadcrumbSchema } from '@/lib/schema';
import { categoryService } from '@/services';
import type { Category, Subcategory } from '@/types';
import { ALPHABET, formatNumber, pluralize } from '@/utils/format';

const VISIBLE_SUBCATEGORIES = 10;

function CategoryBlock({ category, count }: { category: Category; count?: number }) {
  const [expanded, setExpanded] = useState(false);
  const subs = expanded ? category.subcategories : category.subcategories.slice(0, VISIBLE_SUBCATEGORIES);
  const hidden = category.subcategories.length - VISIBLE_SUBCATEGORIES;

  return (
    <article id={category.slug} className="scroll-mt-28 rounded-card border border-line bg-white p-5 sm:p-6">
      <header className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-950 text-gold-300">
          <CategoryIcon icon={category.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-h4">
            <Link to={`/categories/${category.slug}`} className="hover:text-brand-700">
              {category.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs font-medium text-navy-500">
            {pluralize(category.subcategories.length, 'subcategory', 'subcategories')}
            {count !== undefined && <> · {pluralize(count, 'listing')}</>}
          </p>
        </div>
      </header>
      <p className="text-body-sm mt-3 text-navy-500">{category.description}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {subs.map((sub) => (
          <li key={sub.slug}>
            <Link
              to={`/categories/${sub.slug}`}
              className="inline-flex h-8 items-center rounded-full border border-line bg-paper px-3 text-[0.8125rem] font-medium text-navy-700 transition-colors hover:border-navy-300 hover:bg-white hover:text-navy-950"
            >
              {sub.name}
            </Link>
          </li>
        ))}
        {hidden > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="inline-flex h-8 items-center rounded-full px-3 text-[0.8125rem] font-semibold text-brand-700 hover:text-navy-950"
            >
              {expanded ? 'Show less' : `+${hidden} more`}
            </button>
          </li>
        )}
      </ul>
      <Link
        to={`/categories/${category.slug}`}
        className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-brand-700"
      >
        View {category.name.toLowerCase()} businesses
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </article>
  );
}

function SubcategoryResult({ subcategory, count }: { subcategory: Subcategory; count?: number }) {
  const parent = categoryService.getParent(subcategory);
  return (
    <Link
      to={`/categories/${subcategory.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 transition-[border-color,box-shadow] hover:border-navy-200 hover:shadow-soft"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-600">
        <CategoryIcon icon={parent.icon} className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-navy-950">{subcategory.name}</span>
        <span className="block truncate text-xs text-navy-500">
          {parent.name}
          {count ? ` · ${pluralize(count, 'listing')}` : ''}
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-navy-700" aria-hidden />
    </Link>
  );
}

export default function CategoriesPage() {
  const [params, setParams] = useSearchParams();
  const counts = useCounts();
  const query = params.get('q') ?? '';
  const letter = (params.get('letter') ?? '').toUpperCase();
  const all = categoryService.getAll();
  const allSubs = categoryService.getAllSubcategories();

  const setParam = (key: 'q' | 'letter', value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key === 'q') next.delete('letter');
        if (key === 'letter') next.delete('q');
        return next;
      },
      { replace: true },
    );

  const results = useMemo(() => {
    if (query.trim()) {
      const matches = categoryService.search(query, 40);
      return {
        categories: matches.filter((m) => m.category).map((m) => m.category!),
        subcategories: matches.filter((m) => m.subcategory).map((m) => m.subcategory!),
      };
    }
    if (letter) {
      return {
        categories: all.filter((c) => c.name.toUpperCase().startsWith(letter)),
        subcategories: allSubs
          .filter((s) => s.name.toUpperCase().startsWith(letter))
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
    }
    return null;
  }, [query, letter, all, allSubs]);

  const lettersWithEntries = useMemo(() => new Set(allSubs.map((s) => s.name.charAt(0).toUpperCase())), [allSubs]);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
  ];

  return (
    <>
      <SEO
        title="Business Categories in Tamil Nadu"
        description={`Explore ${allSubs.length}+ business categories across Tamil Nadu — healthcare, education, real estate, technology, manufacturing, travel and more.`}
        canonicalPath="/categories"
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow={`${all.length} industries · ${formatNumber(allSubs.length)} categories`}
        title="Business Categories"
        description="Every kind of business, organised so customers can find exactly what they need — from GST consultants to drone photographers."
      >
        <div className="max-w-2xl">
          <label htmlFor="category-search" className="sr-only">
            Search categories
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-navy-400" aria-hidden />
            <input
              id="category-search"
              type="search"
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="Search categories, e.g. dental, GST, catering"
              className={cn(controlClass, 'h-14 rounded-xl border-line pr-12 pl-12 text-base shadow-soft')}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setParam('q', '')}
                className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-800"
                aria-label="Clear search"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
        <nav aria-label="Categories A to Z" className="mt-5">
          <ul className="flex flex-wrap gap-1">
            {ALPHABET.map((l) => {
              const enabled = lettersWithEntries.has(l);
              return (
                <li key={l}>
                  <button
                    type="button"
                    disabled={!enabled}
                    aria-pressed={letter === l}
                    onClick={() => setParam('letter', letter === l ? '' : l)}
                    className={cn(
                      'grid size-8 place-items-center rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:text-navy-200',
                      letter === l ? 'bg-navy-950 text-white' : 'text-navy-700 hover:bg-navy-50',
                    )}
                  >
                    {l}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </PageHero>

      {results ? (
        <Container className="py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-h3" aria-live="polite">
              {query ? `Results for “${query}”` : `Categories starting with “${letter}”`}
            </h2>
            <p className="text-sm text-navy-500">
              {pluralize(results.categories.length + results.subcategories.length, 'match', 'matches')}
            </p>
          </div>
          {results.categories.length + results.subcategories.length === 0 ? (
            <EmptyState
              className="mt-6"
              title="No matching categories"
              description="Try a broader term like “clinic”, “consultant” or “repair”."
            />
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.categories.map((c) => (
                <li key={c.slug}>
                  <CategoryCard category={c} businessCount={counts?.byCategory[c.slug]} />
                </li>
              ))}
              {results.subcategories.map((s) => (
                <li key={s.slug}>
                  <SubcategoryResult subcategory={s} count={counts?.bySubcategory[s.slug]} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      ) : (
        <>
          <Container className="py-12 sm:py-16">
            <SectionHeading title="Featured categories" description="The industries customers search for most often." />
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
              {categoryService.getFeatured().map((c) => (
                <li key={c.slug}>
                  <CategoryCard category={c} businessCount={counts?.byCategory[c.slug] ?? (counts ? 0 : undefined)} variant="detailed" />
                </li>
              ))}
            </ul>
          </Container>
          <section className="border-t border-line bg-white py-12 sm:py-16" aria-labelledby="all-categories">
            <Container>
              <SectionHeading id="all-categories" title="All categories" description="Every industry and its subcategories." />
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {categoryService.getSorted().map((c) => (
                  <CategoryBlock key={c.slug} category={c} count={counts?.byCategory[c.slug]} />
                ))}
              </div>
            </Container>
          </section>
        </>
      )}
    </>
  );
}
