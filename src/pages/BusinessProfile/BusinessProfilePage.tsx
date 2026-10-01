import { Bookmark, BookmarkCheck, Check, Flag, Info, MapPin, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { DemoBadge, FeaturedBadge, VerifiedBadge } from '@/components/common/Badge';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { Rating } from '@/components/common/Rating';
import { SEO } from '@/components/common/SEO';
import { ProfileSkeleton } from '@/components/common/Skeleton';
import { ErrorState } from '@/components/common/States';
import { useToast } from '@/components/common/Toast';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessLogo } from '@/components/business/BusinessLogo';
import { ContactButtons } from '@/components/business/ContactButtons';
import { MobileContactBar } from '@/components/business/MobileContactBar';
import { LinkCloud, linkChipClass } from '@/components/sections/SeoContent';
import { VERIFIED_EXPLANATION } from '@/config/site';
import { useQuery } from '@/hooks/useQuery';
import { useSaved } from '@/hooks/useSaved';
import { cn } from '@/lib/cn';
import { breadcrumbSchema, localBusinessSchema } from '@/lib/schema';
import { urls } from '@/lib/urls';
import { businessService, categoryService, districtService } from '@/services';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import type { Business } from '@/types';
import { Gallery, InfoList, LocationPanel, OpenStatus, ProfileCard, ReviewsPanel } from './ProfileSections';

const sectionNav = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'photos', label: 'Photos' },
  { id: 'location', label: 'Location' },
  { id: 'reviews', label: 'Reviews' },
];

function ProfileActions({ business }: { business: Business }) {
  const notify = useToast();
  const { saved, toggle } = useSaved(business.slug);

  const share = async () => {
    const url = window.location.href;
    const data = { title: business.name, text: business.shortDescription ?? business.name, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      notify('Link copied to clipboard');
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') notify('Couldn’t share — copy the address bar link instead', 'info');
    }
  };

  const save = () => {
    const nowSaved = toggle();
    notify(nowSaved ? 'Saved on this device' : 'Removed from saved', nowSaved ? 'success' : 'info');
  };

  const iconButton =
    'inline-flex h-10 items-center gap-2 rounded-control border border-line bg-white px-3.5 text-sm font-semibold text-navy-800 transition-colors hover:border-navy-200 hover:bg-navy-50';

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={share} className={iconButton}>
        <Share2 className="size-4" aria-hidden />
        Share
      </button>
      <button type="button" onClick={save} className={iconButton} aria-pressed={saved} title="Saved businesses are stored in this browser">
        {saved ? <BookmarkCheck className="size-4 text-brand-600" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
        {saved ? 'Saved' : 'Save'}
      </button>
      <Link to={`/contact?subject=claim&business=${business.slug}`} className={iconButton}>
        <Flag className="size-4" aria-hidden />
        Claim this business
      </Link>
    </div>
  );
}

