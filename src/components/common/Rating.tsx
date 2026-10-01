import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/utils/format';

interface RatingProps {
  value?: number;
  count?: number;
  size?: 'sm' | 'md';
  tone?: 'default' | 'inverse';
  className?: string;
}

/** Compact star rating. Shows "No reviews yet" when no rating exists. */
export function Rating({ value, count, size = 'sm', tone = 'default', className }: RatingProps) {
  const inverse = tone === 'inverse';
  if (!value) {
    return <span className={cn('text-xs', inverse ? 'text-white/60' : 'text-navy-400', className)}>No reviews yet</span>;
  }
  return (
    <span
      className={cn('inline-flex items-center gap-1', size === 'sm' ? 'text-xs' : 'text-sm', className)}
      aria-label={`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ''}`}
    >
      <Star className={cn('fill-gold-400 text-gold-400', size === 'sm' ? 'size-3.5' : 'size-4')} aria-hidden />
      <span className={cn('font-bold', inverse ? 'text-white' : 'text-navy-900')}>{value.toFixed(1)}</span>
      {count !== undefined && <span className={inverse ? 'text-white/60' : 'text-navy-400'}>({formatNumber(count)})</span>}
    </span>
  );
}
