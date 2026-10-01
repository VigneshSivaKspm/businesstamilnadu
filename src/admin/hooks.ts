import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiError } from '@/lib/api';

interface ApiState<T> {
  data: T | undefined;
  error: ApiError | null;
  loading: boolean;
}

/**
 * Fetches admin data whenever `key` changes. Unlike the public `useQuery`,
 * results are never cached across screens — admin views always show fresh data.
 */
export function useApi<T>(key: string, fetcher: () => Promise<T>) {
  const [state, setState] = useState<ApiState<T>>({ data: undefined, error: null, loading: true });
  const [version, setVersion] = useState(0);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    fetcherRef
      .current()
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error: unknown) => {
        if (cancelled) return;
        const apiError = error instanceof ApiError ? error : new ApiError(0, String(error));
        setState((s) => ({ ...s, error: apiError, loading: false }));
      });
    return () => {
      cancelled = true;
    };
  }, [key, version]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    setVersion((v) => v + 1);
  }, []);

  const setData = useCallback((update: (data: T | undefined) => T | undefined) => {
    setState((s) => ({ ...s, data: update(s.data) }));
  }, []);

  return { ...state, reload, setData };
}

/** "3 min ago", "Yesterday", "12 Sep 2026". */
export function timeAgo(iso: string | undefined): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minute = 60_000;
  if (diff < minute) return 'Just now';
  if (diff < 60 * minute) return `${Math.floor(diff / minute)} min ago`;
  if (diff < 24 * 60 * minute) return `${Math.floor(diff / (60 * minute))} h ago`;
  if (diff < 48 * 60 * minute) return 'Yesterday';
  if (diff < 7 * 24 * 60 * minute) return `${Math.floor(diff / (24 * 60 * minute))} days ago`;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export const formatDateTime = (iso: string | undefined) =>
  iso
    ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
        new Date(iso),
      )
    : '—';

/** URL-backed list state (filters, search, page) for admin tables. */
export function useAdminParams<K extends string>(defaults: Record<K, string>) {
  const [params, setParams] = useSearchParams();
  const values = Object.fromEntries(
    (Object.keys(defaults) as K[]).map((k) => [k, params.get(k) ?? defaults[k]]),
  ) as Record<K, string>;
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);

  const set = (changes: Partial<Record<K | 'page', string | number>>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(changes) as Array<[string, string | number | undefined]>) {
          const value = v === undefined ? '' : String(v);
          if (!value || value === (defaults as Record<string, string>)[k] || (k === 'page' && value === '1')) next.delete(k);
          else next.set(k, value);
        }
        if (!('page' in changes)) next.delete('page');
        return next;
      },
      { replace: !('page' in changes) },
    );

  return { values, page, set, key: params.toString() };
}
