import type { Business, DayHours, ListingPlan, ListingStatus, Weekday } from '@/types';
import { WEEKDAYS } from '@/utils/hours';
import type { BusinessPayload } from '../api';

export interface DayForm {
  closed: boolean;
  open: string;
  close: string;
}

/** Editor state: every field as a form-friendly primitive. */
export interface ListingForm {
  name: string;
  slug: string;
  categoryId: string;
  subcategoryIds: string[];
  shortDescription: string;
  description: string;
  district: string;
  city: string;
  locality: string;
  address: string;
  pinCode: string;
  latitude: string;
  longitude: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  services: string;
  serviceAreas: string;
  yearEstablished: string;
  hoursEnabled: boolean;
  hours: Record<Weekday, DayForm>;
  logo: string;
  coverImage: string;
  photos: string;
  status: ListingStatus;
  verified: boolean;
  featured: boolean;
  plan: ListingPlan;
  isDemo: boolean;
}

const defaultDay = (day: Weekday): DayForm => ({ closed: day === 'sun', open: '09:00', close: '18:00' });

export const emptyListing = (): ListingForm => ({
  name: '',
  slug: '',
  categoryId: '',
  subcategoryIds: [],
  shortDescription: '',
  description: '',
  district: '',
  city: '',
  locality: '',
  address: '',
  pinCode: '',
  latitude: '',
  longitude: '',
  contactPerson: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  services: '',
  serviceAreas: '',
  yearEstablished: '',
  hoursEnabled: false,
  hours: Object.fromEntries(WEEKDAYS.map((d) => [d, defaultDay(d)])) as Record<Weekday, DayForm>,
  logo: '',
  coverImage: '',
  photos: '',
  status: 'approved',
  verified: false,
  featured: false,
  plan: 'free',
  isDemo: false,
});

export function toForm(b: Business): ListingForm {
  const base = emptyListing();
  const hours = b.openingHours;
  return {
    ...base,
    name: b.name,
    slug: b.slug,
    categoryId: b.categoryId,
    subcategoryIds: b.subcategoryIds ?? [],
    shortDescription: b.shortDescription ?? '',
    description: b.description,
    district: b.district,
    city: b.city ?? '',
    locality: b.locality ?? '',
    address: b.address ?? '',
    pinCode: b.pinCode ?? '',
    latitude: b.latitude?.toString() ?? '',
    longitude: b.longitude?.toString() ?? '',
    contactPerson: b.contactPerson ?? '',
    phone: b.phone ?? '',
    whatsapp: b.whatsapp ?? '',
    email: b.email ?? '',
    website: b.website ?? '',
    services: (b.services ?? []).join('\n'),
    serviceAreas: (b.serviceAreas ?? []).join('\n'),
    yearEstablished: b.yearEstablished?.toString() ?? '',
    hoursEnabled: Boolean(hours && Object.keys(hours).length),
    hours: hours
      ? (Object.fromEntries(
          WEEKDAYS.map((d) => {
            const day = hours[d];
            return [d, day ? { closed: false, open: day.open, close: day.close } : { ...defaultDay(d), closed: day === null || day === undefined }];
          }),
        ) as Record<Weekday, DayForm>)
      : base.hours,
    logo: b.logo ?? '',
    coverImage: b.coverImage ?? '',
    photos: (b.photos ?? []).join('\n'),
    status: b.status ?? 'approved',
    verified: b.verified,
    featured: b.featured,
    plan: b.plan ?? 'free',
    isDemo: Boolean(b.isDemo),
  };
}

const lines = (value: string) =>
  value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

const num = (value: string) => (value.trim() === '' ? null : Number(value));

export function toPayload(f: ListingForm): BusinessPayload {
  const openingHours = f.hoursEnabled
    ? (Object.fromEntries(WEEKDAYS.map((d) => [d, f.hours[d].closed ? null : ({ open: f.hours[d].open, close: f.hours[d].close } satisfies DayHours)])) as Business['openingHours'])
    : undefined;
  return {
    name: f.name.trim(),
    slug: f.slug.trim(),
    categoryId: f.categoryId,
    subcategoryIds: f.subcategoryIds,
    shortDescription: f.shortDescription.trim(),
    description: f.description.trim(),
    district: f.district,
    city: f.city.trim(),
    locality: f.locality.trim(),
    address: f.address.trim(),
    pinCode: f.pinCode.trim(),
    latitude: num(f.latitude) ?? undefined,
    longitude: num(f.longitude) ?? undefined,
    contactPerson: f.contactPerson.trim(),
    phone: f.phone.trim(),
    whatsapp: f.whatsapp.trim(),
    email: f.email.trim(),
    website: f.website.trim(),
    services: lines(f.services),
    serviceAreas: lines(f.serviceAreas),
    yearEstablished: num(f.yearEstablished) ?? undefined,
    openingHours,
    logo: f.logo.trim(),
    coverImage: f.coverImage.trim(),
    photos: lines(f.photos),
    status: f.status,
    verified: f.verified,
    featured: f.featured,
    plan: f.plan,
    isDemo: f.isDemo,
  };
}

/** Maps a server error path ("openingHours.mon.close", "photos.2") to the form field that shows it. */
export function fieldForErrorPath(path: string): string {
  if (path.startsWith('openingHours.')) return path.split('.').slice(0, 2).join('.');
  return path.split('.')[0];
}
