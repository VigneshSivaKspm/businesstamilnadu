import type { RegistrationInput } from '@/types';
import { isValidEmail, isValidIndianPhone, isValidUrl } from '@/utils/validation';

export type FormErrors = Partial<Record<keyof RegistrationInput, string>>;

export const emptyRegistration: RegistrationInput = {
  businessName: '',
  categoryId: '',
  subcategoryId: '',
  yearEstablished: '',
  shortDescription: '',
  district: '',
  city: '',
  locality: '',
  address: '',
  pinCode: '',
  contactPerson: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  services: '',
  openingHours: '',
  serviceAreas: '',
  logoFileName: '',
  coverFileName: '',
  galleryFileNames: [],
  confirmAccuracy: false,
};

export const STEPS = [
  { id: 'basics', title: 'Basic Information', short: 'Basics' },
  { id: 'location', title: 'Location', short: 'Location' },
  { id: 'contact', title: 'Contact', short: 'Contact' },
  { id: 'details', title: 'Business Details', short: 'Details' },
  { id: 'media', title: 'Media', short: 'Media' },
  { id: 'review', title: 'Review & Submit', short: 'Review' },
] as const;

const STEP_FIELDS: Array<Array<keyof RegistrationInput>> = [
  ['businessName', 'categoryId', 'subcategoryId', 'yearEstablished', 'shortDescription'],
  ['district', 'city', 'locality', 'address', 'pinCode'],
  ['contactPerson', 'phone', 'whatsapp', 'email', 'website'],
  ['services', 'openingHours', 'serviceAreas'],
  ['logoFileName', 'coverFileName', 'galleryFileNames'],
  ['confirmAccuracy'],
];

/** Which form step a field lives on (for routing server-side errors). */
export const stepOfField = (field: string) => STEP_FIELDS.findIndex((fields) => fields.includes(field as keyof RegistrationInput));

export const DESCRIPTION_MIN = 30;
export const DESCRIPTION_MAX = 300;

/** Validates only the fields that belong to one step. */
export function validateStep(step: number, v: RegistrationInput): FormErrors {
  const e: FormErrors = {};
  const currentYear = new Date().getFullYear();

  if (step === 0) {
    if (v.businessName.trim().length < 2) e.businessName = 'Enter your business name.';
    else if (v.businessName.trim().length > 120) e.businessName = 'Keep the name under 120 characters.';
    if (!v.categoryId) e.categoryId = 'Choose the category that best fits your business.';
    if (!v.subcategoryId) e.subcategoryId = 'Choose a subcategory.';
    if (v.yearEstablished) {
      const year = Number(v.yearEstablished);
      if (!Number.isInteger(year) || year < 1800 || year > currentYear) e.yearEstablished = `Enter a year between 1800 and ${currentYear}.`;
    }
    const len = v.shortDescription.trim().length;
    if (len < DESCRIPTION_MIN) e.shortDescription = `Describe your business in at least ${DESCRIPTION_MIN} characters.`;
    else if (len > DESCRIPTION_MAX) e.shortDescription = `Keep the description under ${DESCRIPTION_MAX} characters.`;
  }

  if (step === 1) {
    if (!v.district) e.district = 'Select your district.';
    if (v.city.trim().length < 2) e.city = 'Enter your city or town.';
    if (v.address.trim().length < 10) e.address = 'Enter the full address, including street and area.';
    if (!/^6\d{5}$/.test(v.pinCode.trim())) e.pinCode = 'Enter a valid 6-digit Tamil Nadu PIN code (starts with 6).';
  }

  if (step === 2) {
    if (v.contactPerson.trim().length < 2) e.contactPerson = 'Enter the name of the contact person.';
    if (!isValidIndianPhone(v.phone)) e.phone = 'Enter a valid 10-digit phone number.';
    if (v.whatsapp && !isValidIndianPhone(v.whatsapp)) e.whatsapp = 'Enter a valid 10-digit WhatsApp number.';
    if (v.email && !isValidEmail(v.email.trim())) e.email = 'Enter a valid email address.';
    if (v.website && !isValidUrl(v.website.trim())) e.website = 'Enter a valid website address, e.g. www.example.com';
  }

  if (step === 5) {
    if (!v.confirmAccuracy) e.confirmAccuracy = 'Please confirm that the information is accurate.';
  }

  return e;
}

/** Plain-text summary used for the email/WhatsApp hand-off. */
export function summarize(v: RegistrationInput, labels: { category: string; subcategory: string; district: string }) {
  return [
    `Business: ${v.businessName}`,
    `Category: ${labels.category} › ${labels.subcategory}`,
    v.yearEstablished && `Established: ${v.yearEstablished}`,
    `Description: ${v.shortDescription}`,
    `District: ${labels.district}`,
    `City / Town: ${v.city}`,
    v.locality && `Locality: ${v.locality}`,
    `Address: ${v.address} – ${v.pinCode}`,
    `Contact person: ${v.contactPerson}`,
    `Phone: ${v.phone}`,
    v.whatsapp && `WhatsApp: ${v.whatsapp}`,
    v.email && `Email: ${v.email}`,
    v.website && `Website: ${v.website}`,
    v.services && `Services: ${v.services}`,
    v.openingHours && `Hours: ${v.openingHours}`,
    v.serviceAreas && `Service areas: ${v.serviceAreas}`,
  ]
    .filter(Boolean)
    .join('\n');
}
