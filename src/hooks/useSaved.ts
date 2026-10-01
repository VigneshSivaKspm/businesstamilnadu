import { useSyncExternalStore } from 'react';
import { savedService } from '@/services';

/** Saved state for one business, synced across all mounted components. */
export function useSaved(slug: string) {
  const saved = useSyncExternalStore(savedService.subscribe, () => savedService.has(slug), () => false);
  return { saved, toggle: () => savedService.toggle(slug) };
}
