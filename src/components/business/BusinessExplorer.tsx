import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Pagination } from '@/components/common/Pagination';
import { BusinessGridSkeleton } from '@/components/common/Skeleton';
import { EmptyState, ErrorState } from '@/components/common/States';
import { ALL_FILTER_FIELDS, type FilterField } from '@/components/filters/filterFields';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { MobileFilters } from '@/components/filters/MobileFilters';
import { SelectControl } from '@/components/forms/Field';
import { site } from '@/config/site';
import { SORT_OPTIONS, toBusinessQuery, useListingParams, type ListingParamKey } from '@/hooks/useListingParams';
import { useQuery } from '@/hooks/useQuery';
import { cn } from '@/lib/cn';
import { businessService, categoryService, districtService } from '@/services';
import type { BusinessQuery, SortOption } from '@/types';
import { formatNumber } from '@/utils/format';
import { BusinessCard } from './BusinessCard';

interface BusinessExplorerProps {
  /** Route-level filters that the user cannot remove (e.g. the district on a district page). */
  locked?: Partial<BusinessQuery>;
  fields?: FilterField[];
  /** Heading level for card titles. */
  cardHeading?: 'h2' | 'h3';
  emptyActions?: ReactNode;
  className?: string;
}

interface Chip {
  key: ListingParamKey;
  label: string;
}

/**
 * Complete listing experience: sidebar/mobile filters, sort, view toggle,
 * active filter chips, results grid, empty/error/loading states and
 * pagination — all synchronised with the URL query string.
 */
export function BusinessExplorer({
  locked = {},
  fields = ALL_FILTER_FIELDS,
  cardHeading = 'h3',
  emptyActions,
  className,
}: BusinessExplorerProps) {
  const { filters, update, clear } = useListingParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);
  const topRef = useRef<HTMLDivElement>(null);

  const query = useMemo(() => toBusinessQuery(filters, locked), [filters, locked]);
  const key = `businesses:${JSON.stringify(query)}`;
  const { data, loading, error, reload } = useQuery(key, () => businessService.query(query));

  const clearAll = () => clear(['view', 'sort']);

  const chips = useMemo<Chip[]>(() => {
    const list: Chip[] = [];
    if (filters.q) list.push({ key: 'q', label: `“${filters.q}”` });
    if (filters.district && !locked.district)
      list.push({ key: 'district', label: districtService.getDistrict(filters.district)?.name ?? filters.district });
    if (filters.city) list.push({ key: 'city', label: districtService.getCity(filters.city)?.name ?? filters.city });
    if (filters.locality) {
      const name = filters.locality.replace(/-/g, ' ');
      list.push({ key: 'locality', label: name.replace(/\b\w/g, (c) => c.toUpperCase()) });
    }
    if (filters.category && !locked.category)
      list.push({ key: 'category', label: categoryService.getCategory(filters.category)?.name ?? filters.category });
    if (filters.sub) list.push({ key: 'sub', label: categoryService.getSubcategory(filters.sub)?.name ?? filters.sub });
    if (filters.letter) list.push({ key: 'letter', label: `Starts with ${filters.letter}` });
    if (filters.verified) list.push({ key: 'verified', label: 'Verified' });
    if (filters.featured) list.push({ key: 'featured', label: 'Featured' });
    if (filters.open) list.push({ key: 'open', label: 'Open now' });
    if (filters.rating) list.push({ key: 'rating', label: `${filters.rating}+ rating` });
    return list;
  }, [filters, locked.district, locked.category]);

  const goToPage = (page: number) => {
    update({ page });
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sidebarProps = { filters, update, onClear: clearAll, locked, fields };
  const activeFilterCount = chips.length;

  return (
    <div className={cn('grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] xl:gap-10', className)}>
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-24 rounded-card border border-line bg-white p-5">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-navy-500" aria-hidden />
            <h2 className="text-h4">Filters</h2>
          </div>
          <FilterSidebar {...sidebarProps} />
        </div>
      </aside>

      <div className="min-w-0">
        <div ref={topRef} className="scroll-mt-24" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-navy-600" aria-live="polite">
            {data ? (
              <>
                <span className="text-base font-bold text-navy-950">{formatNumber(data.total)}</span>{' '}
                {data.total === 1 ? 'business found' : 'businesses found'}
              </>
            ) : (
              'Loading businesses…'
            )}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-10 lg:hidden"
              onClick={() => setFiltersOpen(true)}
              leftIcon={<SlidersHorizontal className="size-4" aria-hidden />}
              aria-haspopup="dialog"
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-navy-950 text-[0.6875rem] text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <label htmlFor="sort-results" className="sr-only">
              Sort results
            </label>
            <SelectControl
              id="sort-results"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortOption })}
              className="h-10 w-44 text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectControl>
            <div className="hidden rounded-control border border-line bg-white p-0.5 sm:flex" role="group" aria-label="Layout">
              {(
                [
                  { value: 'grid', Icon: LayoutGrid, label: 'Grid view' },
                  { value: 'list', Icon: List, label: 'List view' },
                ] as const
              ).map(({ value, Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update({ view: value, page: filters.page })}
                  aria-pressed={filters.view === value}
                  aria-label={label}
                  className={cn(
                    'grid size-9 place-items-center rounded-[9px] transition-colors',
                    filters.view === value ? 'bg-navy-950 text-white' : 'text-navy-500 hover:text-navy-900',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={() => update({ [chip.key]: null })}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white pr-2 pl-3 text-xs font-semibold text-navy-800 transition-colors hover:border-navy-300 hover:bg-navy-50"
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  {chip.label}
                  <X className="size-3.5 text-navy-400" aria-hidden />
                </button>
              </li>
            ))}
            <li>
              <button type="button" onClick={clearAll} className="px-2 text-xs font-semibold text-brand-700 hover:text-navy-950">
                Clear all
              </button>
            </li>
          </ul>
        )}

        <div className={cn('mt-6 transition-opacity', loading && data && 'opacity-60')}>
          {error ? (
            <ErrorState onRetry={reload} />
          ) : !data ? (
            <BusinessGridSkeleton variant={filters.view} />
          ) : data.items.length === 0 ? (
            <EmptyState
              actions={
                emptyActions ?? (
                  <>
                    <Button variant="primary" onClick={clearAll}>
                      Clear Filters
                    </Button>
                    <Button variant="secondary" to="/categories">
                      Browse Categories
                    </Button>
                  </>
                )
              }
            />
          ) : (
            <ul className={cn('grid grid-cols-1 gap-4', filters.view === 'grid' && 'sm:grid-cols-2 2xl:grid-cols-3')}>
              {data.items.map((business) => (
                <li key={business.id} className="flex">
                  <BusinessCard
                    business={business}
                    variant={filters.view}
                    headingLevel={cardHeading}
                    className="w-full"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {data && data.pageCount > 1 && (
          <Pagination className="mt-10" page={data.page} pageCount={data.pageCount} onChange={goToPage} />
        )}

        {site.demoMode && data && data.items.length > 0 && (
          <p className="mt-8 text-center text-xs text-navy-400">
            Listings shown are fictional samples used to demonstrate the platform.
          </p>
        )}
      </div>

      <MobileFilters open={filtersOpen} onClose={closeFilters} resultCount={data?.total} {...sidebarProps} />
    </div>
  );
}
