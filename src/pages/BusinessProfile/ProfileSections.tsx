import type { ReactNode } from 'react';
import { CalendarDays, Clock, ExternalLink, Globe, ImagePlus, Mail, MapPin, MessageSquare, Phone, Star } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';
import type { Business } from '@/types';
import { directionsHref, formatNumber, telHref } from '@/utils/format';
import { WEEKDAYS, WEEKDAY_LABELS, formatTime, isOpenNow, nowInIndia } from '@/utils/hours';

export function ProfileCard({
  id,
  title,
  children,
  className,
  action,
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('scroll-mt-28 rounded-card border border-line bg-white p-5 sm:p-7', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={`${id}-title`} className="text-h3">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function OpenStatus({ business, className }: { business: Business; className?: string }) {
  if (!business.openingHours) return null;
  const open = isOpenNow(business.openingHours);
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', open ? 'text-emerald-700' : 'text-navy-500', className)}>
      <span className={cn('size-2 rounded-full', open ? 'bg-emerald-500' : 'bg-navy-300')} aria-hidden />
      {open ? 'Open now' : 'Closed now'}
    </span>
  );
}

export function HoursTable({ business }: { business: Business }) {
  const hours = business.openingHours;
  if (!hours) return <p className="text-sm text-navy-500">Hours not provided.</p>;
  const today = nowInIndia().day;
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Operating hours (IST)</caption>
      <tbody>
        {WEEKDAYS.map((day) => {
          const value = hours[day];
          const isToday = day === today;
          return (
            <tr key={day} className={cn(isToday && 'font-semibold text-navy-950')}>
              <th scope="row" className={cn('py-1.5 pr-4 text-left font-normal text-navy-600', isToday && 'font-semibold text-navy-950')}>
                {WEEKDAY_LABELS[day]}
                {isToday && <span className="sr-only"> (today)</span>}
              </th>
              <td className={cn('py-1.5 text-right tabular-nums', value ? 'text-navy-900' : 'text-navy-400')}>
                {value ? `${formatTime(value.open)} – ${formatTime(value.close)}` : 'Closed'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function InfoList({ business, districtName }: { business: Business; districtName: string }) {
  const rows: Array<{ Icon: typeof Phone; label: string; value: ReactNode }> = [];
  rows.push({
    Icon: MapPin,
    label: 'Address',
    value: [business.address, business.pinCode].filter(Boolean).join(' – ') || `${business.locality ?? ''} ${districtName}`.trim(),
  });
  if (business.phone)
    rows.push({
      Icon: Phone,
      label: 'Phone',
      value: (
        <a href={telHref(business.phone)} className="font-semibold text-navy-950 hover:text-brand-700">
          {business.phone}
        </a>
      ),
    });
  rows.push({
    Icon: Mail,
    label: 'Email',
    value: business.email ? (
      <a href={`mailto:${business.email}`} className="break-all text-navy-950 hover:text-brand-700">
        {business.email}
      </a>
    ) : (
      <span className="text-navy-400">Not provided</span>
    ),
  });
  rows.push({
    Icon: Globe,
    label: 'Website',
    value: business.website ? (
      <a href={business.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-navy-950 hover:text-brand-700">
        {business.website.replace(/^https?:\/\//, '')}
        <ExternalLink className="size-3.5 shrink-0" aria-hidden />
      </a>
    ) : (
      <span className="text-navy-400">Not provided</span>
    ),
  });
  if (business.yearEstablished)
    rows.push({ Icon: CalendarDays, label: 'Established', value: String(business.yearEstablished) });

  return (
    <dl className="divide-y divide-line">
      {rows.map(({ Icon, label, value }) => (
        <div key={label} className="flex gap-3 py-3 first:pt-0">
          <Icon className="mt-0.5 size-4 shrink-0 text-navy-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <dt className="text-xs font-medium text-navy-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-navy-900">{value}</dd>
          </div>
        </div>
      ))}
      <div className="flex gap-3 py-3 last:pb-0">
        <Clock className="mt-0.5 size-4 shrink-0 text-navy-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <dt className="flex items-center justify-between gap-2 text-xs font-medium text-navy-500">
            Operating hours <OpenStatus business={business} className="text-xs" />
          </dt>
          <dd className="mt-1.5">
            <HoursTable business={business} />
          </dd>
        </div>
      </div>
    </dl>
  );
}

/** Gallery with an honest empty state until photo uploads launch. */
export function Gallery({ business }: { business: Business }) {
  const photos = business.photos ?? [];
  if (!photos.length) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-dashed border-navy-200 bg-[linear-gradient(135deg,var(--color-navy-50),white)]',
              i > 0 && 'hidden sm:grid',
            )}
          >
            {i === 0 && (
              <div className="px-4 text-center">
                <ImagePlus className="mx-auto size-6 text-navy-300" aria-hidden />
                <p className="mt-2 text-sm font-medium text-navy-600">No photos yet</p>
                <p className="mt-0.5 text-xs text-navy-400">Photo galleries are coming soon for business owners.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((src, i) => (
        <li key={src} className="overflow-hidden rounded-xl border border-line">
          <img src={src} alt={`${business.name} photo ${i + 1}`} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
        </li>
      ))}
    </ul>
  );
}

/** Map placeholder prepared for a Google Maps / Mapbox embed. */
export function LocationPanel({ business, districtName }: { business: Business; districtName: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="relative grid h-56 place-items-center overflow-hidden bg-navy-50 sm:h-64">
        <div className="bg-grid absolute inset-0 opacity-70" aria-hidden />
        <svg className="absolute inset-0 h-full w-full text-navy-200" aria-hidden preserveAspectRatio="none" viewBox="0 0 400 200">
          <path d="M0 140 C 80 120, 120 160, 200 130 S 320 90, 400 110" fill="none" stroke="currentColor" strokeWidth="10" />
          <path d="M120 0 C 140 60, 110 120, 150 200" fill="none" stroke="currentColor" strokeWidth="6" />
          <path d="M260 0 L 300 200" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>
        <div className="relative flex flex-col items-center">
          <span className="grid size-12 place-items-center rounded-full bg-navy-950 text-gold-300 shadow-lift ring-8 ring-white/70">
            <MapPin className="size-5" aria-hidden />
          </span>
          <span className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 shadow-soft">
            {business.locality ?? business.city}, {districtName}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-navy-600">{business.address ?? `${business.locality ?? ''}, ${districtName}`}</p>
        <Button href={directionsHref(business)} variant="secondary" size="sm" rightIcon={<ExternalLink className="size-3.5" aria-hidden />}>
          Open in Google Maps
        </Button>
      </div>
    </div>
  );
}

/** Rating summary. Written reviews are not collected yet, and the UI says so. */
export function ReviewsPanel({ business }: { business: Business }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[12rem_1fr]">
      <div className="rounded-xl bg-navy-50 p-5 text-center">
        {business.rating ? (
          <>
            <p className="text-4xl font-extrabold text-navy-950">{business.rating.toFixed(1)}</p>
            <div className="mt-1 flex justify-center gap-0.5" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={cn('size-4', i < Math.round(business.rating!) ? 'fill-gold-400 text-gold-400' : 'fill-navy-200 text-navy-200')}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs text-navy-500">
              {business.reviewCount ? `${formatNumber(business.reviewCount)} ratings` : 'Rating'}
            </p>
          </>
        ) : (
          <p className="text-sm text-navy-500">No ratings yet</p>
        )}
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-0.5 size-5 shrink-0 text-navy-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-navy-900">Customer reviews are coming soon</p>
            <p className="mt-1 text-sm text-navy-500">
              We’re building verified reviews so customers can share genuine experiences.
              {business.isDemo && ' Ratings on sample listings are illustrative only.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
