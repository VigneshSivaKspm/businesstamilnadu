import { useNavigate, useParams, Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { BusinessExplorer } from '@/components/business/BusinessExplorer';
import { FeaturedStrip } from '@/components/business/FeaturedStrip';
import { SelectControl } from '@/components/forms/Field';
import { LinkCloud, SeoContent, linkChipClass } from '@/components/sections/SeoContent';
import { CTASection } from '@/components/sections/CTASection';
import { breadcrumbSchema } from '@/lib/schema';
import { urls } from '@/lib/urls';
import { categoryService, districtService } from '@/services';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';

export default function CategoryDetailPage() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const resolved = categoryService.resolve(categorySlug);

  if (!resolved) {
    return (
      <NotFoundPage
        title="Category Not Found"
        description="We couldn’t find that category. Browse the full category directory or search for the service you need."
      />
    );
  }

  const isSub = resolved.kind === 'subcategory';
  const name = categoryService.nameOf(resolved);
  const parent = isSub ? resolved.parent : resolved.category;
  const heading = categoryService.headingLabel(resolved);
  const slug = isSub ? resolved.subcategory.slug : resolved.category.slug;
  const locked = isSub ? { subcategory: slug } : { category: slug };
  const related = isSub
    ? parent.subcategories.filter((s) => s.slug !== slug).slice(0, 18)
    : resolved.category.subcategories.slice(0, 24);
  const description = isSub
    ? `Find ${name.toLowerCase()} across Tamil Nadu. Compare profiles, check verified details and contact businesses directly by phone or WhatsApp.`
    : resolved.category.description;

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    ...(isSub ? [{ name: parent.name, path: urls.category(parent.slug) }] : []),
    { name, path: urls.category(slug) },
  ];

  return (
    <>
      <SEO
        title={`${heading} in Tamil Nadu`}
        description={`${description} Browse ${name} listings in all 38 districts on Business Tamil Nadu.`}
        canonicalPath={urls.category(slug)}
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <CategoryIcon icon={parent.icon} className="size-4" />
            {isSub ? parent.name : 'Category'}
          </span>
        }
        title={`${heading} in Tamil Nadu`}
        description={description}
        aside={
          <div className="w-full rounded-card border border-line bg-white p-4 shadow-soft sm:w-72">
            <label htmlFor="category-district" className="text-label flex items-center gap-1.5 text-[0.6875rem] text-navy-500">
              <MapPin className="size-3.5" aria-hidden />
              Choose a district
            </label>
            <SelectControl
              id="category-district"
              className="mt-2"
              defaultValue=""
              onChange={(e) => e.target.value && navigate(urls.districtCategory(e.target.value, slug))}
            >
              <option value="">All of Tamil Nadu</option>
              {districtService.getAll().map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </SelectControl>
            <p className="mt-2 text-xs text-navy-400">Opens {name} listings for that district.</p>
          </div>
        }
      />

      <FeaturedStrip filter={locked} title={`Featured ${name.toLowerCase()} listings`} />

      <Container className="py-10 sm:py-12">
        <BusinessExplorer
          locked={locked}
          fields={['q', 'district', 'city', 'locality', ...(isSub ? [] : (['subcategory'] as const)), 'verified', 'featured', 'open', 'rating']}
        />
      </Container>

      <SeoContent
        title={`About ${name} on Business Tamil Nadu`}
        aside={
          <div className="space-y-8">
            <LinkCloud title={isSub ? `More in ${parent.name}` : 'Subcategories'}>
              {related.map((s) => (
                <li key={s.slug}>
                  <Link to={urls.category(s.slug)} className={linkChipClass}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </LinkCloud>
            <LinkCloud title={`${name} by district`}>
              {districtService.getFeatured().map((d) => (
                <li key={d.slug}>
                  <Link to={urls.districtCategory(d.slug, slug)} className={linkChipClass}>
                    {d.name}
                  </Link>
                </li>
              ))}
            </LinkCloud>
          </div>
        }
      >
        <p>
          Business Tamil Nadu lists {name.toLowerCase()} from all 38 districts of the state, from Chennai and Coimbatore to
          Madurai, Tiruchirappalli, Salem and Tirunelveli. Each profile brings together contact options, location, services
          and operating hours so you can compare providers quickly.
        </p>
        <p>
          Use the filters to narrow results by district, city or locality, or choose <strong>Verified only</strong> to see
          businesses whose submitted details have been reviewed by our team. Verification is a listing-quality check by
          Business Tamil Nadu and is not a government certification.
        </p>
        <p>
          Run a {name.toLowerCase()} business?{' '}
          <Link to="/register-business" className="font-semibold text-brand-700 hover:text-navy-950">
            List it for free
          </Link>{' '}
          and reach customers searching across Tamil Nadu.
        </p>
      </SeoContent>

      <CTASection />
    </>
  );
}
