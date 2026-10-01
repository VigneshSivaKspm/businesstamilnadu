import { SEO } from '@/components/common/SEO';
import { HomeHero } from '@/components/home/HomeHero';
import {
  AZSection,
  BusinessHubsSection,
  DistrictsSection,
  FeaturedBusinessesSection,
  PopularCategoriesSection,
  RecentBusinessesSection,
} from '@/components/home/HomeSections';
import { CTASection } from '@/components/sections/CTASection';
import { OnboardingSection } from '@/components/sections/OnboardingSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { WhySection } from '@/components/sections/WhySection';
import { organizationSchema, websiteSchema } from '@/lib/schema';

export default function HomePage() {
  return (
    <>
      <SEO canonicalPath="/" jsonLd={[organizationSchema(), websiteSchema()]} />
      <HomeHero />
      <StatsSection overlap />
      <PopularCategoriesSection />
      <DistrictsSection />
      <FeaturedBusinessesSection />
      <BusinessHubsSection />
      <WhySection className="border-b border-line" />
      <OnboardingSection />
      <RecentBusinessesSection />
      <AZSection />
      <CTASection className="pt-0 sm:pt-0" />
    </>
  );
}
