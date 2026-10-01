import { ArrowUpRight, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FeaturedBadge, VerifiedBadge } from '@/components/common/Badge';
import { Rating } from '@/components/common/Rating';
import { cn } from '@/lib/cn';
import { analyticsService } from '@/services/analyticsService';
import { districtService } from '@/services/districtService';
import type { Business } from '@/types';
import { telHref, whatsappHref } from '@/utils/format';
import { BusinessLogo } from './BusinessLogo';

export type BusinessCardVariant = 'grid' | 'list' | 'compact';

interface BusinessCardProps {
  business: Business;
  variant?: BusinessCardVariant;
  className?: string;
  headingLevel?: 'h2' | 'h3';
}

function placeLabel(business: Business) {
  const district = districtService.getDistrict(business.district)?.name ?? business.district;
  const place = business.locality && business.locality !== district ? `${business.locality}, ${district}` : district;
  return place;
}

const actionClass =
  'relative z-10 inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] text-[0.8125rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';

function CardActions({ business }: { business: Business }) {
  const href = `/business/${business.slug}`;
  return (
    <div className="flex gap-2">
      {business.phone && (
        <a
          href={telHref(business.phone)}
          onClick={() => analyticsService.trackLead(business.id, 'call')}
          className={cn(actionClass, 'bg-navy-950 text-white hover:bg-navy-800')}
          aria-label={`Call ${business.name}`}
        >
          <Phone className="size-3.5" aria-hidden />
          Call
        </a>
      )}
      {business.whatsapp && (
        <a
          href={whatsappHref(business.whatsapp, `Hello ${business.name}, I found your business on Business Tamil Nadu.`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analyticsService.trackLead(business.id, 'whatsapp')}
          className={cn(actionClass, 'border border-line bg-white text-navy-900 hover:border-emerald-200 hover:bg-emerald-50')}
          aria-label={`WhatsApp ${business.name}`}
        >
          <MessageCircle className="size-3.5 text-emerald-600" aria-hidden />
          WhatsApp
        </a>
      )}
      <Link
        to={href}
        className={cn(actionClass, 'border border-line bg-white text-navy-900 hover:border-navy-200 hover:bg-navy-50')}
        aria-label={`View profile of ${business.name}`}
      >
        Profile
        <ArrowUpRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}

/** Reusable business card in grid, list and compact variants. */
export function BusinessCard({ business, variant = 'grid', className, headingLevel: Heading = 'h3' }: BusinessCardProps) {
  const place = placeLabel(business);
  const href = `/business/${business.slug}`;

  if (variant === 'compact') {
    return (
      <Link
        to={href}
        className={cn(
          'group flex items-center gap-3 rounded-xl border border-line bg-white p-3 transition-[border-color,box-shadow] hover:border-navy-200 hover:shadow-soft',
          className,
        )}
      >
        <BusinessLogo name={business.name} logo={business.logo} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-navy-950 group-hover:text-brand-700">{business.name}</span>
            {business.verified && <VerifiedBadge className="text-sm" />}
          </span>
          <span className="block truncate text-xs text-navy-500">
            {business.categoryName} · {place}
          </span>
        </span>
        <ArrowUpRight className="size-4 shrink-0 text-navy-300 transition-colors group-hover:text-navy-700" aria-hidden />
      </Link>
    );
  }

  const isList = variant === 'list';

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-card border bg-white p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lift',
        business.featured ? 'border-gold-200 hover:border-gold-300' : 'border-line hover:border-navy-200',
        isList && 'sm:flex-row sm:items-center sm:gap-6',
        className,
      )}
    >
      <div className={cn('flex min-w-0 flex-1 flex-col', isList && 'sm:flex-row sm:items-start sm:gap-5')}>
        <div className="flex items-start gap-3.5">
          <BusinessLogo name={business.name} logo={business.logo} size={isList ? 'lg' : 'md'} />
          <div className={cn('min-w-0 flex-1', isList && 'sm:hidden')}>
            <CardTitle business={business} href={href} Heading={Heading} />
            <p className="mt-0.5 truncate text-[0.8125rem] font-medium text-brand-700">{business.categoryName}</p>
          </div>
          {business.featured && <FeaturedBadge className={cn('shrink-0', isList && 'sm:hidden')} />}
        </div>

        <div className={cn('mt-3.5 flex min-w-0 flex-1 flex-col', isList && 'sm:mt-0')}>
          {isList && (
            <div className="hidden items-start justify-between gap-3 sm:flex">
              <div className="min-w-0">
                <CardTitle business={business} href={href} Heading={Heading} />
                <p className="mt-0.5 truncate text-[0.8125rem] font-medium text-brand-700">{business.categoryName}</p>
              </div>
              {business.featured && <FeaturedBadge className="shrink-0" />}
            </div>
          )}
          <p className={cn('text-body-sm line-clamp-2 text-navy-600', isList && 'sm:mt-2')}>
            {business.shortDescription ?? business.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-navy-500">
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0 text-navy-400" aria-hidden />
              <span className="truncate">{place}</span>
            </span>
            <Rating value={business.rating} count={business.reviewCount} />
          </div>
        </div>
      </div>

      <div className={cn('mt-5 border-t border-line/70 pt-4', isList && 'sm:mt-0 sm:w-72 sm:shrink-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6')}>
        <CardActions business={business} />
      </div>
    </article>
  );
}

function CardTitle({ business, href, Heading }: { business: Business; href: string; Heading: 'h2' | 'h3' }) {
  return (
    <Heading className="flex min-w-0 items-start gap-1.5 text-[0.9875rem] leading-snug font-bold tracking-tight">
      <Link
        to={href}
        className="line-clamp-2 text-navy-950 after:absolute after:inset-0 after:rounded-card after:content-[''] hover:text-brand-700 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-500"
      >
        {business.name}
      </Link>
      {business.verified && <VerifiedBadge className="relative z-10 mt-[0.2em]" />}
    </Heading>
  );
}
