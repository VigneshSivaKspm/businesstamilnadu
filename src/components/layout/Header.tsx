import { useCallback, useState } from 'react';
import { Menu, Phone, Plus, Search } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { Logo } from '@/components/common/Logo';
import { mainNav, site } from '@/config/site';
import { useScrolled } from '@/hooks/useScrolled';
import { cn } from '@/lib/cn';
import { telHref } from '@/utils/format';
import { MobileNav } from './MobileNav';

/**
 * Sticky header. On the homepage it starts transparent over the dark hero and
 * becomes a solid, elevated bar after scrolling.
 */
export function Header() {
  const { pathname } = useLocation();
  const scrolled = useScrolled(12);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const overHero = pathname === '/' && !scrolled;

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
          overHero
            ? 'border-b border-white/0 bg-navy-950'
            : 'border-b border-line/80 bg-white/90 shadow-[0_1px_0_rgb(15_32_67/0.02),0_8px_24px_-16px_rgb(15_32_67/0.25)] backdrop-blur-md supports-[backdrop-filter]:bg-white/80',
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
          <Logo tone={overHero ? 'inverse' : 'default'} />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'relative inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold transition-colors',
                        'after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:transition-transform after:duration-200 hover:after:scale-x-100',
                        overHero
                          ? 'text-white/75 after:bg-gold-400 hover:text-white'
                          : 'text-navy-700 after:bg-brand-600 hover:text-navy-950',
                        isActive && (overHero ? 'text-white after:scale-x-100' : 'text-navy-950 after:scale-x-100'),
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/search"
              aria-label="Search businesses"
              className={cn(
                'grid size-10 place-items-center rounded-lg transition-colors xl:hidden',
                overHero ? 'text-white/80 hover:bg-white/10 hover:text-white' : 'text-navy-700 hover:bg-navy-50',
              )}
            >
              <Search className="size-5" aria-hidden />
            </Link>
            <a
              href={telHref(site.contact.phone)}
              className={cn(
                'hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors xl:inline-flex',
                overHero ? 'text-white/80 hover:text-white' : 'text-navy-700 hover:text-navy-950',
              )}
            >
              <Phone className="size-4" aria-hidden />
              {site.contact.phone}
            </a>
            <Button
              to="/register-business"
              variant={overHero ? 'accent' : 'primary'}
              size="sm"
              className="hidden sm:inline-flex lg:h-10 lg:px-4"
              leftIcon={<Plus className="size-4" aria-hidden />}
            >
              List Your Business
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className={cn(
                'grid size-10 place-items-center rounded-lg transition-colors lg:hidden',
                overHero ? 'text-white hover:bg-white/10' : 'text-navy-900 hover:bg-navy-50',
              )}
            >
              <Menu className="size-5.5" aria-hidden />
            </button>
          </div>
        </Container>
      </header>
      <MobileNav open={menuOpen} onClose={closeMenu} />
    </>
  );
}