function RelatedBusinesses({ business }: { business: Business }) {
  const { data: similar = [] } = useQuery(`similar:${business.id}`, () => businessService.getSimilar(business, 3));
  const { data: nearby = [] } = useQuery(`nearby:${business.id}`, () => businessService.getNearby(business, 3));
  const district = districtService.getDistrict(business.district);

  return (
    <>
      {similar.length > 0 && (
        <section className="mt-14" aria-labelledby="similar-title">
          <div className="flex items-end justify-between gap-4">
            <h2 id="similar-title" className="text-h3">
              Similar businesses
            </h2>
            <Link to={urls.category(business.categoryId)} className="text-sm font-semibold text-brand-700 hover:text-navy-950">
              More in {business.categoryName}
            </Link>
          </div>
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((b) => (
              <li key={b.id} className="flex">
                <BusinessCard business={b} className="w-full" />
              </li>
            ))}
          </ul>
        </section>
      )}
      {nearby.length > 0 && (
        <section className="mt-14" aria-labelledby="nearby-title">
          <div className="flex items-end justify-between gap-4">
            <h2 id="nearby-title" className="text-h3">
              Nearby businesses
            </h2>
            {district && (
              <Link to={urls.district(district.slug)} className="text-sm font-semibold text-brand-700 hover:text-navy-950">
                All in {district.name}
              </Link>
            )}
          </div>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((b) => (
              <li key={b.id}>
                <BusinessCard business={b} variant="compact" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function BusinessProfilePage() {
  const { businessSlug = '' } = useParams();
  const { data: business, loading, error, reload } = useQuery(`business:${businessSlug}`, () =>
    businessService.getBySlug(businessSlug),
  );

  if (error) {
    return (
      <Container className="py-20">
        <ErrorState onRetry={reload} />
      </Container>
    );
  }
  if (loading || (business && business.slug !== businessSlug)) return <ProfileSkeleton />;
  if (!business) {
    return (
      <NotFoundPage
        title="Business Not Found"
        description="This listing may have been removed or the link may be incorrect. Search for the business or explore similar ones."
      />
    );
  }

  const district = districtService.getDistrict(business.district);
  const districtName = district?.name ?? business.district;
  const category = categoryService.getCategory(business.categoryId);
  const subcategories = (business.subcategoryIds ?? [])
    .map((id) => categoryService.getSubcategory(id))
    .filter((s) => s !== undefined);

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: districtName, path: urls.district(business.district) },
    { name: business.categoryName, path: urls.districtCategory(business.district, business.categoryId) },
    { name: business.name, path: urls.business(business.slug) },
  ];
  const schemas = [breadcrumbSchema(crumbs), localBusinessSchema(business)].filter((s) => s !== null);

  return (
    <>
      <SEO
        title={business.name}
        description={`${business.shortDescription ?? business.description} ${business.locality ? `${business.locality}, ` : ''}${districtName}, Tamil Nadu.`}
        canonicalPath={urls.business(business.slug)}
        type="profile"
        jsonLd={schemas}
      />

      {/* Business hero */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" aria-hidden />
        <Container className="relative pt-8 pb-8 sm:pt-10">
          <Breadcrumbs items={crumbs} />

          {business.isDemo && (
            <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-700">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                <strong className="font-semibold">Sample listing.</strong> This fictional business demonstrates the Business
                Tamil Nadu profile layout. Contact details and ratings are placeholders.
              </span>
            </p>
          )}

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-4 sm:gap-6">
              <BusinessLogo name={business.name} logo={business.logo} size="xl" className="shadow-soft" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {business.verified && <VerifiedBadge variant="label" />}
                  {business.featured && <FeaturedBadge />}
                  {business.isDemo && <DemoBadge />}
                </div>
                <h1 className="text-h1 mt-2.5 break-words">{business.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-navy-600">
                  <Link to={urls.category(business.categoryId)} className="font-semibold text-brand-700 hover:text-navy-950">
                    {business.categoryName}
                  </Link>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-navy-400" aria-hidden />
                    {business.locality && business.locality !== districtName ? `${business.locality}, ` : ''}
                    <Link to={urls.district(business.district)} className="hover:text-navy-950 hover:underline">
                      {districtName}
                    </Link>
                  </span>
                  <Rating value={business.rating} count={business.reviewCount} size="md" />
                  <OpenStatus business={business} />
                </div>
              </div>
            </div>
            <ProfileActions business={business} />
          </div>

          <ContactButtons business={business} className="mt-7" size="lg" />
        </Container>

        <div className="border-t border-line bg-white/80">
          <Container>
            <nav aria-label="Profile sections" className="scrollbar-none -mb-px flex gap-1 overflow-x-auto">
              {sectionNav.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="shrink-0 border-b-2 border-transparent px-3 py-3.5 text-sm font-semibold text-navy-500 transition-colors hover:border-navy-300 hover:text-navy-950"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </Container>
        </div>
      </section>

      <Container className="pt-8 pb-16 sm:pt-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-8">
          <div className="min-w-0 space-y-6">
            <ProfileCard id="about" title={`About ${business.name}`}>
              <p className="text-body text-navy-700">{business.description}</p>
              {subcategories.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Listed under">
                  {subcategories.map((s) => (
                    <li key={s.slug}>
                      <Link to={urls.districtCategory(business.district, s.slug)} className={linkChipClass}>
                        {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </ProfileCard>

            <ProfileCard id="services" title="Services">
              {business.services?.length ? (
                <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {business.services.map((service) => (
                    <li key={service} className="flex items-start gap-2.5 rounded-xl bg-paper px-3.5 py-3 text-sm font-medium text-navy-800">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                      {service}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-navy-500">Services not listed yet.</p>
              )}
              {business.serviceAreas?.length ? (
                <div className="mt-5">
                  <h3 className="text-label text-navy-500">Service areas</h3>
                  <p className="mt-2 text-sm text-navy-700">{business.serviceAreas.join(' · ')}</p>
                </div>
              ) : null}
            </ProfileCard>

            <ProfileCard id="photos" title="Photos">
              <Gallery business={business} />
            </ProfileCard>

            <ProfileCard id="location" title="Location">
              <LocationPanel business={business} districtName={districtName} />
            </ProfileCard>

            <ProfileCard id="reviews" title="Ratings & reviews">
              <ReviewsPanel business={business} />
            </ProfileCard>
          </div>

          <aside className="space-y-6" aria-label="Business information">
            <div className="rounded-card border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-h4">Business information</h2>
              <div className="mt-4">
                <InfoList business={business} districtName={districtName} />
              </div>
              {business.verified && (
                <p className="mt-5 flex gap-2 rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-800">
                  <VerifiedBadge className="mt-0.5 text-sm" />
                  {VERIFIED_EXPLANATION}
                </p>
              )}
            </div>

            <div className="rounded-card border border-line bg-white p-5 sm:p-6">
              <h2 className="text-h4">Is this your business?</h2>
              <p className="text-body-sm mt-1.5 text-navy-500">
                Claim the listing to update details, add photos and respond to customers once owner tools launch.
              </p>
              <Button to={`/contact?subject=claim&business=${business.slug}`} variant="secondary" size="sm" className="mt-4">
                Claim listing
              </Button>
            </div>

            {category && (
              <LinkCloud title="Related categories" className="rounded-card border border-line bg-white p-5 sm:p-6">
                {category.subcategories.slice(0, 12).map((s) => (
                  <li key={s.slug}>
                    <Link to={urls.districtCategory(business.district, s.slug)} className={linkChipClass}>
                      {s.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to={urls.category(category.slug)} className={cn(linkChipClass, 'font-semibold text-brand-700')}>
                    All {category.name}
                  </Link>
                </li>
              </LinkCloud>
            )}
          </aside>
        </div>

        <RelatedBusinesses business={business} />
      </Container>

      <MobileContactBar business={business} />
    </>
  );
}
