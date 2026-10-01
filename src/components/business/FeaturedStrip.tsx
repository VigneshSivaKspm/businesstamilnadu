import { Sparkles } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { useQuery } from '@/hooks/useQuery';
import { businessService } from '@/services';
import type { BusinessQuery } from '@/types';
import { BusinessCard } from './BusinessCard';

interface FeaturedStripProps {
  filter: Pick<BusinessQuery, 'district' | 'category' | 'subcategory'>;
  title?: string;
}

/** Featured listings for a district/category context. Renders nothing when there are none. */
export function FeaturedStrip({ filter, title = 'Featured businesses' }: FeaturedStripProps) {
  const { data } = useQuery(`featured:${JSON.stringify(filter)}`, () => businessService.getFeatured(3, filter));
  if (!data?.length) return null;
  return (
    <section className="pt-10 sm:pt-12" aria-labelledby="featured-strip-title">
      <Container>
        <h2 id="featured-strip-title" className="text-h4 flex items-center gap-2">
          <Sparkles className="size-4 text-gold-500" aria-hidden />
          {title}
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((business) => (
            <li key={business.id} className="flex">
              <BusinessCard business={business} className="w-full" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
