import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AZFilter } from '@/components/common/AZFilter';
import { Container } from '@/components/common/Container';
import { Logo } from '@/components/common/Logo';
import { SocialIcons } from '@/components/common/SocialIcons';
import { site } from '@/config/site';
import { telHref } from '@/utils/format';

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Businesses', to: '/businesses' },
      { label: 'Categories', to: '/categories' },
      { label: 'Districts', to: '/districts' },
      { label: 'Featured Businesses', to: '/businesses?featured=1' },
      { label: 'Search', to: '/search' },
    ],
  },
  {
    title: 'Business',
    links: [
      { label: 'List Your Business', to: '/register-business' },
      { label: 'Verification', to: '/about#verification' },
      { label: 'Advertising', to: '/contact?subject=advertising' },
      { label: 'Claim Listing', to: '/contact?subject=claim' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Disclaimer', to: '/disclaimer' },
    ],
  },
  {
    title: 'Popular Categories',
    links: [
      { label: 'Healthcare', to: '/categories/healthcare' },
      { label: 'Real Estate', to: '/categories/real-estate' },
      { label: 'Education', to: '/categories/education' },
      { label: 'Restaurants', to: '/categories/restaurants' },
      { label: 'Travel', to: '/categories/travel' },
      { label: 'Technology', to: '/categories/technology' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <Container className="relative">
        <div className="grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-4">
            <Logo tone="inverse" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">{site.description}</p>
            <ul className="mt-6 space-y-2.5 text-sm text-white/75">
              <li>
                <a href={`mailto:${site.contact.email}`} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Mail className="size-4 text-gold-300" aria-hidden />
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a href={telHref(site.contact.phone)} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Phone className="size-4 text-gold-300" aria-hidden />
                  {site.contact.phone}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5">
                <MapPin className="size-4 text-gold-300" aria-hidden />
                {site.contact.address}
              </li>
            </ul>
            <SocialIcons className="mt-6" />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-label text-white/45">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-white/75 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-sm font-semibold text-white/85">Browse Businesses A–Z</h3>
            <AZFilter size="sm" tone="inverse" />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {site.copyrightYear} {site.name}. All Rights Reserved.</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>{site.domain}</span>
            <span>Verified badges reflect review by our team, not government certification.</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
