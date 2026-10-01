import { useEffect, useState } from 'react';

const cache = new Map<string, unknown>();

interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/**
 * Minimal async data hook with an in-memory cache keyed by `key`.
 * Cached results render synchronously (no skeleton flash on back navigation);
 * while a new key loads, the previous data is kept so lists don't jump.
 */
export function useQuery<T>(key: string, fetcher: () => Promise<T>): QueryState<T> & { reload: () => void } {
  const [state, setState] = useState<QueryState<T> & { key: string }>(() => ({
    key,
    data: cache.get(key) as T | undefined,
    loading: !cache.has(key),
    error: null,
  }));
  const [attempt, setAttempt] = useState(0);

  // Adjust state during render when the key changes (React-recommended pattern).
  if (state.key !== key) {
    const cached = cache.get(key) as T | undefined;
    setState({ key, data: cached ?? state.data, loading: !cache.has(key), error: null });
  }

  useEffect(() => {
    if (cache.has(key)) return;
    let cancelled = false;
    fetcher()
      .then((data) => {
        cache.set(key, data);
        if (!cancelled) setState({ key, data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setState((s) => ({
            ...s,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the key fully describes the request
  }, [key, attempt]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    reload: () => {
      cache.delete(key);
      setState((s) => ({ ...s, loading: true, error: null }));
      setAttempt((a) => a + 1);
    },
  };
}
