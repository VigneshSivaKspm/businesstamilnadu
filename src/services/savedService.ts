import { storage } from '@/lib/storage';

const KEY = 'btn:saved-businesses';
const listeners = new Set<() => void>();
let cache: string[] | null = null;

const read = () => (cache ??= storage.get<string[]>(KEY, []));

/**
 * Saved businesses, kept in this browser only. When accounts arrive this
 * becomes a `favorites` collection keyed by user.
 */
export const savedService = {
  list: (): string[] => read(),
  has: (slug: string) => read().includes(slug),
  toggle(slug: string): boolean {
    const current = read();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current];
    cache = next;
    storage.set(KEY, next);
    listeners.forEach((l) => l());
    return next.includes(slug);
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
