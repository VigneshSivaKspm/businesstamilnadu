import { useEffect, useRef } from 'react';
import { ArrowRight, Mail, MessageCircle, Phone, Plus, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import { mainNav, site } from '@/config/site';
import { useOverlay } from '@/hooks/useOverlay';
import { cn } from '@/lib/cn';
import { telHref, whatsappHref } from '@/utils/format';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

/** Slide-in navigation drawer for small screens (focus-trapped, Escape to close). */
export function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useOverlay(open, panelRef, onClose);

  // Close when the route changes (e.g. browser back).
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="animate-fade-in absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        tabIndex={-1}
        className="animate-slide-in-right absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-panel outline-none"
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-line px-4">
          <Logo onClick={onClose} />
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-lg text-navy-800 hover:bg-navy-50"
            aria-label="Close menu"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {mainNav.map((item, index) => (
              <li key={item.to} className="animate-fade-up" style={{ animationDelay: `${index * 30}ms` }}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-colors',
                      isActive ? 'bg-navy-50 text-navy-950' : 'text-navy-700 hover:bg-navy-50/70 hover:text-navy-950',
                    )
                  }
                >
                  {'shortLabel' in item ? item.shortLabel : item.label}
                  <ArrowRight className="size-4 text-navy-300" aria-hidden />
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 px-1">
            <Button
              to="/register-business"
              onClick={onClose}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<Plus className="size-4" aria-hidden />}
            >
              List Your Business
            </Button>
            <p className="mt-2 text-center text-xs text-navy-400">Free to submit · Reviewed by our team</p>
          </div>
        </nav>

        <div className="border-t border-line bg-paper px-5 py-5">
          <p className="text-label text-navy-400">Contact us</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <a href={telHref(site.contact.phone)} className="flex items-center gap-3 font-medium text-navy-800 hover:text-brand-700">
                <Phone className="size-4 text-navy-400" aria-hidden />
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={whatsappHref(site.contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 font-medium text-navy-800 hover:text-brand-700"
              >
                <MessageCircle className="size-4 text-navy-400" aria-hidden />
                WhatsApp support
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className="flex items-center gap-3 font-medium text-navy-800 hover:text-brand-700">
                <Mail className="size-4 text-navy-400" aria-hidden />
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
