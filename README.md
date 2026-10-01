# Business Tamil Nadu

Tamil Nadu's statewide business discovery platform — **businesstamilnadu.in**.

React 19 · Vite 8 · TypeScript · Tailwind CSS 4 · React Router 7 · React Helmet Async · Lucide

```bash
npm install
npm run dev        # local development
npm run build      # typecheck + production build
npm run lint
npm run preview    # serve the production build
```

## Structure

```text
src/
├── config/site.ts          Brand, contact details, social links, headline stats, demo-mode flag
├── types/                  Domain models (Business, District, City, Category, Registration, Review, Lead, Plan…)
├── data/                   Bundled reference data: 38 districts, cities/hubs, 17 categories / ~395 subcategories,
│                           sample businesses, legal copy
├── services/               The only layer pages talk to for data
│   ├── dataSource.ts       Storage adapter — swap for Firestore/Supabase/REST via setDataSource()
│   ├── businessService.ts  Query, filter, sort, paginate, counts, similar/nearby
│   ├── categoryService.ts  Taxonomy lookup + category search
│   ├── districtService.ts  Districts, cities, localities, place extraction ("dentist chennai")
│   ├── searchService.ts    Grouped autocomplete suggestions
│   ├── registrationService.ts / contactService.ts / savedService.ts / analyticsService.ts
├── hooks/                  useQuery (cached async), useListingParams (URL ⇄ filters), useOverlay, …
├── lib/                    cn, slugify, search matching, schema.org builders, URL builders, storage
├── components/
│   ├── common/             Button, Badge/VerifiedBadge, Breadcrumbs, Pagination, SEO, Skeletons, States, AZFilter…
│   ├── layout/             Header, MobileNav, Footer, Layout
│   ├── business/           BusinessCard (grid/list/compact), BusinessExplorer, ContactButtons, MobileContactBar
│   ├── filters/            FilterSidebar, MobileFilters
│   ├── search/             SearchBar, SearchAutocomplete (ARIA combobox)
│   ├── forms/              Field controls, Stepper
│   ├── home/ sections/     Homepage and shared marketing sections
├── pages/                  One folder per route (lazy-loaded except Home)
└── routes/index.tsx        Route table
```

## Routes

`/` · `/businesses` · `/categories` · `/categories/:slug` (category **or** subcategory) · `/districts` ·
`/district/:district` · `/district/:district/:category` · `/business/:slug` · `/search` · `/register-business` ·
`/about` · `/contact` · `/privacy-policy` · `/terms` · `/disclaimer` · `/404` (+ catch-all)

Listing filters live in the query string (`?district=&city=&locality=&category=&sub=&letter=&verified=1&featured=1&open=1&rating=4&sort=&page=&view=list`), so every result set can be shared and bookmarked.

## Connecting a backend

1. Implement `BusinessDataSource` (see `services/dataSource.ts`) and call `setDataSource()` at startup. For large
   catalogues, move filtering into the backend by reimplementing `businessService.query` against your API —
   its signature (`BusinessQuery → Paginated<Business>`) is already the contract.
2. Replace `registrationService.submit` and `contactService.send` with real calls and set `isRemoteEnabled = true`;
   the UI then stops showing the "send by email/WhatsApp" hand-off.
3. Types for future collections (`users`, `reviews`, `leads`, `plans`, `payments`) are in `src/types`.

## Before launch

- **Demo data:** all businesses in `src/data/businesses.ts` are fictional (`isDemo: true`) and are labelled
  "Sample listing" in the UI. Replace them, then set `site.demoMode = false`.
- **Contact details & social links** in `src/config/site.ts` are placeholders.
- **Headline stats** (5,000+ businesses etc.) in `site.stats` are launch targets, not live counts.
- **Social image:** set `site.ogImage` to a 1200×630 image URL.
- **Legal copy** in `src/data/legal.ts` is a starting draft — have it reviewed by counsel.
- Set `VITE_SITE_URL` (see `.env.example`) for canonical URLs.
- Configure your host to serve `index.html` for all routes (SPA fallback).
