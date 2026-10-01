import type { HTMLAttributes } from 'react';
import { BadgeCheck, Sparkles } from 'lucide-react';
import { VERIFIED_EXPLANATION } from '@/config/site';
import { cn } from '@/lib/cn';

type BadgeTone = 'neutral' | 'brand' | 'gold' | 'success' | 'outline' | 'inverse';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-navy-50 text-navy-700 ring-navy-100',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  gold: 'bg-gold-50 text-gold-700 ring-gold-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  outline: 'bg-white text-navy-700 ring-line',
  inverse: 'bg-white/10 text-white ring-white/15',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: 'sm' | 'md';
}

export function Badge({ tone = 'neutral', size = 'sm', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
        size === 'sm' ? 'h-6 px-2.5 text-[0.6875rem]' : 'h-7 px-3 text-xs',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

interface VerifiedBadgeProps {
  /** `icon` shows only the check mark (with tooltip), `label` adds text. */
  variant?: 'icon' | 'label';
  className?: string;
}

/**
 * Verification badge with an accessible tooltip. Verification means the
 * Business Tamil Nadu team reviewed the submitted details — never a
 * government certification.
 */
export function VerifiedBadge({ variant = 'icon', className }: VerifiedBadgeProps) {
  return (
    <span
      className={cn('group/verified relative inline-flex shrink-0 items-center', className)}
      tabIndex={0}
      aria-label={`Verified Business. ${VERIFIED_EXPLANATION}`}
    >
      {variant === 'icon' ? (
        <BadgeCheck className="size-[1.15em] fill-brand-600 text-white" strokeWidth={2.25} aria-hidden />
      ) : (
        <Badge tone="brand" className="gap-1 pl-1.5">
          <BadgeCheck className="size-3.5 fill-brand-600 text-white" strokeWidth={2.5} aria-hidden />
          Verified
        </Badge>
      )}
      <span
        role="tooltip"
        className="animate-fade-in pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-52 -translate-x-1/2 rounded-lg bg-navy-950 px-3 py-2 text-left text-xs font-normal leading-snug tracking-normal text-white normal-case shadow-lift group-hover/verified:block group-focus-visible/verified:block"
      >
        <span className="block font-semibold">Verified Business</span>
        <span className="mt-0.5 block text-white/75">Details reviewed by the Business Tamil Nadu team.</span>
      </span>
    </span>
  );
}

export function FeaturedBadge({ className }: { className?: string }) {
  return (
    <Badge tone="gold" className={cn('gap-1 pl-2', className)}>
      <Sparkles className="size-3" aria-hidden />
      Featured
    </Badge>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge tone="outline" className={cn('text-navy-500', className)} title="Fictional sample listing for demonstration">
      Sample listing
    </Badge>
  );
}
