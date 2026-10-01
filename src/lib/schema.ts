import { site } from '@/config/site';
import type { Business } from '@/types';
import { WEEKDAYS, WEEKDAY_LABELS } from '@/utils/hours';

/**
 * schema.org JSON-LD builders. Only valid, truthful properties are emitted —
 * fictional demo listings never produce LocalBusiness markup.
 */

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: site.url,
  logo: `${site.url}/favicon.svg`,
  email: site.contact.email,
  sameAs: Object.values(site.social),
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: site.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${site.url}${item.path}`,
  })),
});

export const itemListSchema = (name: string, businesses: Business[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: businesses.map((b, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${site.url}/business/${b.slug}`,
    name: b.name,
  })),
});

export function localBusinessSchema(business: Business) {
  if (business.isDemo) return null;
  const hours = business.openingHours;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.shortDescription ?? business.description,
    url: business.website ?? `${site.url}/business/${business.slug}`,
    telephone: business.phone,
    email: business.email,
    image: business.logo,
    foundingDate: business.yearEstablished ? String(business.yearEstablished) : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      postalCode: business.pinCode,
      addressRegion: 'Tamil Nadu',
      addressCountry: 'IN',
    },
    geo:
      business.latitude && business.longitude
        ? { '@type': 'GeoCoordinates', latitude: business.latitude, longitude: business.longitude }
        : undefined,
    openingHoursSpecification: hours
      ? WEEKDAYS.filter((d) => hours[d]).map((d) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: WEEKDAY_LABELS[d],
          opens: hours[d]!.open,
          closes: hours[d]!.close,
        }))
      : undefined,
  };
}
