import { BadgeCheck, MapPin, Search, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { SearchBar } from '@/components/search/SearchBar';
import { popularSearches, site } from '@/config/site';
import { urls } from '@/lib/urls';
import { StateNetworkMap } from './StateNetworkMap';

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white" aria-labelledby="hero-title">
      <div className="bg-grid-dark absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_30%_20%,black,transparent_75%)]" aria-hidden />
      <div className="absolute -top-48 -left-40 -z-10 size-[42rem] rounded-full bg-brand-600/20 blur-[120px]" aria-hidden />
      <div className="absolute right-[-12rem] bottom-[-16rem] -z-10 size-[36rem] rounded-full bg-gold-500/10 blur-[120px]" aria-hidden />

      <Container className="relative grid grid-cols-1 items-center gap-10 pt-10 pb-24 sm:pt-14 lg:grid-cols-12 lg:gap-6 lg:pt-16 lg:pb-32">
        <div className="lg:col-span-7 xl:col-span-7">
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pr-3.5 pl-1.5 text-xs font-medium text-white/80">
            <span className="shrink-0 rounded-full bg-gold-400 px-2 py-0.5 text-[0.6875rem] font-bold whitespace-nowrap text-navy-950">38 districts</span>
            <span className="truncate">{site.positioning}</span>
          </p>

          <h1 id="hero-title" className="text-display mt-6 text-white">
            Discover Businesses Across <span className="text-gold-300">Tamil Nadu</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Find trusted businesses, professionals, services and local experts across every district of Tamil Nadu.
          </p>

          <SearchBar variant="hero" className="relative z-10 mt-8 lg:mr-[-6rem] xl:mr-[-8rem]" />

          <div className="mt-5 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
            <span className="mr-2 inline-flex items-center gap-1.5 font-medium text-white/50">
              <TrendingUp className="size-4" aria-hidden />
              Popular:
            </span>
            {popularSearches.map((term, index) => (
              <span key={term} className="inline-flex items-center">
                <Link
                  to={urls.search(term)}
                  className="rounded-md px-1.5 py-0.5 font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {term}
                </Link>
                {index < popularSearches.length - 1 && (
                  <span className="text-white/25" aria-hidden>
                    •
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:col-span-5 lg:block">
          <div className="relative mx-auto aspect-[400/520] w-full max-w-md">
            <StateNetworkMap className="h-full w-full" />

            <Link
              to={urls.search('dentist', 'madurai')}
              className="absolute top-[6%] left-[-6%] w-56 rounded-xl border border-white/10 bg-navy-900/80 p-3 shadow-panel backdrop-blur-md transition-colors hover:border-white/25"
            >
              <div className="flex items-center gap-2 text-[0.6875rem] font-semibold tracking-wide text-white/50 uppercase">
                <Search className="size-3.5" aria-hidden />
                Live search
              </div>
              <p className="mt-1.5 text-sm font-semibold text-white">dentist in Madurai</p>
              <p className="mt-0.5 text-xs text-white/55">Grouped by category, business and district</p>
            </Link>

            <Link
              to={urls.business('kovai-prime-builders')}
              aria-label="View sample profile: Kovai Prime Builders, Coimbatore"
              className="absolute right-[-6%] bottom-[-2%] w-60 rounded-xl border border-white/10 bg-white p-3.5 text-navy-950 shadow-panel transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-navy-950 text-xs font-bold text-white">KP</span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-sm font-bold">
                    Kovai Prime Builders
                    <BadgeCheck className="size-4 shrink-0 fill-brand-600 text-white" aria-hidden />
                  </p>
                  <p className="flex items-center gap-1 text-xs text-navy-500">
                    <MapPin className="size-3" aria-hidden />
                    Saravanampatti, Coimbatore
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[0.6875rem] font-semibold">
                <span className="rounded-md bg-navy-950 py-1.5 text-white">Call</span>
                <span className="rounded-md border border-line py-1.5">WhatsApp</span>
                <span className="rounded-md border border-line py-1.5">Profile</span>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
