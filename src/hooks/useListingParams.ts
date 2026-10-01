import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BusinessQuery, SortOption } from '@/types';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'az', label: 'A–Z' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'featured', label: 'Featured First' },
];

const SORT_VALUES = new Set<string>(SORT_OPTIONS.map((o) => o.value));

/** Filter keys that live in the URL query string. */
export type ListingParamKey =
  | 'q'
  | 'district'
  | 'city'
  | 'locality'
  | 'category'
  | 'sub'
  | 'letter'
  | 'verified'
  | 'featured'
  | 'open'
  | 'rating'
  | 'sort'
  | 'page'
  | 'view';

type ParamValue = string | number | boolean | null | undefined;

const isDefault = (key: string, value: string) =>
  !value ||
  (key === 'sort' && value === 'recommended') ||
  (key === 'page' && value === '1') ||
  (key === 'view' && value === 'grid');

/**
 * Two-way binding between listing filters and URL query parameters, so every
 * result set is shareable, bookmarkable and works with back/forward.
 */
export function useListingParams() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const sort = params.get('sort');
    const page = Number(params.get('page') ?? '1');
    const rating = Number(params.get('rating') ?? '0');
    const letter = params.get('letter')?.toUpperCase() ?? '';
    return {
      q: params.get('q') ?? '',
      district: params.get('district') ?? '',
      city: params.get('city') ?? '',
      locality: params.get('locality') ?? '',
      category: params.get('category') ?? '',
      sub: params.get('sub') ?? '',
      letter: /^[A-Z]$/.test(letter) ? letter : '',
      verified: params.get('verified') === '1',
      featured: params.get('featured') === '1',
      open: params.get('open') === '1',
      rating: rating > 0 && rating <= 5 ? rating : 0,
      sort: (sort && SORT_VALUES.has(sort) ? sort : 'recommended') as SortOption,
      page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
      view: params.get('view') === 'list' ? ('list' as const) : ('grid' as const),
    };
  }, [params]);

  /** Updates one or more params. Any change other than `page` resets to page 1. */
  const update = useCallback(
    (changes: Partial<Record<ListingParamKey, ParamValue>>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, raw] of Object.entries(changes)) {
            const value = typeof raw === 'boolean' ? (raw ? '1' : '') : raw == null ? '' : String(raw);
            if (isDefault(key, value)) next.delete(key);
            else next.set(key, value);
          }
          if (!('page' in changes)) next.delete('page');
          // A new district invalidates the city/locality; a new category invalidates the subcategory.
          if ('district' in changes && !('locality' in changes)) next.delete('locality');
          if ('district' in changes && !('city' in changes)) next.delete('city');
          if ('category' in changes && !('sub' in changes)) next.delete('sub');
          return next;
        },
        { replace: !('page' in changes) && !('letter' in changes) },
      );
    },
    [setParams],
  );

  const clear = useCallback(
    (keep: ListingParamKey[] = ['view']) => {
      setParams((prev) => {
        const next = new URLSearchParams();
        for (const key of keep) {
          const value = prev.get(key);
          if (value) next.set(key, value);
        }
        return next;
      });
    },
    [setParams],
  );

  return { filters, update, clear };
}

export type ListingFilters = ReturnType<typeof useListingParams>['filters'];

/** Maps URL filters (plus any route-locked values) onto a service query. */
export function toBusinessQuery(filters: ListingFilters, locked: Partial<BusinessQuery> = {}): BusinessQuery {
  return {
    q: filters.q || undefined,
    district: filters.district || undefined,
    city: filters.city || undefined,
    locality: filters.locality || undefined,
    category: filters.category || undefined,
    subcategory: filters.sub || undefined,
    letter: filters.letter || undefined,
    verified: filters.verified || undefined,
    featured: filters.featured || undefined,
    openNow: filters.open || undefined,
    minRating: filters.rating || undefined,
    sort: filters.sort,
    page: filters.page,
    ...locked,
  };
}
