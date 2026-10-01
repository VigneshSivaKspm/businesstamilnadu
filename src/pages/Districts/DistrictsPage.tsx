import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { SectionHeading } from '@/components/common/SectionHeading';
import { EmptyState } from '@/components/common/States';
import { DistrictCard } from '@/components/district/DistrictCard';
import { controlClass } from '@/components/forms/Field';
import { StateNetworkMap } from '@/components/home/StateNetworkMap';
import { CTASection } from '@/components/sections/CTASection';
import { useCounts } from '@/hooks/useCounts';
import { cn } from '@/lib/cn';
import { breadcrumbSchema } from '@/lib/schema';
import { normalize } from '@/lib/search';
import { districtService } from '@/services';
import { formatNumber } from '@/utils/format';

export default function DistrictsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const view = params.get('view') === 'region' ? 'region' : 'az';
  const counts = useCounts();
  const all = districtService.getAll();

  const setParam = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const filtered = useMemo(() => {
    const q = normalize(query);
    const list = q
      ? all.filter((d) => normalize(d.name).includes(q) || d.localities?.some((l) => normalize(l).includes(q)))
      : all;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [all, query]);

  const grouped = useMemo(() => {
    const byLetter = new Map<string, typeof filtered>();
    for (const d of filtered) {
      const letter = d.name.charAt(0);
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), d]);
    }
    return Array.from(byLetter.entries());
  }, [filtered]);

  const countFor = (slug: string) => (counts ? (counts.byDistrict[slug] ?? 0) : undefined);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Districts', path: '/districts' },
  ];

  return (
    <>
      <SEO
        title="Businesses by District in Tamil Nadu"
        description="Explore businesses in all 38 districts of Tamil Nadu — Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tirunelveli and more."
        canonicalPath="/districts"
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="All 38 districts"
        title="Explore Tamil Nadu by District"
        description="Every district, from the state capital to the delta and the hills. Choose a district to discover its businesses, localities and popular services."
        aside={
          <dl className="grid grid-cols-3 gap-3 rounded-card border border-line bg-white p-4 text-center shadow-soft sm:w-96">
            <div>
              <dt className="text-xs text-navy-500">Districts</dt>
              <dd className="text-2xl font-extrabold text-navy-950">{all.length}</dd>
            </div>
            <div className="border-x border-line">
              <dt className="text-xs text-navy-500">Regions</dt>
              <dd className="text-2xl font-extrabold text-navy-950">4</dd>
            </div>
            <div>
              <dt className="text-xs text-navy-500">Listings</dt>
              <dd className="text-2xl font-extrabold text-navy-950">{counts ? formatNumber(counts.total) : '—'}</dd>
            </div>
          </dl>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-xl flex-1">
            <label htmlFor="district-search" className="sr-only">
              Search districts or localities
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-navy-400" aria-hidden />
            <input
              id="district-search"
              type="search"
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="Search a district or locality, e.g. Hosur"
              className={cn(controlClass, 'h-14 rounded-xl border-line pr-12 pl-12 text-base shadow-soft')}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setParam('q', '')}
                className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-navy-400 hover:bg-navy-50"
                aria-label="Clear search"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
          <div className="inline-flex self-start rounded-control border border-line bg-white p-1 sm:self-auto" role="group" aria-label="Sort districts">
            {(
              [
                { value: 'az', label: 'A–Z' },
                { value: 'region', label: 'By region' },
              ] as const
            ).map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={view === o.value}
                onClick={() => setParam('view', o.value === 'az' ? '' : o.value)}
                className={cn(
                  'h-10 rounded-[9px] px-4 text-sm font-semibold transition-colors',
                  view === o.value ? 'bg-navy-950 text-white' : 'text-navy-600 hover:text-navy-950',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </PageHero>

      {!query && (
        <Container className="py-12 sm:py-16">
          <SectionHeading title="Featured districts" description="Major commercial centres with the most active business communities." />
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {districtService.getFeatured().map((d) => (
              <li key={d.slug}>
                <DistrictCard district={d} variant="feature" businessCount={countFor(d.slug)} />
              </li>
            ))}
          </ul>
        </Container>
      )}

      <section className={cn('border-t border-line bg-white py-12 sm:py-16', query && 'border-t-0')} aria-labelledby="all-districts">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0">
              <h2 id="all-districts" className="text-h3" aria-live="polite">
                {query ? `${filtered.length} district${filtered.length === 1 ? '' : 's'} matching “${query}”` : 'All districts'}
              </h2>
              {filtered.length === 0 ? (
                <EmptyState className="mt-6" title="No districts found" description="Check the spelling, or try a nearby town or locality." />
              ) : view === 'region' && !query ? (
                <div className="mt-6 space-y-10">
                  {districtService.getByRegion().map((group) => (
                    <div key={group.region}>
                      <h3 className="text-label text-navy-500">
                        {group.label} · {group.districts.length}
                      </h3>
                      <ul className="mt-3 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 xl:grid-cols-3">
                        {[...group.districts]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((d) => (
                            <li key={d.slug}>
                              <DistrictCard district={d} businessCount={countFor(d.slug)} />
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 space-y-8">
                  {grouped.map(([letter, list]) => (
                    <div key={letter} className="grid grid-cols-1 gap-3 sm:grid-cols-[2.5rem_1fr]">
                      <h3 className="text-h3 text-navy-300">{letter}</h3>
                      <ul className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 xl:grid-cols-3">
                        {list.map((d) => (
                          <li key={d.slug}>
                            <DistrictCard district={d} businessCount={countFor(d.slug)} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="hidden lg:block" aria-label="State overview">
              <div className="sticky top-28 overflow-hidden rounded-2xl bg-navy-950 p-6 text-white">
                <h2 className="text-h4 text-white">State overview</h2>
                <p className="mt-1.5 text-sm text-white/60">Every district headquarters, connected. Select a point to open that district.</p>
                <StateNetworkMap className="mt-4 h-auto w-full" />
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
