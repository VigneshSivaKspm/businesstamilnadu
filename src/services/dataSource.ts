import { businesses } from '@/data/businesses';
import type { Business } from '@/types';

/**
 * Storage adapter for business listings. The local adapter serves bundled
 * sample data; a Firestore, Supabase or REST adapter only needs to implement
 * this interface and be returned from `getDataSource()`.
 *
 * Reference data (districts, cities, categories) is small and changes rarely,
 * so it is bundled with the app and read synchronously by the services.
 */
export interface BusinessDataSource {
  listBusinesses(): Promise<Business[]>;
}

const localDataSource: BusinessDataSource = {
  listBusinesses: async () => businesses,
};

let activeSource: BusinessDataSource = localDataSource;

export const getDataSource = () => activeSource;

/** Swap the adapter at startup, e.g. `setDataSource(createFirestoreSource(db))`. */
export const setDataSource = (source: BusinessDataSource) => {
  activeSource = source;
};
