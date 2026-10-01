import { Link, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { BusinessExplorer } from '@/components/business/BusinessExplorer';
import { FeaturedStrip } from '@/components/business/FeaturedStrip';
import { DistrictCard } from '@/components/district/DistrictCard';
import { SearchBar } from '@/components/search/SearchBar';
import { CTASection } from '@/components/sections/CTASection';
import { LinkCloud, SeoContent, linkChipClass } from '@/components/sections/SeoContent';
import { regionLabels } from '@/data/districts';
import { useCounts } from '@/hooks/useCounts';
import { useQuery } from '@/hooks/useQuery';
import { breadcrumbSchema } from '@/lib/schema';
import { slugify } from '@/lib/slug';
import { urls } from '@/lib/urls';
import { businessService, categoryService, districtService } from '@/services';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import { pluralize } from '@/utils/format';

export default function DistrictDetailPage() {
  const { districtSlug = '' } = useParams();
  const district = districtService.getDistrict(districtSlug);
  const counts = useCounts(districtSlug);
  const { data: localities = [] } = useQuery(`localities:${districtSlug}`, () => businessService.getLocalities(districtSlug));

  if (!district) {
    return (
      <NotFoundPage
        title="District Not Found"
        description="We couldn’t find that district. Tamil Nadu has 38 districts — choose one from the district directory."
      />
    );
  }

  const withListings = categoryService
    .getAll()
    .filter((c) => (counts?.byCategory[c.slug] ?? 0) > 0)
    .sort((a, b) => (counts!.byCategory[b.slug] ?? 0) - (counts!.byCategory[a.slug] ?? 0));
  const popularCategories = [...withListings, ...categoryService.getFeatured().filter((c) => !withListings.includes(c))].slice(0, 8);
  const related = districtService.getRelated(district.slug, 6);
  const cities = districtService.getCities(district.slug);

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Tamil Nadu', path: '/districts' },
    { name: district.name, path: urls.district(district.slug) },
  ];

  return (
    <>
      <SEO
        title={`Businesses in ${district.name}`}
        description={`Discover businesses, professionals and services across ${district.name} district, Tamil Nadu. Filter by locality and category, and contact businesses directly.`}
        canonicalPath={urls.district(district.slug)}
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-2">
            <MapPin className="size-4" aria-hidden />
            {regionLabels[district.region]}
            {district.nameTa && (
              <span lang="ta" className="font-medium tracking-normal normal-case text-navy-400">
                · {district.nameTa}
              </span>
            )}
          </span>
        }
        title={`Businesses in ${district.name}`}
        description={`Discover businesses, professionals and services across ${district.name} district.`}
      >
        <SearchBar key={district.slug} variant="inline" initialDistrict={district.slug} className="max-w-4xl" />
        {district.description && <p className="text-body-sm mt-5 max-w-3xl text-navy-500">{district.description}</p>}
      </PageHero>

      <section className="pt-10 sm:pt-12" aria-labelledby="popular-in-district">
        <Container>
          <h2 id="popular-in-district" className="text-h4">
            Popular categories in {district.name}
          </h2>
          <ul className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:overflow-visible">
            {popularCategories.map((c) => {
              const count = counts?.byCategory[c.slug] ?? 0;
              return (
                <li key={c.slug} className="shrink-0">
                  <Link
                    to={urls.districtCategory(district.slug, c.slug)}
                    className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-line bg-white pr-4 pl-3 text-sm font-semibold text-navy-800 transition-[border-color,box-shadow] hover:border-navy-200 hover:shadow-soft"
                  >
                    <CategoryIcon icon={c.icon} className="size-4 text-brand-600" />
                    {c.name}
                    {count > 0 && <Badge tone="neutral">{count}</Badge>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <FeaturedStrip filter={{ district: district.slug }} title={`Featured in ${district.name}`} />

      <section className="py-10 sm:py-12" aria-labelledby="all-in-district">
        <Container>
          <h2 id="all-in-district" className="text-h3 mb-6">
            All businesses in {district.name}
          </h2>
          <BusinessExplorer
            locked={{ district: district.slug }}
            fields={['q', 'city', 'locality', 'category', 'subcategory', 'verified', 'featured', 'open', 'rating']}
            emptyActions={
              <>
                <Link to="/register-business" className="text-sm font-semibold text-brand-700 hover:text-navy-950">
                  List a business in {district.name}
                </Link>
              </>
            }
          />
        </Container>
      </section>

      <SeoContent
        title={`About doing business in ${district.name}`}
        aside={
          <div className="space-y-8">
            {localities.length > 0 && (
              <LinkCloud title="Localities">
                {localities.map((name) => (
                  <li key={name}>
                    <Link to={`${urls.district(district.slug)}?locality=${slugify(name)}#all-in-district`} className={linkChipClass}>
                      {name}
                    </Link>
                  </li>
                ))}
              </LinkCloud>
            )}
            {cities.length > 0 && (
              <LinkCloud title="Cities & towns">
                {cities.map((c) => (
                  <li key={c.slug}>
                    <Link to={`${urls.district(district.slug)}?city=${c.slug}#all-in-district`} className={linkChipClass}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </LinkCloud>
            )}
          </div>
        }
      >
        <p>{district.description}</p>
        <p>
          Business Tamil Nadu helps customers find {district.name} businesses by service, locality and category. Every profile
          brings together phone, WhatsApp, directions and business details, and listings marked <strong>Verified</strong> have
          had their submitted information reviewed by our team.
        </p>
        <p>
          {counts && counts.total > 0
            ? `There ${counts.total === 1 ? 'is' : 'are'} currently ${pluralize(counts.total, 'listing')} in ${district.name}.`
            : `Listings for ${district.name} are opening now.`}{' '}
          Own a business here?{' '}
          <Link to="/register-business" className="font-semibold text-brand-700 hover:text-navy-950">
            Add it to the directory
          </Link>
          .
        </p>
      </SeoContent>

      <section className="border-t border-line py-12 sm:py-16" aria-labelledby="nearby-districts">
        <Container>
          <h2 id="nearby-districts" className="text-h3">
            Nearby districts
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {related.map((d) => (
              <li key={d.slug}>
                <DistrictCard district={d} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CTASection title={`Grow Your Business in ${district.name}`} />
    </>
  );
}
