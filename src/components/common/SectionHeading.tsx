import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  action?: { label: string; to: string };
  tone?: 'default' | 'inverse';
  as?: 'h1' | 'h2' | 'h3';
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  tone = 'default',
  as: Heading = 'h2',
  id,
  className,
}: SectionHeadingProps) {
  const inverse = tone === 'inverse';
  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className={cn('text-label mb-3 flex items-center gap-2', inverse ? 'text-gold-300' : 'text-brand-600', align === 'center' && 'justify-center')}>
            <span className={cn('h-px w-6', inverse ? 'bg-gold-300/60' : 'bg-brand-600/50')} aria-hidden />
            {eyebrow}
          </p>
        )}
        <Heading id={id} className={cn('text-h2', inverse && 'text-white')}>
          {title}
        </Heading>
        {description && (
          <p className={cn('text-body mt-3', inverse ? 'text-white/70' : 'text-navy-500')}>{description}</p>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className={cn(
            'group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold',
            inverse ? 'text-white hover:text-gold-300' : 'text-brand-700 hover:text-navy-950',
          )}
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
