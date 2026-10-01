import { USE_API, apiRequest } from '@/lib/api';
import type { Business } from '@/types';

/**
 * Storage adapter for business listings. `USE_API` (VITE_USE_API) selects the
 * API adapter; otherwise bundled sample data is served — useful for demos and
 * frontend-only development (`npm run dev:web -- --mode demo`).
 *
 * Reference data (districts, cities, categories) is small and changes rarely,
 * so it is bundled with the app and read synchronously by the services.
 */
export interface BusinessDataSource {
  listBusinesses(): Promise<Business[]>;
}

const localDataSource: BusinessDataSource = {
  // Loaded on demand so sample data isn't shipped in API mode.
  listBusinesses: async () => (await import('@/data/businesses')).businesses,
};

const CACHE_MS = 60_000;

/** Fetches all live listings once and reuses them for a minute. */
function createApiDataSource(): BusinessDataSource {
  let cached: { at: number; promise: Promise<Business[]> } | null = null;
  return {
    listBusinesses() {
      if (cached && Date.now() - cached.at < CACHE_MS) return cached.promise;
      const promise = apiRequest<{ items: Business[] }>('/businesses').then((r) => r.items);
      cached = { at: Date.now(), promise };
      // Don't cache failures — the next call retries.
      promise.catch(() => {
        if (cached?.promise === promise) cached = null;
      });
      return promise;
    },
  };
}

let activeSource: BusinessDataSource = USE_API ? createApiDataSource() : localDataSource;

export const getDataSource = () => activeSource;

/** Swap the adapter at startup, e.g. for tests or a different backend. */
export const setDataSource = (source: BusinessDataSource) => {
  activeSource = source;
};
