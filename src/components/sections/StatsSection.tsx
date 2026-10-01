import { site } from '@/config/site';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/utils/format';

/** Trust metrics, driven entirely by `site.stats`. */
export function StatsSection({ className, overlap = false }: { className?: string; overlap?: boolean }) {
  return (
    <section aria-label="Platform at a glance" className={cn('relative z-10', overlap && '-mt-14 sm:-mt-16', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-white shadow-lift lg:grid-cols-4">
          {site.stats.map((stat, index) => (
            <div
              key={stat.id}
              className={cn(
                'flex flex-col gap-1 px-5 py-6 sm:px-8 sm:py-8',
                index % 2 === 1 && 'border-l border-line',
                index >= 2 && 'border-t border-line lg:border-t-0',
                index === 2 && 'lg:border-l',
              )}
            >
              <dt className="order-2 text-sm font-semibold text-navy-700">{stat.label}</dt>
              <dd className="order-1 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
                {formatNumber(stat.value)}
                <span className="text-gold-500">{stat.suffix}</span>
              </dd>
              <dd className="order-3 text-xs text-navy-400">{stat.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
