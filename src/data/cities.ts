import { slugify } from '@/lib/slug';
import type { City } from '@/types';

/**
 * Cities and towns. These are a separate layer from districts: a district can
 * contain many cities/towns (e.g. Krishnagiri → Hosur), and each city has
 * its own localities seeded on the district record.
 */
type CitySeed = [name: string, districtSlug: string, type: City['type'], isHub?: boolean, tagline?: string];

const seeds: CitySeed[] = [
  ['Chennai', 'chennai', 'city', true, 'IT, finance, healthcare and manufacturing'],
  ['Coimbatore', 'coimbatore', 'city', true, 'Engineering, textiles and startups'],
  ['Madurai', 'madurai', 'city', true, 'Trade, healthcare and hospitality'],
  ['Tiruchirappalli', 'tiruchirappalli', 'city', true, 'Fabrication, education and trade'],
  ['Salem', 'salem', 'city', true, 'Steel, textiles and commerce'],
  ['Tiruppur', 'tiruppur', 'city', true, 'Knitwear and garment exports'],
  ['Erode', 'erode', 'city', true, 'Textiles and turmeric trade'],
  ['Vellore', 'vellore', 'city', true, 'Healthcare and higher education'],
  ['Thanjavur', 'thanjavur', 'city', true, 'Agro-processing and heritage crafts'],
  ['Tirunelveli', 'tirunelveli', 'city', true, 'Trade, education and energy'],
  ['Tambaram', 'chengalpattu', 'city'],
  ['Hosur', 'krishnagiri', 'city', false, 'Automobile and electronics manufacturing'],
  ['Nagercoil', 'kanniyakumari', 'city'],
  ['Thoothukudi', 'thoothukudi', 'city'],
  ['Karur', 'karur', 'city'],
  ['Dindigul', 'dindigul', 'city'],
  ['Kumbakonam', 'thanjavur', 'town'],
  ['Karaikudi', 'sivaganga', 'town'],
  ['Sivakasi', 'virudhunagar', 'town'],
  ['Pollachi', 'coimbatore', 'town'],
  ['Avadi', 'tiruvallur', 'city'],
  ['Ooty', 'nilgiris', 'town'],
  ['Namakkal', 'namakkal', 'town'],
  ['Kanchipuram', 'kanchipuram', 'town'],
  ['Cuddalore', 'cuddalore', 'town'],
  ['Pudukkottai', 'pudukkottai', 'town'],
];

export const cities: City[] = seeds.map(([name, districtSlug, type, isHub, tagline]) => ({
  id: slugify(name),
  slug: slugify(name),
  name,
  districtSlug,
  type,
  isHub,
  tagline,
}));
