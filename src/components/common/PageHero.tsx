import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';
import { Container } from './Container';

interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

/** Consistent header band for inner pages. */
export function PageHero({ eyebrow, title, description, breadcrumbs, children, aside, className }: PageHeroProps) {
  return (
    <section className={cn('relative overflow-hidden border-b border-line bg-white', className)}>
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] size-[36rem] rounded-full bg-brand-100/50 blur-3xl"
        aria-hidden
      />
      <Container className="relative py-10 sm:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-6" />}
        <div className={cn('flex flex-col gap-8', aside && 'lg:flex-row lg:items-end lg:justify-between')}>
          <div className="max-w-3xl min-w-0">
            {eyebrow && <div className="text-label mb-3 text-brand-600">{eyebrow}</div>}
            <h1 className="text-h1">{title}</h1>
            {description && <p className="text-body mt-4 max-w-2xl text-navy-500 sm:text-lg">{description}</p>}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
