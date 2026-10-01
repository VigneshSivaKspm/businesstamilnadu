/**
 * Central site configuration. Contact details, social links and headline
 * counters live here so they are never repeated by hand inside components.
 *
 * Values marked "configure before launch" are placeholders.
 */

const envUrl = import.meta.env.VITE_SITE_URL as string | undefined;

export const site = {
  name: 'Business Tamil Nadu',
  shortName: 'BTN',
  domain: 'businesstamilnadu.in',
  url: (envUrl ?? 'https://businesstamilnadu.in').replace(/\/$/, ''),
  tagline: 'Discover. Connect. Grow.',
  positioning: "Tamil Nadu's Statewide Business Discovery Platform",
  description:
    "Tamil Nadu's business discovery platform connecting customers with businesses, professionals and services across the state.",
  defaultMetaDescription:
    'Find trusted businesses, professionals, services and local experts across every district of Tamil Nadu.',
  locale: 'en_IN',
  /** Absolute URL of a 1200×630 social sharing image. Configure before launch. */
  ogImage: '' as string,

  contact: {
    // Configure before launch.
    email: 'hello@businesstamilnadu.in',
    supportEmail: 'support@businesstamilnadu.in',
    phone: '+91 90000 12345',
    whatsapp: '919000012345',
    officeName: 'Business Tamil Nadu',
    address: 'Tamil Nadu, India',
    supportHours: 'Monday – Saturday, 9:30 AM – 6:30 PM IST',
  },

  // Configure before launch.
  social: {
    facebook: 'https://www.facebook.com/businesstamilnadu',
    instagram: 'https://www.instagram.com/businesstamilnadu',
    linkedin: 'https://www.linkedin.com/company/businesstamilnadu',
    youtube: 'https://www.youtube.com/@businesstamilnadu',
  },

  /**
   * Headline counters shown in the trust metrics section. These are launch
   * targets supplied by the business, not live counts — update them as the
   * real directory grows.
   */
  stats: [
    { id: 'businesses', value: 5000, suffix: '+', label: 'Businesses', description: 'Listed across the state' },
    { id: 'categories', value: 300, suffix: '+', label: 'Categories', description: 'Services and industries' },
    { id: 'districts', value: 38, suffix: '', label: 'Districts', description: 'Every district covered' },
    { id: 'cities', value: 100, suffix: '+', label: 'Cities & Towns', description: 'From metros to market towns' },
  ],

  /** While true, sample listings are labelled as demo data across the UI. */
  demoMode: true,

  copyrightYear: 2026,
  foundedYear: 2026,

  listing: {
    pageSize: 12,
  },
} as const;

export type SiteConfig = typeof site;

export const mainNav = [
  { label: 'Home', to: '/' },
  { label: 'Explore Businesses', shortLabel: 'Businesses', to: '/businesses' },
  { label: 'Categories', to: '/categories' },
  { label: 'Districts', to: '/districts' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
] as const;

export const popularSearches = ['Doctors', 'Restaurants', 'Builders', 'Hotels', 'Education', 'Travels'] as const;

export const heroSearchExamples = [
  'Doctors',
  'Builders',
  'Hotels',
  'Lawyers',
  'Restaurants',
  'Travels',
  'Schools',
  'Digital Marketing',
] as const;

export const VERIFIED_EXPLANATION =
  'Verification means submitted business information has been reviewed by the Business Tamil Nadu team. It is not a government certification.';
