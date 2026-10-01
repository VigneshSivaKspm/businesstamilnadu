import { ArrowRight, Compass, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { SEO } from '@/components/common/SEO';
import { SearchBar } from '@/components/search/SearchBar';

const shortcuts = [
  { label: 'Browse all categories', to: '/categories' },
  { label: 'Explore all 38 districts', to: '/districts' },
  { label: 'List your business', to: '/register-business' },
  { label: 'Contact support', to: '/contact' },
];

interface NotFoundPageProps {
  title?: string;
  description?: string;
}

export default function NotFoundPage({
  title = 'Page Not Found',
  description = 'The page you’re looking for doesn’t exist or may have moved. Try a search, or head back to explore businesses across Tamil Nadu.',
}: NotFoundPageProps) {
  return (
    <>
      <SEO title={title} description={description} noindex />
      <section className="relative overflow-hidden bg-white">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />
        <Container size="narrow" className="relative py-20 text-center sm:py-28">
          <p className="text-label text-brand-600">Error 404</p>
          <h1 className="text-h1 mt-3">{title}</h1>
          <p className="text-body mx-auto mt-4 max-w-xl text-navy-500">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/" variant="primary" size="lg" leftIcon={<Home className="size-4" aria-hidden />}>
              Go Home
            </Button>
            <Button to="/businesses" variant="secondary" size="lg" leftIcon={<Compass className="size-4" aria-hidden />}>
              Explore Businesses
            </Button>
          </div>
          <SearchBar variant="inline" className="mx-auto mt-12 max-w-3xl text-left" />
          <ul className="mx-auto mt-10 grid max-w-xl gap-2 text-left sm:grid-cols-2">
            {shortcuts.map((s) => (
              <li key={s.to}>
                <Link
                  to={s.to}
                  className="group flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy-800 hover:border-navy-200 hover:bg-navy-50"
                >
                  {s.label}
                  <ArrowRight className="size-4 text-navy-300 transition-transform group-hover:translate-x-0.5 group-hover:text-navy-700" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
