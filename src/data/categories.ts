// Relative value imports keep this file loadable by the API server (Node type stripping has no path aliases).
import { slugify } from '../lib/slug.ts';
import type { Category, CategoryIconKey, Subcategory } from '../types/index.ts';

interface CategorySeed {
  name: string;
  slug: string;
  icon: CategoryIconKey;
  pluralLabel: string;
  featured: boolean;
  description: string;
  subcategories: string[];
}

/**
 * Master category taxonomy. Subcategory names may appear in more than one
 * group (e.g. "Architects", "Hotels"); they are de-duplicated by slug below so
 * every subcategory has exactly one canonical URL.
 */
const seeds: CategorySeed[] = [
  {
    name: 'Professional Services',
    slug: 'professional-services',
    icon: 'professional',
    pluralLabel: 'Professional Service Providers',
    featured: true,
    description:
      'Legal, accounting, tax, consulting and advisory professionals who help individuals and companies operate with confidence.',
    subcategories: [
      'Advocates', 'Lawyers', 'Chartered Accountants', 'Auditors', 'Company Secretaries', 'Tax Consultants',
      'GST Consultants', 'Business Consultants', 'Management Consultants', 'HR Consultants', 'Recruitment Agencies',
      'Legal Consultants', 'Financial Consultants', 'Architects', 'Interior Consultants', 'Engineering Consultants',
      'Documentation Services', 'Trademark Consultants', 'ISO Consultants', 'Insurance Advisors',
      'Investment Advisors', 'Business Brokers',
    ],
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    icon: 'healthcare',
    pluralLabel: 'Healthcare Providers',
    featured: true,
    description:
      'Hospitals, clinics, specialists, diagnostics, pharmacies and wellness practitioners across allopathy, Siddha, Ayurveda and homeopathy.',
    subcategories: [
      'Hospitals', 'Multi-Speciality Hospitals', 'Clinics', 'General Physicians', 'Dental Clinics', 'Dentists',
      'Dental Hospitals', 'Dental Labs', 'Siddha Hospitals', 'Ayurveda Clinics', 'Homeopathy', 'Physiotherapy',
      'Diagnostic Centres', 'Laboratories', 'Pharmacies', 'Medical Stores', 'Eye Hospitals', 'Ophthalmologists',
      'Skin Clinics', 'Dermatologists', 'ENT Specialists', 'Orthopaedics', 'Cardiologists', 'Paediatricians',
      'Gynaecologists', 'Fertility Clinics', 'Mental Wellness', 'Psychologists', 'Nutritionists', 'Dieticians',
      'Veterinary Hospitals', 'Veterinary Doctors', 'Ambulance Services', 'Home Nursing', 'Medical Equipment',
    ],
  },
  {
    name: 'Real Estate & Construction',
    slug: 'real-estate',
    icon: 'real-estate',
    pluralLabel: 'Real Estate & Construction Companies',
    featured: true,
    description:
      'Builders, promoters, agents, engineers, contractors and building-material suppliers for homes, commercial spaces and land.',
    subcategories: [
      'Builders', 'Developers', 'Promoters', 'Real Estate Agents', 'Property Consultants', 'Land Promoters',
      'Architects', 'Civil Engineers', 'Structural Engineers', 'Interior Designers', 'Building Contractors',
      'Electrical Contractors', 'Plumbing Contractors', 'Painting Contractors', 'Roofing', 'Waterproofing',
      'Building Materials', 'Cement Dealers', 'Steel Dealers', 'Tiles', 'Marbles', 'Granites', 'Sanitaryware',
      'Hardware Stores', 'Modular Kitchens', 'UPVC Windows', 'Aluminium Fabrication', 'Glass Works',
      'Borewell Services', 'Surveyors', 'Property Management',
    ],
  },
  {
    name: 'Education',
    slug: 'education',
    icon: 'education',
    pluralLabel: 'Education & Training Institutions',
    featured: true,
    description:
      'Schools, colleges, coaching centres, skill academies and study-abroad advisors for every stage of learning.',
    subcategories: [
      'Schools', 'CBSE Schools', 'Matriculation Schools', 'International Schools', 'Colleges', 'Engineering Colleges',
      'Arts & Science Colleges', 'Medical Colleges', 'Polytechnic Colleges', 'ITI Institutes', 'Training Institutes',
      'Tuition Centres', 'Coaching Centres', 'NEET Coaching', 'JEE Coaching', 'UPSC Coaching', 'TNPSC Coaching',
      'Bank Exam Coaching', 'Computer Training', 'Coding Academies', 'Language Training', 'Spoken English',
      'IELTS Training', 'Overseas Education', 'Study Abroad Consultants', 'Skill Development', 'Montessori',
      'Preschools', 'Music Classes', 'Dance Schools', 'Driving Schools',
    ],
  },
  {
    name: 'Food & Restaurants',
    slug: 'food-and-restaurants',
    icon: 'food',
    pluralLabel: 'Restaurants & Food Businesses',
    featured: true,
    description:
      'Restaurants, cafes, bakeries, caterers, grocers and food producers serving every taste across the state.',
    subcategories: [
      'Restaurants', 'Vegetarian Restaurants', 'Non-Vegetarian Restaurants', 'Hotels', 'Cafes', 'Tea Shops',
      'Coffee Shops', 'Bakeries', 'Cake Shops', 'Sweets', 'Fast Food', 'Biryani Restaurants', 'Chinese Restaurants',
      'South Indian Restaurants', 'North Indian Restaurants', 'Catering', 'Wedding Catering', 'Outdoor Catering',
      'Organic Food', 'Grocery Stores', 'Supermarkets', 'Fruits & Vegetables', 'Meat Shops', 'Seafood',
      'Cloud Kitchens', 'Food Delivery', 'Juice Shops', 'Ice Cream Parlours',
    ],
  },
  {
    name: 'Travel & Tourism',
    slug: 'travel',
    icon: 'travel',
    pluralLabel: 'Travel & Tourism Services',
    featured: true,
    description:
      'Travel agencies, taxis, vehicle rentals, tour operators and accommodation for business and leisure travel.',
    subcategories: [
      'Tours & Travels', 'Travel Agencies', 'Taxi Services', 'Cab Services', 'Car Rentals', 'Bus Operators',
      'Tourist Vehicles', 'Tempo Traveller', 'Van Rentals', 'Airport Taxi', 'Corporate Travel', 'Pilgrimage Tours',
      'Domestic Tours', 'International Tours', 'Tour Packages', 'Hotels', 'Resorts', 'Homestays', 'Lodges',
      'Guest Houses', 'Travel Insurance', 'Visa Services', 'Passport Services',
    ],
  },
  {
    name: 'Automobile',
    slug: 'automobile',
    icon: 'automobile',
    pluralLabel: 'Automobile Businesses',
    featured: false,
    description:
      'Car and bike dealers, EV showrooms, service centres, spare parts, accessories and vehicle finance.',
    subcategories: [
      'Car Dealers', 'Used Car Dealers', 'Bike Dealers', 'Used Bike Dealers', 'Electric Vehicles', 'EV Dealers',
      'Car Service', 'Bike Service', 'Automobile Workshops', 'Car Accessories', 'Bike Accessories', 'Tyre Dealers',
      'Battery Dealers', 'Wheel Alignment', 'Car Wash', 'Detailing', 'Automobile Spare Parts', 'Vehicle Insurance',
      'Vehicle Finance', 'Driving Schools', 'Towing Services',
    ],
  },
  {
    name: 'Home Services',
    slug: 'home-services',
    icon: 'home-services',
    pluralLabel: 'Home Service Providers',
    featured: true,
    description:
      'Electricians, plumbers, appliance repair, cleaning, pest control, security and installation specialists.',
    subcategories: [
      'Electricians', 'Plumbers', 'Carpenters', 'Painters', 'AC Service', 'Refrigerator Repair',
      'Washing Machine Repair', 'TV Repair', 'Appliance Service', 'RO Service', 'Water Purifier Service',
      'Cleaning Services', 'Deep Cleaning', 'Housekeeping', 'Pest Control', 'Gardening', 'Landscaping',
      'Packers & Movers', 'Security Services', 'CCTV Installation', 'Solar Installation', 'Inverter Service',
      'Generator Service', 'Interior Works',
    ],
  },
  {
    name: 'Events & Weddings',
    slug: 'events-and-weddings',
    icon: 'events',
    pluralLabel: 'Event & Wedding Services',
    featured: true,
    description:
      'Planners, venues, caterers, decorators, photographers and artists for weddings, celebrations and corporate events.',
    subcategories: [
      'Wedding Planners', 'Event Management', 'Event Planners', 'Wedding Halls', 'Marriage Halls',
      'Convention Centres', 'Catering', 'Decorators', 'Stage Decoration', 'Flower Decoration', 'Photography',
      'Videography', 'Drone Photography', 'Makeup Artists', 'Bridal Makeup', 'Mehendi Artists', 'DJs',
      'Sound Systems', 'Lighting', 'Invitation Printing', 'Digital Invitations', 'Wedding Cars',
      'Rental Furniture', 'Tent Houses',
    ],
  },
  {
    name: 'Beauty & Lifestyle',
    slug: 'beauty-and-lifestyle',
    icon: 'beauty',
    pluralLabel: 'Beauty & Lifestyle Businesses',
    featured: false,
    description:
      'Salons, spas, fitness centres, boutiques, tailors and jewellers for personal care and style.',
    subcategories: [
      'Beauty Parlours', 'Salons', "Men's Salons", "Women's Salons", 'Spas', 'Bridal Makeup', 'Makeup Artists',
      'Fitness Centres', 'Gyms', 'Yoga Centres', 'Zumba', 'Personal Trainers', 'Fashion Boutiques', 'Tailors',
      'Designer Clothing', 'Jewellery', 'Imitation Jewellery', 'Cosmetics', 'Tattoo Studios', 'Wellness Centres',
    ],
  },
  {
    name: 'Technology & Digital Services',
    slug: 'technology',
    icon: 'technology',
    pluralLabel: 'Technology & Digital Companies',
    featured: true,
    description:
      'Software, web and app development, digital marketing, design, cloud, cybersecurity and IT support.',
    subcategories: [
      'Software Companies', 'IT Companies', 'Website Development', 'Web Designers', 'App Development',
      'Mobile App Developers', 'SaaS Companies', 'ERP Software', 'Billing Software', 'POS Software', 'CRM Software',
      'Digital Marketing', 'SEO Services', 'Social Media Marketing', 'Google Ads', 'Meta Ads', 'Branding Agencies',
      'Graphic Designers', 'UI/UX Designers', 'Video Editing', 'Animation Studios', 'Cybersecurity',
      'Cloud Services', 'IT Support', 'Computer Sales', 'Laptop Sales', 'Computer Repair', 'Laptop Repair',
      'Networking', 'CCTV', 'Data Recovery', 'Hosting Services', 'Domain Services', 'AI Automation',
      'AI Development',
    ],
  },
  {
    name: 'Manufacturing & Industrial',
    slug: 'manufacturing',
    icon: 'manufacturing',
    pluralLabel: 'Manufacturers & Industrial Suppliers',
    featured: true,
    description:
      'Textile, engineering, automotive component, packaging, chemical and fabrication manufacturers and industrial suppliers.',
    subcategories: [
      'Textile Manufacturers', 'Garment Manufacturers', 'Engineering Industries', 'Machine Manufacturers',
      'Automobile Components', 'Industrial Equipment', 'CNC Machining', 'Fabrication', 'Foundries', 'Pumps',
      'Motors', 'Electrical Equipment', 'Packaging', 'Plastic Manufacturing', 'Rubber Products',
      'Chemical Industries', 'Food Manufacturing', 'Paper Products', 'Furniture Manufacturing',
      'Steel Fabrication', 'Industrial Automation', 'Industrial Suppliers',
    ],
  },
  {
    name: 'Agriculture',
    slug: 'agriculture',
    icon: 'agriculture',
    pluralLabel: 'Agriculture Businesses',
    featured: false,
    description:
      'Farm machinery, inputs, irrigation, livestock, nurseries, mills and agricultural trade.',
    subcategories: [
      'Agricultural Equipment', 'Tractor Dealers', 'Farm Machinery', 'Seeds', 'Fertilizers', 'Pesticides',
      'Organic Farming', 'Agriculture Consultants', 'Drip Irrigation', 'Borewell', 'Farm Equipment', 'Dairy Farms',
      'Poultry Farms', 'Goat Farms', 'Nurseries', 'Coconut Suppliers', 'Rice Mills', 'Agricultural Traders',
      'Cold Storage',
    ],
  },
  {
    name: 'Retail',
    slug: 'retail',
    icon: 'retail',
    pluralLabel: 'Retail Stores',
    featured: false,
    description:
      'Clothing, electronics, furniture, jewellery, footwear, books, gifts and everyday retail stores.',
    subcategories: [
      'Clothing Stores', "Men's Wear", "Women's Wear", 'Kids Wear', 'Saree Shops', 'Textile Shops', 'Mobile Stores',
      'Electronics', 'Home Appliances', 'Furniture', 'Jewellery Stores', 'Footwear', 'Bags', 'Gift Shops',
      'Fancy Stores', 'Book Stores', 'Stationery', 'Sports Stores', 'Toy Stores', 'Supermarkets',
      'Department Stores',
    ],
  },
  {
    name: 'Financial Services',
    slug: 'financial-services',
    icon: 'finance',
    pluralLabel: 'Financial Service Providers',
    featured: false,
    description:
      'Banks, lenders, insurers, investment advisors, brokers and tax services for individuals and businesses.',
    subcategories: [
      'Banks', 'Cooperative Banks', 'Finance Companies', 'Personal Loans', 'Business Loans', 'Home Loans',
      'Vehicle Loans', 'Gold Loans', 'Insurance', 'Life Insurance', 'Health Insurance', 'Mutual Funds',
      'Investments', 'Stock Brokers', 'Financial Advisors', 'Chit Funds', 'Microfinance', 'Tax Services',
    ],
  },
  {
    name: 'Media, Advertising & Printing',
    slug: 'media-and-advertising',
    icon: 'media',
    pluralLabel: 'Media, Advertising & Printing Businesses',
    featured: false,
    description:
      'Advertising and digital agencies, printers, signage, studios, publishers and content creators.',
    subcategories: [
      'Advertising Agencies', 'Digital Agencies', 'Printing Press', 'Flex Printing', 'Offset Printing',
      'Digital Printing', 'Sign Boards', 'LED Boards', 'Outdoor Advertising', 'Newspaper Advertising',
      'Television Advertising', 'Radio Advertising', 'Social Media Agencies', 'Photography', 'Videography',
      'Studios', 'News Portals', 'Magazines', 'Content Creators',
    ],
  },
  {
    name: 'Logistics',
    slug: 'logistics',
    icon: 'logistics',
    pluralLabel: 'Logistics & Transport Companies',
    featured: false,
    description:
      'Transport, courier, cargo, freight forwarding, warehousing, cold chain and delivery services.',
    subcategories: [
      'Transport Companies', 'Logistics Companies', 'Courier Services', 'Cargo', 'Freight Forwarders',
      'Warehousing', 'Packers & Movers', 'Truck Rentals', 'Mini Truck Rentals', 'Container Transport',
      'Cold Chain', 'Delivery Services',
    ],
  },
];

