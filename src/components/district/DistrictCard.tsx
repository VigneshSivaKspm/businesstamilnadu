import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import type { District } from '@/types';
import { pluralize } from '@/utils/format';

interface DistrictCardProps {
  district: District;
  businessCount?: number;
  variant?: 'default' | 'feature';
  className?: string;
}

export function DistrictCard({ district, businessCount, variant = 'default', className }: DistrictCardProps) {
  const count =
    businessCount === undefined ? null : businessCount > 0 ? pluralize(businessCount, 'listing') : 'Accepting listings';

  if (variant === 'feature') {
    return (
      <Link
        to={`/district/${district.slug}`}
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-white p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-lift',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-h4 truncate">{district.name}</h3>
            {district.nameTa && (
              <p lang="ta" className="mt-0.5 truncate text-xs text-navy-400">
                {district.nameTa}
              </p>
            )}
          </div>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-500 transition-colors group-hover:bg-navy-950 group-hover:text-white">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
        {district.description && <p className="text-body-sm mt-3 line-clamp-2 text-navy-500">{district.description}</p>}
        {count && <p className="mt-auto pt-4 text-xs font-semibold text-brand-700">{count}</p>}
      </Link>
    );
  }

  return (
    <Link
      to={`/district/${district.slug}`}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 transition-[border-color,box-shadow] duration-200 hover:border-navy-200 hover:shadow-soft',
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-500 transition-colors group-hover:bg-navy-950 group-hover:text-gold-300">
        <MapPin className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-navy-950">{district.name}</span>
        {count && <span className="block truncate text-xs text-navy-500">{count}</span>}
      </span>
    </Link>
  );
}
