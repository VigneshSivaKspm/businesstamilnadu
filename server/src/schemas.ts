import { z } from 'zod';
import { categories, subcategories } from '../../src/data/categories.ts';
import { districts } from '../../src/data/districts.ts';
import { isValidEmail, isValidIndianPhone, isValidUrl } from '../../src/utils/validation.ts';

const categoryIds = new Set(categories.map((c) => c.slug));
const subcategoryIds = new Set(subcategories.map((s) => s.slug));
const districtIds = new Set(districts.map((d) => d.slug));

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const optionalText = (max: number) => text(max).optional().default('');

const phone = text(20).refine(isValidIndianPhone, 'Enter a valid 10-digit phone number.');
const optionalPhone = text(20)
  .optional()
  .default('')
  .refine((v) => !v || isValidIndianPhone(v), 'Enter a valid 10-digit phone number.');
const optionalEmail = text(200)
  .optional()
  .default('')
  .refine((v) => !v || isValidEmail(v), 'Enter a valid email address.');

/** Accepts "www.example.com" and stores "https://www.example.com". */
export const normalizeUrl = (v: string) => (!v ? '' : /^https?:\/\//i.test(v) ? v : `https://${v}`);
const optionalUrl = text(300)
  .optional()
  .default('')
  .refine((v) => !v || isValidUrl(v), 'Enter a valid web address.')
  .transform(normalizeUrl);
const imageUrl = text(500).refine((v) => /^https:\/\/.+/i.test(v), 'Use an https:// image URL.');

const categoryId = z.string().refine((v) => categoryIds.has(v), 'Choose a valid category.');
const subcategoryId = z.string().refine((v) => subcategoryIds.has(v), 'Choose a valid subcategory.');
const districtId = z.string().refine((v) => districtIds.has(v), 'Choose a valid district.');
const pinCode = z.string().trim().regex(/^6\d{5}$/, 'Enter a valid 6-digit Tamil Nadu PIN code.');

/** Hidden form field that real visitors never fill in. */
const honeypot = z.string().optional();

export const registrationInput = z.object({
  businessName: text(120).min(2, 'Enter your business name.'),
  categoryId,
  subcategoryId,
  yearEstablished: optionalText(4).refine(
    (v) => !v || (/^\d{4}$/.test(v) && +v >= 1800 && +v <= new Date().getFullYear()),
    'Enter a valid year.',
  ),
  shortDescription: text(300).min(30, 'Describe your business in at least 30 characters.'),
  district: districtId,
  city: text(80).min(2, 'Enter your city or town.'),
  locality: optionalText(80),
  address: text(300).min(10, 'Enter the full address.'),
  pinCode,
  contactPerson: text(80).min(2, 'Enter the contact person’s name.'),
  phone,
  whatsapp: optionalPhone,
  email: optionalEmail,
  website: optionalUrl,
  services: optionalText(1000),
  openingHours: optionalText(200),
  serviceAreas: optionalText(300),
  logoFileName: optionalText(200),
  coverFileName: optionalText(200),
  galleryFileNames: z.array(text(200)).max(8).optional().default([]),
  confirmAccuracy: z.literal(true, { error: 'Please confirm that the information is accurate.' }),
  hp: honeypot,
});
export type RegistrationInputParsed = z.infer<typeof registrationInput>;

export const CONTACT_SUBJECTS = ['general', 'listing', 'claim', 'advertising', 'correction', 'support'] as const;

export const contactInput = z.object({
  name: text(80).min(2, 'Enter your name.'),
  email: text(200).refine(isValidEmail, 'Enter a valid email address.'),
  phone: optionalPhone,
  subject: z.enum(CONTACT_SUBJECTS, { error: 'Choose a subject.' }),
  message: text(5000).min(20, 'Please write at least 20 characters.'),
  businessSlug: z
    .string()
    .regex(/^[a-z0-9-]{1,120}$/)
    .optional(),
  hp: honeypot,
});

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24-hour).');
const dayHours = z
  .object({ open: time, close: time })
  .refine((d) => d.open < d.close, { message: 'Closing time must be after opening time.', path: ['close'] })
  .nullable();

export const businessInput = z.object({
  name: text(120).min(2, 'Enter the business name.'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.')
    .max(120)
    .optional()
    .or(z.literal('')),
  categoryId,
  subcategoryIds: z.array(subcategoryId).max(12, 'Choose up to 12 subcategories.').default([]),
  district: districtId,
  city: optionalText(80),
  locality: optionalText(80),
  address: optionalText(300),
  pinCode: z.string().trim().regex(/^(6\d{5})?$/, 'Enter a valid 6-digit Tamil Nadu PIN code.').optional().default(''),
  description: text(5000).min(20, 'Write at least 20 characters.'),
  shortDescription: optionalText(300),
  contactPerson: optionalText(80),
  phone: optionalPhone,
  whatsapp: optionalPhone,
  email: optionalEmail,
  website: optionalUrl,
  logo: z.union([imageUrl, z.literal('')]).optional().default(''),
  coverImage: z.union([imageUrl, z.literal('')]).optional().default(''),
  photos: z.array(imageUrl).max(12, 'Up to 12 photos.').default([]),
  services: z.array(text(120).min(1)).max(40).default([]),
  serviceAreas: z.array(text(80).min(1)).max(40).default([]),
  yearEstablished: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
  openingHours: z
    .object({ mon: dayHours, tue: dayHours, wed: dayHours, thu: dayHours, fri: dayHours, sat: dayHours, sun: dayHours })
    .partial()
    .optional()
    .nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  plan: z.enum(['free', 'verified', 'featured', 'premium']).default('free'),
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).default('approved'),
  isDemo: z.boolean().default(false),
});
export type BusinessInputParsed = z.infer<typeof businessInput>;

export const businessPatch = z
  .object({
    verified: z.boolean(),
    featured: z.boolean(),
    status: z.enum(['pending', 'approved', 'rejected', 'suspended']),
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update.');

export const listQuery = z.object({
  q: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const loginInput = z.object({
  email: z.string().trim().toLowerCase().max(200),
  password: z.string().min(1, 'Enter your password.').max(200),
});

export const passwordChangeInput = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.').max(200),
  newPassword: z.string().min(10, 'Use at least 10 characters.').max(200),
});

export const approveInput = z.object({
  verified: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export const rejectInput = z.object({
  reason: text(500).min(3, 'Give a short reason.'),
});

export const notesInput = z.object({ notes: text(2000) });

export const messagePatch = z.object({ status: z.enum(['new', 'read', 'archived']) });

export { categories, districts };
