/** Filter controls a listing page can show. */
export type FilterField =
  | 'q'
  | 'district'
  | 'city'
  | 'locality'
  | 'category'
  | 'subcategory'
  | 'verified'
  | 'featured'
  | 'open'
  | 'rating';

export const ALL_FILTER_FIELDS: FilterField[] = [
  'q',
  'district',
  'city',
  'locality',
  'category',
  'subcategory',
  'verified',
  'featured',
  'open',
  'rating',
];
