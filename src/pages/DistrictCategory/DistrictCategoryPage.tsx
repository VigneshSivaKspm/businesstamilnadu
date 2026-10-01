import { Link, useParams } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { BusinessExplorer } from '@/components/business/BusinessExplorer';
import { SearchBar } from '@/components/search/SearchBar';
import { CTASection } from '@/components/sections/CTASection';
import { LinkCloud, SeoContent, linkChipClass } from '@/components/sections/SeoContent';
import { useQuery } from '@/hooks/useQuery';
import { breadcrumbSchema } from '@/lib/schema';
import { slugify } from '@/lib/slug';
import { urls } from '@/lib/urls';
import { businessService, categoryService, districtService } from '@/services';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';

/** SEO landing page: a category or subcategory within one district, e.g. /district/chennai/digital-marketing. */
export default function DistrictCategoryPage() {
  const { districtSlug = '', categorySlug } = useParams();
  const district = districtService.getDistrict(districtSlug);
  const resolved = categoryService.resolve(categorySlug);
  const { data: localities = [] } = useQuery(`localities:${districtSlug}`, () => businessService.getLocalities(districtSlug));

  if (!district || !resolved) {
    return (
      <NotFoundPage
        title="Page Not Found"
        description="We couldn’t find that district or category. Explore the district directory or browse all categories."
      />
    );
  }

  const isSub = resolved.kind === 'subcategory';
  const name = categoryService.nameOf(resolved);
  const slug = isSub ? resolved.subcategory.slug : resolved.category.slug;
  const parent = isSub ? resolved.parent : resolved.category;
  const heading = `${categoryService.headingLabel(resolved)} in ${district.name}`;
  const locked = { district: district.slug, ...(isSub ? { subcategory: slug } : { category: slug }) };
  const relatedCategories = (isSub ? parent.subcategories.filter((s) => s.slug !== slug) : parent.subcategories).slice(0, 16);
  const otherDistricts = districtService.getRelated(district.slug, 8);

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Tamil Nadu', path: '/districts' },
    { name: district.name, path: urls.district(district.slug) },
    { name, path: urls.districtCategory(district.slug, slug) },
  ];

  return (
    <>
      <SEO
        title={heading}
        description={`Find ${name.toLowerCase()} in ${district.name}, Tamil Nadu. Compare profiles, view locations and contact businesses directly by phone or WhatsApp.`}
        canonicalPath={urls.districtCategory(district.slug, slug)}
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow={`${parent.name} · ${district.name}`}
        title={heading}
        description={`Discover ${name.toLowerCase()} across ${district.name} district — filter by locality, check verified details and get in touch directly.`}
      >
        <SearchBar key={`${district.slug}-${slug}`} variant="inline" initialDistrict={district.slug} className="max-w-4xl" />
      </PageHero>

      <Container className="py-10 sm:py-12">
        <BusinessExplorer
          locked={locked}
          fields={['q', 'city', 'locality', ...(isSub ? [] : (['subcategory'] as const)), 'verified', 'featured', 'open', 'rating']}
          emptyActions={
            <>
              <Link
                to={urls.category(slug)}
                className="inline-flex h-11 items-center rounded-control bg-navy-950 px-5 text-sm font-semibold text-white hover:bg-navy-800"
              >
                {name} across Tamil Nadu
              </Link>
              <Link
                to={urls.district(district.slug)}
                className="inline-flex h-11 items-center rounded-control border border-line bg-white px-5 text-sm font-semibold text-navy-900 hover:bg-navy-50"
              >
                All businesses in {district.name}
              </Link>
            </>
          }
        />
      </Container>

      <SeoContent
        title={`Finding ${name.toLowerCase()} in ${district.name}`}
        aside={
          <div className="space-y-8">
            <LinkCloud title={`Related in ${district.name}`}>
              {relatedCategories.map((s) => (
                <li key={s.slug}>
                  <Link to={urls.districtCategory(district.slug, s.slug)} className={linkChipClass}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </LinkCloud>
            {localities.length > 0 && (
              <LinkCloud title="Nearby localities">
                {localities.map((l) => (
                  <li key={l}>
                    <Link to={`?locality=${slugify(l)}`} className={linkChipClass}>
                      {l}
                    </Link>
                  </li>
                ))}
              </LinkCloud>
            )}
          </div>
        }
      >
        <p>
          Looking for {name.toLowerCase()} in {district.name}? Business Tamil Nadu brings together listings from across the
          district so you can compare services, check locations and contact providers directly — by phone, WhatsApp or map
          directions.
        </p>
        <p>
          Narrow results by locality or city, sort by recently added or most viewed, and use <strong>Verified only</strong> to
          see businesses whose details have been reviewed by our team.
        </p>
        <div>
          <p className="text-sm font-semibold text-navy-900">{name} in nearby districts</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {otherDistricts.map((d) => (
              <li key={d.slug}>
                <Link to={urls.districtCategory(d.slug, slug)} className={linkChipClass}>
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </SeoContent>

      <CTASection title={`List Your Business in ${district.name}`} />
    </>
  );
}
