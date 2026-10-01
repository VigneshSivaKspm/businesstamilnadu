import { ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AZFilter } from '@/components/common/AZFilter';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { BusinessGridSkeleton, CategoryCardSkeleton } from '@/components/common/Skeleton';
import { BusinessCard } from '@/components/business/BusinessCard';
import { CategoryCard } from '@/components/category/CategoryCard';
import { DistrictCard } from '@/components/district/DistrictCard';
import { useCounts } from '@/hooks/useCounts';
import { useQuery } from '@/hooks/useQuery';
import { businessService, categoryService, districtService } from '@/services';

export function PopularCategoriesSection() {
  const counts = useCounts();
  const featured = categoryService.getFeatured();
  return (
    <section className="pt-20 pb-16 sm:pt-24 sm:pb-20" aria-labelledby="popular-categories-title">
      <Container>
        <SectionHeading
          id="popular-categories-title"
          eyebrow="Browse by need"
          title="Popular Categories"
          description="From healthcare and education to construction and technology — explore the services people search for most."
          action={{ label: 'All categories', to: '/categories' }}
        />
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {featured.map((category) => (
            <li key={category.id}>
              <CategoryCard category={category} businessCount={counts?.byCategory[category.slug] ?? (counts ? 0 : undefined)} />
            </li>
          ))}
          {!featured.length &&
            Array.from({ length: 5 }, (_, i) => (
              <li key={i}>
                <CategoryCardSkeleton />
              </li>
            ))}
        </ul>
      </Container>
    </section>
  );
}

export function DistrictsSection() {
  const counts = useCounts();
  const districts = districtService.getAll();
  return (
    <section className="border-y border-line bg-white py-16 sm:py-24" aria-labelledby="districts-title">
      <Container>
        <SectionHeading
          id="districts-title"
          eyebrow="All 38 districts"
          title="Explore Businesses by District"
          description="Find trusted businesses, professionals and services across Tamil Nadu."
          action={{ label: 'District directory', to: '/districts' }}
        />
        <ul className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
          {districts.map((district) => (
            <li key={district.id}>
              <DistrictCard district={district} businessCount={counts ? (counts.byDistrict[district.slug] ?? 0) : undefined} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function FeaturedBusinessesSection() {
  const { data } = useQuery('home:featured', () => businessService.getFeatured(6));
  return (
    <section className="py-16 sm:py-24" aria-labelledby="featured-title">
      <Container>
        <SectionHeading
          id="featured-title"
          eyebrow="Featured"
          title="Featured Businesses"
          description="Highlighted profiles from across the state. Featured placement is clearly labelled."
          action={{ label: 'View all featured', to: '/businesses?featured=1' }}
        />
        <div className="mt-10">
          {data ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((business) => (
                <li key={business.id} className="flex">
                  <BusinessCard business={business} className="w-full" />
                </li>
              ))}
            </ul>
          ) : (
            <BusinessGridSkeleton count={6} />
          )}
        </div>
      </Container>
    </section>
  );
}

export function BusinessHubsSection() {
  const hubs = districtService.getHubs();
  return (
    <section className="bg-navy-950 py-16 text-white sm:py-24" aria-labelledby="hubs-title">
      <Container>
        <SectionHeading
          id="hubs-title"
          eyebrow="Cities"
          title="Popular Business Hubs"
          description="Major commercial cities across Tamil Nadu. Each hub links to the businesses listed in that city."
          tone="inverse"
          action={{ label: 'All districts', to: '/districts' }}
        />
        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {hubs.map((city) => {
            const district = districtService.getDistrict(city.districtSlug);
            return (
              <li key={city.id}>
                <Link
                  to={`/businesses?district=${city.districtSlug}&city=${city.slug}`}
                  className="group flex h-full flex-col bg-navy-950 p-5 transition-colors hover:bg-navy-900"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-h4 text-white">{city.name}</span>
                    <ArrowRight className="size-4 text-white/30 transition-all group-hover:translate-x-0.5 group-hover:text-gold-300" aria-hidden />
                  </span>
                  {city.tagline && <span className="mt-1.5 text-sm text-white/55">{city.tagline}</span>}
                  {district && <span className="mt-4 text-xs font-medium text-white/35">{district.name} district</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

export function RecentBusinessesSection() {
  const { data } = useQuery('home:recent', () => businessService.getRecent(6));
  return (
    <section className="border-t border-line bg-white py-16 sm:py-24" aria-labelledby="recent-title">
      <Container>
        <SectionHeading
          id="recent-title"
          eyebrow="Just listed"
          title="Recently Added Businesses"
          action={{ label: 'See more', to: '/businesses?sort=recent' }}
        />
        <div className="mt-10">
          {data ? (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((business) => (
                <li key={business.id}>
                  <BusinessCard business={business} variant="compact" />
                </li>
              ))}
            </ul>
          ) : (
            <BusinessGridSkeleton count={3} />
          )}
        </div>
      </Container>
    </section>
  );
}

export function AZSection() {
  const counts = useCounts();
  return (
    <section className="py-16 sm:py-20" aria-labelledby="az-title">
      <Container>
        <div className="flex flex-col gap-8 rounded-2xl border border-line bg-white p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-sm">
            <span className="grid size-11 place-items-center rounded-xl bg-navy-50 text-navy-700">
              <Building2 className="size-5" aria-hidden />
            </span>
            <h2 id="az-title" className="text-h3 mt-4">
              Browse Businesses A–Z
            </h2>
            <p className="text-body-sm mt-2 text-navy-500">Know the name? Jump straight to businesses by their first letter.</p>
            <Button to="/businesses?sort=az" variant="secondary" size="sm" className="mt-5">
              View full A–Z list
            </Button>
          </div>
          <AZFilter available={counts?.byLetter} className="lg:max-w-xl lg:justify-end" />
        </div>
      </Container>
    </section>
  );
}
