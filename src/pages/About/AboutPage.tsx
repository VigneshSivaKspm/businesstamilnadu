import { BadgeCheck, Building2, Compass, Eye, HeartHandshake, MapPinned, Search, Store, Target, Users } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { SectionHeading } from '@/components/common/SectionHeading';
import { StateNetworkMap } from '@/components/home/StateNetworkMap';
import { CTASection } from '@/components/sections/CTASection';
import { OnboardingSection } from '@/components/sections/OnboardingSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { VERIFIED_EXPLANATION } from '@/config/site';
import { breadcrumbSchema, organizationSchema } from '@/lib/schema';

const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
];

const userBenefits = [
  { Icon: Search, title: 'Search the way you think', body: 'By service, business name, district or locality — “dentist Chennai” just works.' },
  { Icon: MapPinned, title: 'Local by default', body: 'Every district and its localities, so the nearest options are easy to find.' },
  { Icon: Users, title: 'Contact directly', body: 'Call, WhatsApp, website and directions from every profile, with no middleman.' },
];

const businessBenefits = [
  { Icon: Store, title: 'A professional profile', body: 'Services, hours, location and contact options presented clearly on any device.' },
  { Icon: Compass, title: 'Statewide discoverability', body: 'Appear in category, district and search results across Tamil Nadu.' },
  { Icon: BadgeCheck, title: 'Earned trust', body: 'A Verified badge once our team has reviewed your submitted details.' },
];

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Us"
        description="Business Tamil Nadu is a statewide business discovery platform connecting customers with businesses, professionals and service providers across Tamil Nadu."
        canonicalPath="/about"
        jsonLd={[breadcrumbSchema(crumbs), organizationSchema()]}
      />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="About us"
        title="About Business Tamil Nadu"
        description="Business Tamil Nadu is a statewide business discovery platform designed to connect customers with businesses, professionals and service providers across Tamil Nadu."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading eyebrow="Platform purpose" title="Local businesses. Statewide opportunities." />
              <div className="text-body mt-6 space-y-4 text-navy-600">
                <p>
                  Tamil Nadu has one of India’s most diverse business landscapes — global manufacturers and family-run shops,
                  specialist hospitals and neighbourhood clinics, software studios and centuries-old weaving clusters. Yet many
                  of these businesses are still hard to find online.
                </p>
                <p>
                  We built Business Tamil Nadu to change that: one well-organised directory covering all 38 districts, where
                  customers can find the right business quickly and businesses of every size can present themselves
                  professionally.
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-navy-950 p-8">
              <div className="bg-grid-dark absolute inset-0 opacity-60" aria-hidden />
              <StateNetworkMap className="relative mx-auto h-auto w-full max-w-sm" />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-white py-16 sm:py-20" aria-label="Mission and vision">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-paper p-7 sm:p-9">
              <Target className="size-7 text-brand-600" strokeWidth={1.75} aria-hidden />
              <h2 className="text-h3 mt-5">Our mission</h2>
              <p className="text-body mt-3 text-navy-600">
                To help every business in Tamil Nadu be found by the customers who need it — and to make finding a trustworthy
                local business simple for everyone.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-paper p-7 sm:p-9">
              <Eye className="size-7 text-brand-600" strokeWidth={1.75} aria-hidden />
              <h2 className="text-h3 mt-5">Our vision</h2>
              <p className="text-body mt-3 text-navy-600">
                A connected statewide business network where accurate information, fair visibility and direct contact help local
                enterprises grow.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <StatsSection className="py-16" />

      <section className="pb-16 sm:pb-20" aria-labelledby="benefits-title">
        <Container>
          <SectionHeading id="benefits-title" eyebrow="Who it’s for" title="Built for customers and businesses alike" align="center" />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {[
              { heading: 'For customers', Icon: Users, items: userBenefits },
              { heading: 'For businesses', Icon: Building2, items: businessBenefits },
            ].map(({ heading, Icon, items }) => (
              <div key={heading} className="rounded-2xl border border-line bg-white p-6 sm:p-8">
                <h3 className="text-h3 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-navy-950 text-gold-300">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {heading}
                </h3>
                <ul className="mt-6 space-y-5">
                  {items.map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <item.Icon className="mt-0.5 size-5 shrink-0 text-brand-600" strokeWidth={1.75} aria-hidden />
                      <div>
                        <p className="font-semibold text-navy-950">{item.title}</p>
                        <p className="text-body-sm mt-0.5 text-navy-500">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="verification" className="scroll-mt-24 bg-navy-950 py-16 text-white sm:py-20" aria-labelledby="verification-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <SectionHeading
              id="verification-title"
              eyebrow="Verified listings"
              title="How verification works"
              tone="inverse"
              description="We believe a directory is only as useful as its information is accurate."
            />
            <div className="space-y-5 text-white/75">
              <p className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 fill-brand-600 text-white" aria-hidden />
                {VERIFIED_EXPLANATION}
              </p>
              <p>
                When a business is submitted, our team reviews the details provided — such as the business name, category,
                address and contact numbers — and may call to confirm them. Listings that pass this review display a Verified
                badge.
              </p>
              <p>
                Verification is a listing-quality check. It does not certify licences, guarantee service quality, or imply any
                association with or approval from a government body. Customers should always make their own enquiries before
                engaging a business.
              </p>
              <p className="flex items-start gap-3">
                <HeartHandshake className="mt-0.5 size-5 shrink-0 text-gold-300" aria-hidden />
                Featured placement, where shown, is always labelled so it is never confused with verification or organic
                results.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <OnboardingSection />
      <CTASection className="pt-0 sm:pt-0" />
    </>
  );
}
