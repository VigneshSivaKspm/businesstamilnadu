import type { LeadChannel } from '@/types';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Analytics hook point. Events are pushed to `window.dataLayer` when a tag
 * manager is installed, and are otherwise ignored. When the business owner
 * dashboard ships, contact clicks can also be written to a `leads` collection.
 */
export const analyticsService = {
  trackLead(businessId: string, channel: LeadChannel) {
    window.dataLayer?.push({ event: 'business_contact', businessId, channel });
  },
  trackSearch(query: string, district?: string) {
    window.dataLayer?.push({ event: 'search', query, district });
  },
};
