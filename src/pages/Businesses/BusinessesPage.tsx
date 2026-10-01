import { AZFilter } from '@/components/common/AZFilter';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { BusinessExplorer } from '@/components/business/BusinessExplorer';
import { useCounts } from '@/hooks/useCounts';
import { useListingParams } from '@/hooks/useListingParams';
import { breadcrumbSchema } from '@/lib/schema';
import { categoryService, districtService } from '@/services';

/** Builds a descriptive H1 from the active filters, e.g. "Featured Healthcare Providers in Madurai". */
function useHeading() {
  const { filters } = useListingParams();
  const district = districtService.getDistrict(filters.district);
  const city = districtService.getCity(filters.city);
  const resolved = categoryService.resolve(filters.sub || filters.category);
  const subject = resolved ? categoryService.headingLabel(resolved) : 'Businesses';
  const place = city?.name ?? district?.name;
  const prefix = filters.featured ? 'Featured ' : filters.verified ? 'Verified ' : '';
  if (filters.letter && !resolved && !place) return { title: `Businesses Starting with “${filters.letter}”`, filtered: true };
  const filtered = Boolean(prefix || resolved || place);
  return {
    title: filtered ? `${prefix}${subject} in ${place ?? 'Tamil Nadu'}` : 'Explore Businesses Across Tamil Nadu',
    filtered,
  };
}

export default function BusinessesPage() {
  const { filters, update } = useListingParams();
  const counts = useCounts();
  const { title, filtered } = useHeading();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Businesses', path: '/businesses' },
  ];

  return (
    <>
      <SEO
        title={filtered ? title : 'Explore Businesses'}
        description="Browse businesses, professionals and services across all 38 districts of Tamil Nadu. Filter by district, locality, category and more."
        canonicalPath="/businesses"
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Business directory"
        title={title}
        description="Search, filter and contact businesses across every district. Results update instantly and every view can be shared or bookmarked."
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <span className="text-sm font-semibold text-navy-700">Browse A–Z</span>
          <AZFilter
            size="sm"
            active={filters.letter}
            available={counts?.byLetter}
            onSelect={(letter) => update({ letter })}
          />
        </div>
      </PageHero>
      <Container className="py-10 sm:py-12">
        <BusinessExplorer cardHeading="h2" />
      </Container>
    </>
  );
}
