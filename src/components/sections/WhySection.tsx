import { BadgeCheck, Globe2, MapPinned, MessagesSquare, Sprout, TrendingUp } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { cn } from '@/lib/cn';

const reasons = [
  { Icon: Globe2, title: 'Statewide Discovery', body: 'Reach customers across Tamil Nadu, from metros to market towns.' },
  { Icon: MapPinned, title: 'District-Based Search', body: 'Help customers find businesses close to them, district by district.' },
  { Icon: BadgeCheck, title: 'Verified Profiles', body: 'Build greater customer confidence with details reviewed by our team.' },
  { Icon: TrendingUp, title: 'Stronger Digital Presence', body: 'Create a professional online presence for your business.' },
  { Icon: MessagesSquare, title: 'Easy Customer Contact', body: 'Calls, WhatsApp, website and directions in one profile.' },
  { Icon: Sprout, title: 'Business Growth', body: 'Increase discoverability among people actively searching for services.' },
];

export function WhySection({ className }: { className?: string }) {
  return (
    <section className={cn('bg-white py-16 sm:py-24', className)} aria-labelledby="why-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
          <SectionHeading
            id="why-title"
            eyebrow="Why us"
            title="Why Business Tamil Nadu?"
            description="A focused discovery platform built around how people in Tamil Nadu actually search — by service, by district, by locality."
            className="lg:sticky lg:top-28 lg:self-start"
          />
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {reasons.map(({ Icon, title, body }) => (
              <li key={title} className="bg-white p-6 sm:p-7">
                <Icon className="size-6 text-brand-600" strokeWidth={1.75} aria-hidden />
                <h3 className="text-h4 mt-4">{title}</h3>
                <p className="text-body-sm mt-1.5 text-navy-500">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
