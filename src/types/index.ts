/**
 * Domain models for Business Tamil Nadu.
 *
 * These shapes are deliberately storage-agnostic: every entity has a string
 * `id` and only serialisable fields, so they map 1:1 onto Firestore documents,
 * Supabase rows or REST payloads when a backend is connected.
 */

export type ISODateString = string;

/* ------------------------------------------------------------------ */
/* Geography: District → City/Town → Locality                          */
/* ------------------------------------------------------------------ */

export type Region = 'north' | 'west' | 'central' | 'south';

export interface District {
  id: string;
  name: string;
  slug: string;
  /** Tamil name, ready for a future Tamil-language interface. */
  nameTa?: string;
  region: Region;
  /** District headquarters coordinates (approximate). */
  latitude: number;
  longitude: number;
  featured: boolean;
  /** Number of live listings. Derived by the service layer, never hand-maintained. */
  businessCount?: number;
  image?: string;
  description?: string;
  /** Seeded localities; extend progressively rather than all at once. */
  localities?: string[];
}

export interface City {
  id: string;
  name: string;
  slug: string;
  districtSlug: string;
  type: 'city' | 'town';
  /** Shown in "Popular Business Hubs". */
  isHub?: boolean;
  tagline?: string;
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export type CategoryIconKey =
  | 'professional'
  | 'healthcare'
  | 'real-estate'
  | 'education'
  | 'food'
  | 'travel'
  | 'automobile'
  | 'home-services'
  | 'events'
  | 'beauty'
  | 'technology'
  | 'manufacturing'
  | 'agriculture'
  | 'retail'
  | 'finance'
  | 'media'
  | 'logistics';

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  /** All parent categories this subcategory appears under (first is primary). */
  categoryIds: string[];
  /** Extra search terms (e.g. "dentist" → "Dental Clinics"). */
  keywords?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: CategoryIconKey;
  description: string;
  featured: boolean;
  /** Short plural label used in headings, e.g. "Healthcare Providers". */
  pluralLabel?: string;
  subcategories: Subcategory[];
}

/** A category route can resolve to either a top-level category or a subcategory. */
export type ResolvedCategory =
  | { kind: 'category'; category: Category }
  | { kind: 'subcategory'; subcategory: Subcategory; parent: Category };

/* ------------------------------------------------------------------ */
/* Businesses                                                          */
/* ------------------------------------------------------------------ */

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayHours {
  open: string; // "09:00"
  close: string; // "18:30"
}

/** `null` means closed that day. */
export type OpeningHours = Partial<Record<Weekday, DayHours | null>>;

export type ListingPlan = 'free' | 'verified' | 'featured' | 'premium';
export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Business {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  coverImage?: string;

  categoryId: string;
  categoryName: string;
  subcategoryIds?: string[];

  district: string; // district slug
  city?: string;
  locality?: string;
  address?: string;
  pinCode?: string;

  description: string;
  shortDescription?: string;

  contactPerson?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;

  verified: boolean;
  featured: boolean;
  plan?: ListingPlan;
  status?: ListingStatus;

  rating?: number;
  reviewCount?: number;

  services?: string[];
  serviceAreas?: string[];
  photos?: string[];
  yearEstablished?: number;
  openingHours?: OpeningHours;

  latitude?: number;
  longitude?: number;

  views?: number;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;

  /** True for fictional sample listings shown before real data is connected. */
  isDemo?: boolean;
  ownerId?: string;
  /** Registration this listing was created from, if any. */
  registrationId?: string;
}

/* ------------------------------------------------------------------ */
/* Listing queries                                                     */
/* ------------------------------------------------------------------ */

export type SortOption = 'recommended' | 'az' | 'recent' | 'views' | 'featured';

export interface BusinessQuery {
  q?: string;
  district?: string;
  city?: string;
  locality?: string;
  category?: string;
  subcategory?: string;
  letter?: string;
  verified?: boolean;
  featured?: boolean;
  openNow?: boolean;
  minRating?: number;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/* ------------------------------------------------------------------ */
/* Search suggestions                                                  */
/* ------------------------------------------------------------------ */

export type SuggestionType = 'category' | 'business' | 'district';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  label: string;
  sublabel?: string;
  href: string;
}

/* ------------------------------------------------------------------ */
/* Submissions & future collections                                    */
/* ------------------------------------------------------------------ */

export interface RegistrationInput {
  businessName: string;
  categoryId: string;
  subcategoryId: string;
  yearEstablished: string;
  shortDescription: string;

  district: string;
  city: string;
  locality: string;
  address: string;
  pinCode: string;

  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;

  services: string;
  openingHours: string;
  serviceAreas: string;

  logoFileName: string;
  coverFileName: string;
  galleryFileNames: string[];

  confirmAccuracy: boolean;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Registration extends Omit<RegistrationInput, 'confirmAccuracy'> {
  id: string;
  reference: string;
  status: RegistrationStatus;
  submittedAt: ISODateString;
  /** Where the submission currently lives. */
  storage: 'local' | 'remote';
  /** Admin review fields. */
  reviewedAt?: ISODateString;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
  businessId?: string;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export type MessageStatus = 'new' | 'read' | 'archived';

export interface ContactMessage extends ContactMessageInput {
  id: string;
  createdAt: ISODateString;
  storage: 'local' | 'remote';
  status?: MessageStatus;
  /** Listing the message refers to (e.g. claim requests). */
  businessSlug?: string;
}

/* Prepared for future collections: users, reviews, leads, plans, payments. */

export type UserRole = 'visitor' | 'owner' | 'admin';

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  lastLoginAt?: ISODateString;
}

export interface AdminStats {
  registrations: Record<RegistrationStatus, number>;
  messages: Record<MessageStatus, number>;
  businesses: { total: number; approved: number; suspended: number; verified: number; featured: number; demo: number };
}

export interface ActivityEntry {
  id: string;
  at: ISODateString;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'business' | 'registration' | 'message' | 'admin';
  targetId: string;
  summary: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  businessIds?: string[];
  createdAt: ISODateString;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  title?: string;
  body: string;
  status: 'pending' | 'published' | 'hidden';
  createdAt: ISODateString;
}

export type LeadChannel = 'call' | 'whatsapp' | 'website' | 'directions' | 'form';

export interface Lead {
  id: string;
  businessId: string;
  channel: LeadChannel;
  createdAt: ISODateString;
}

export interface Plan {
  id: ListingPlan;
  name: string;
  priceInr: number;
  billing: 'monthly' | 'yearly' | 'one-time';
  features: string[];
}

export interface Payment {
  id: string;
  businessId: string;
  planId: ListingPlan;
  amountInr: number;
  status: 'created' | 'paid' | 'failed' | 'refunded';
  createdAt: ISODateString;
}
