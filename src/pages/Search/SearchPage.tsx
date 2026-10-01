import { ArrowRight, LayoutGrid, MapPin } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { BusinessExplorer } from '@/components/business/BusinessExplorer';
import { SearchBar } from '@/components/search/SearchBar';
import { heroSearchExamples } from '@/config/site';
import { urls } from '@/lib/urls';
import { categoryService, districtService } from '@/services';
import { interpretQuery } from '@/services/businessService';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const districtParam = params.get('district') ?? '';
  const { district: effectiveDistrict } = interpretQuery(q, districtParam || undefined);
  const district = districtService.getDistrict(effectiveDistrict);
  const extractedPlace = effectiveDistrict && effectiveDistrict !== districtParam ? district : undefined;
  const keywordText = extractedPlace ? districtService.extractPlace(q).rest : q;

  const categoryMatches = keywordText.trim() ? categoryService.search(keywordText, 8) : [];
  const title = q
    ? `Results for “${q}”${district && !extractedPlace ? ` in ${district.name}` : ''}`
    : district
      ? `Search businesses in ${district.name}`
      : 'Search Businesses';

  return (
    <>
      <SEO
        title={q ? `${q}${district ? ` in ${district.name}` : ''} — Search` : 'Search Businesses'}
        description="Search businesses, services and professionals across Tamil Nadu by name, category, service, district or locality."
        canonicalPath="/search"
        noindex={Boolean(q)}
      />
      <PageHero
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Search', path: '/search' },
        ]}
        eyebrow="Search"
        title={title}
        description={
          extractedPlace
            ? `Showing matches in ${extractedPlace.name}, based on your search.`
            : 'Search by business name, service, category, district or locality — for example “dentist Chennai” or “builders Coimbatore”.'
        }
      >
        <SearchBar key={params.toString()} variant="inline" initialQuery={q} initialDistrict={districtParam} className="max-w-4xl" autoFocus={!q} />

        {categoryMatches.length > 0 && (
          <div className="mt-6">
            <p className="text-label flex items-center gap-1.5 text-[0.6875rem] text-navy-500">
              <LayoutGrid className="size-3.5" aria-hidden />
              Matching categories
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categoryMatches.map(({ category, subcategory }) => {
                const item = category ?? subcategory!;
                const icon = category ? category.icon : categoryService.getParent(subcategory!).icon;
                const href = district ? urls.districtCategory(district.slug, item.slug) : urls.category(item.slug);
                return (
                  <li key={item.slug}>
                    <Link
                      to={href}
                      className="group inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white pr-3 pl-2.5 text-sm font-semibold text-navy-800 transition-colors hover:border-navy-300 hover:text-navy-950"
                    >
                      <CategoryIcon icon={icon} className="size-4 text-brand-600" />
                      {item.name}
                      {district && <span className="font-normal text-navy-400">in {district.name}</span>}
                      <ArrowRight className="size-3.5 text-navy-300 group-hover:text-navy-700" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!q && (
          <div className="mt-6">
            <p className="text-label text-[0.6875rem] text-navy-500">Try searching for</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {heroSearchExamples.map((term) => (
                <li key={term}>
                  <Link
                    to={urls.search(term, districtParam)}
                    className="inline-flex h-9 items-center rounded-full border border-line bg-white px-3.5 text-sm font-medium text-navy-700 hover:border-navy-300 hover:text-navy-950"
                  >
                    {term}
                  </Link>
                </li>
              ))}
              {!districtParam &&
                ['dentist Chennai', 'builders Coimbatore', 'tax consultant Madurai'].map((term) => (
                  <li key={term}>
                    <Link
                      to={urls.search(term)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-sm font-medium text-navy-700 hover:border-navy-300 hover:text-navy-950"
                    >
                      <MapPin className="size-3.5 text-navy-400" aria-hidden />
                      {term}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </PageHero>

      <Container className="py-10 sm:py-12">
        <h2 className="sr-only">Results</h2>
        <BusinessExplorer />
      </Container>
    </>
  );
}