/**
 * Search synonyms keyed by subcategory slug. Lets "dentist" find dental
 * clinics, "doctor" find hospitals and so on.
 */
const subcategoryKeywords: Record<string, string[]> = {
  'dental-clinics': ['dentist', 'dental', 'teeth', 'tooth'],
  dentists: ['dental', 'dentist', 'teeth'],
  'dental-hospitals': ['dentist', 'dental'],
  'dental-labs': ['dental', 'dentures'],
  hospitals: ['doctor', 'doctors', 'medical'],
  'multi-speciality-hospitals': ['doctor', 'doctors', 'hospital'],
  clinics: ['doctor', 'doctors'],
  'general-physicians': ['doctor', 'doctors', 'gp'],
  advocates: ['lawyer', 'legal', 'law firm'],
  lawyers: ['advocate', 'legal', 'law firm'],
  'tax-consultants': ['tax', 'income tax', 'itr'],
  'gst-consultants': ['gst', 'tax'],
  'chartered-accountants': ['ca', 'accountant', 'tax'],
  builders: ['construction', 'homes', 'apartments', 'villas'],
  'tours-and-travels': ['travels', 'tour', 'trip'],
  'travel-agencies': ['travels', 'tickets'],
  'taxi-services': ['cab', 'taxi', 'travels'],
  'digital-marketing': ['marketing', 'online marketing', 'advertising'],
  'seo-services': ['seo', 'search engine'],
  'website-development': ['website', 'web'],
  restaurants: ['food', 'dining', 'eat'],
  hotels: ['stay', 'rooms', 'restaurant'],
  schools: ['school', 'education'],
  'interior-designers': ['interiors', 'interior'],
  'packers-and-movers': ['shifting', 'relocation', 'movers'],
};

const subcategoryIndex = new Map<string, Subcategory>();

export const categories: Category[] = seeds.map((seed) => {
  const subcategories = seed.subcategories.map((name) => {
    const slug = slugify(name);
    const existing = subcategoryIndex.get(slug);
    if (existing) {
      existing.categoryIds.push(seed.slug);
      return existing;
    }
    const subcategory: Subcategory = {
      id: slug,
      slug,
      name,
      categoryIds: [seed.slug],
      keywords: subcategoryKeywords[slug],
    };
    subcategoryIndex.set(slug, subcategory);
    return subcategory;
  });

  return {
    id: seed.slug,
    slug: seed.slug,
    name: seed.name,
    icon: seed.icon,
    pluralLabel: seed.pluralLabel,
    featured: seed.featured,
    description: seed.description,
    subcategories,
  };
});

/** Unique subcategories across all groups, keyed by slug. */
export const subcategories: Subcategory[] = Array.from(subcategoryIndex.values());
