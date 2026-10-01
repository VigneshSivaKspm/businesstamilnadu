import { useEffect, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Checkbox, SelectControl, controlClass } from '@/components/forms/Field';
import { useDebounce } from '@/hooks/useDebounce';
import type { ListingFilters, ListingParamKey } from '@/hooks/useListingParams';
import { useQuery } from '@/hooks/useQuery';
import { cn } from '@/lib/cn';
import { slugify } from '@/lib/slug';
import { businessService, categoryService, districtService } from '@/services';
import type { BusinessQuery } from '@/types';
import { ALL_FILTER_FIELDS, type FilterField } from './filterFields';

export interface FilterSidebarProps {
  filters: ListingFilters;
  update: (changes: Partial<Record<ListingParamKey, string | number | boolean | null>>) => void;
  onClear: () => void;
  locked?: Partial<BusinessQuery>;
  fields?: FilterField[];
  className?: string;
  idPrefix?: string;
}

function FilterGroup({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-label block text-[0.6875rem] text-navy-500">
          {label}
        </label>
      ) : (
        <p className="text-label text-[0.6875rem] text-navy-500">{label}</p>
      )}
      {children}
    </div>
  );
}

/** Desktop filter panel; also rendered inside the mobile filter sheet. */
export function FilterSidebar({
  filters,
  update,
  onClear,
  locked = {},
  fields = ALL_FILTER_FIELDS,
  className,
  idPrefix = 'filter',
}: FilterSidebarProps) {
  const show = (field: FilterField) => fields.includes(field);
  const district = locked.district ?? filters.district;
  const categorySlug = locked.category ?? filters.category;
  const category = categorySlug ? categoryService.getCategory(categorySlug) : undefined;

  // Keyword input applies after a short pause so typing doesn't spam history.
  const [keyword, setKeyword] = useState(filters.q);
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q);
    setKeyword(filters.q);
  }
  const debouncedKeyword = useDebounce(keyword, 350);
  useEffect(() => {
    if (debouncedKeyword !== filters.q) update({ q: debouncedKeyword });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debouncedKeyword]);

  const { data: localities = [] } = useQuery(`localities:${district}`, () =>
    district ? businessService.getLocalities(district) : Promise.resolve([]),
  );
  const cities = districtService.getCities(district || undefined);

  const id = (name: string) => `${idPrefix}-${name}`;
  const hasLocks = Boolean(locked.district || locked.category || locked.subcategory);

  return (
    <div className={cn('space-y-6', className)}>
      {show('q') && (
        <FilterGroup label="Search keyword" htmlFor={id('q')}>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-navy-400" aria-hidden />
            <input
              id={id('q')}
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') update({ q: keyword });
              }}
              placeholder="Name, service or keyword"
              className={cn(controlClass, 'h-11 border-line pl-10')}
            />
          </div>
        </FilterGroup>
      )}

      {show('district') && !locked.district && (
        <FilterGroup label="District" htmlFor={id('district')}>
          <SelectControl id={id('district')} value={filters.district} onChange={(e) => update({ district: e.target.value })}>
            <option value="">All districts</option>
            {districtService.getAll().map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </SelectControl>
        </FilterGroup>
      )}

      {show('city') && cities.length > 0 && (
        <FilterGroup label="City / Town" htmlFor={id('city')}>
          <SelectControl id={id('city')} value={filters.city} onChange={(e) => update({ city: e.target.value, page: null })}>
            <option value="">All cities & towns</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </SelectControl>
        </FilterGroup>
      )}

      {show('locality') && (
        <FilterGroup label="Locality" htmlFor={id('locality')}>
          <SelectControl
            id={id('locality')}
            value={filters.locality}
            disabled={!district}
            onChange={(e) => update({ locality: e.target.value, page: null })}
          >
            <option value="">{district ? 'All localities' : 'Select a district first'}</option>
            {localities.map((name) => (
              <option key={name} value={slugify(name)}>
                {name}
              </option>
            ))}
          </SelectControl>
        </FilterGroup>
      )}

      {show('category') && !locked.category && !locked.subcategory && (
        <FilterGroup label="Category" htmlFor={id('category')}>
          <SelectControl id={id('category')} value={filters.category} onChange={(e) => update({ category: e.target.value })}>
            <option value="">All categories</option>
            {categoryService.getSorted().map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </SelectControl>
        </FilterGroup>
      )}

      {show('subcategory') && !locked.subcategory && (
        <FilterGroup label="Subcategory" htmlFor={id('sub')}>
          <SelectControl
            id={id('sub')}
            value={filters.sub}
            disabled={!category}
            onChange={(e) => update({ sub: e.target.value, page: null })}
          >
            <option value="">{category ? 'All subcategories' : 'Select a category first'}</option>
            {category?.subcategories.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </SelectControl>
        </FilterGroup>
      )}

      {(show('verified') || show('featured') || show('open')) && (
        <FilterGroup label="Listing">
          <div className="space-y-3 pt-1">
            {show('verified') && (
              <Checkbox
                id={id('verified')}
                label="Verified only"
                description="Details reviewed by our team"
                checked={filters.verified}
                onChange={(e) => update({ verified: e.target.checked })}
              />
            )}
            {show('featured') && (
              <Checkbox
                id={id('featured')}
                label="Featured businesses"
                checked={filters.featured}
                onChange={(e) => update({ featured: e.target.checked })}
              />
            )}
            {show('open') && (
              <Checkbox
                id={id('open')}
                label="Open now"
                description="Based on listed hours (IST)"
                checked={filters.open}
                onChange={(e) => update({ open: e.target.checked })}
              />
            )}
          </div>
        </FilterGroup>
      )}

      {show('rating') && (
        <fieldset className="space-y-2">
          <legend className="text-label mb-2 text-[0.6875rem] text-navy-500">Rating</legend>
          <div className="grid grid-cols-3 gap-1.5 rounded-control bg-navy-50 p-1">
            {[
              { value: 0, label: 'Any' },
              { value: 4, label: '4.0+' },
              { value: 4.5, label: '4.5+' },
            ].map((option) => (
              <label
                key={option.value}
                className={cn(
                  'cursor-pointer rounded-[9px] py-2 text-center text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-500',
                  filters.rating === option.value ? 'bg-white text-navy-950 shadow-soft' : 'text-navy-500 hover:text-navy-900',
                )}
              >
                <input
                  type="radio"
                  name={id('rating')}
                  value={option.value}
                  checked={filters.rating === option.value}
                  onChange={() => update({ rating: option.value || null })}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-navy-400">Ratings shown are sample data until reviews launch.</p>
        </fieldset>
      )}

      <button
        type="button"
        onClick={onClear}
        className="text-sm font-semibold text-brand-700 underline-offset-4 hover:text-navy-950 hover:underline"
      >
        {hasLocks ? 'Reset filters' : 'Clear all filters'}
      </button>
    </div>
  );
}
