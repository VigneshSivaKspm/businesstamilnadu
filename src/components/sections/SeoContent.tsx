import type { ReactNode } from 'react';
import { Container } from '@/components/common/Container';
import { cn } from '@/lib/cn';

interface SeoContentProps {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}

/** Long-form descriptive copy for district and category landing pages. */
export function SeoContent({ title, children, aside, className }: SeoContentProps) {
  return (
    <section className={cn('border-t border-line bg-white py-14 sm:py-16', className)} aria-labelledby="about-this-page">
      <Container>
        <div className={cn('grid gap-10', aside && 'lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16')}>
          <div className="max-w-3xl">
            <h2 id="about-this-page" className="text-h3">
              {title}
            </h2>
            <div className="text-body mt-4 space-y-4 text-navy-600">{children}</div>
          </div>
          {aside}
        </div>
      </Container>
    </section>
  );
}

interface LinkCloudProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Compact titled list of related links (categories, localities, districts). */
export function LinkCloud({ title, children, className }: LinkCloudProps) {
  return (
    <div className={className}>
      <h3 className="text-label text-navy-500">{title}</h3>
      <ul className="mt-3 flex flex-wrap gap-1.5">{children}</ul>
    </div>
  );
}

export const linkChipClass =
  'inline-flex h-8 items-center rounded-full border border-line bg-white px-3 text-[0.8125rem] font-medium text-navy-700 transition-colors hover:border-navy-300 hover:text-navy-950';
