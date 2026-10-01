import { useEffect } from 'react';
import { MessageCircle, Navigation, Phone } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import type { Business } from '@/types';
import { directionsHref, telHref, whatsappHref } from '@/utils/format';

/** Sticky bottom contact bar on small screens for business profiles. */
export function MobileContactBar({ business }: { business: Business }) {
  // Reserve space so the bar never covers the footer.
  useEffect(() => {
    document.body.classList.add('has-contact-bar');
    return () => document.body.classList.remove('has-contact-bar');
  }, []);

  const item =
    'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[0.6875rem] font-semibold transition-colors';
  return (
    <nav
      aria-label="Quick contact"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(15_32_67/0.2)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-md gap-2">
        {business.phone && (
          <a
            href={telHref(business.phone)}
            onClick={() => analyticsService.trackLead(business.id, 'call')}
            className={`${item} bg-navy-950 text-white`}
          >
            <Phone className="size-4.5" aria-hidden />
            Call
          </a>
        )}
        {business.whatsapp && (
          <a
            href={whatsappHref(business.whatsapp, `Hello ${business.name}, I found your business on Business Tamil Nadu.`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analyticsService.trackLead(business.id, 'whatsapp')}
            className={`${item} bg-emerald-50 text-emerald-800`}
          >
            <MessageCircle className="size-4.5" aria-hidden />
            WhatsApp
          </a>
        )}
        <a
          href={directionsHref(business)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analyticsService.trackLead(business.id, 'directions')}
          className={`${item} bg-navy-50 text-navy-900`}
        >
          <Navigation className="size-4.5" aria-hidden />
          Directions
        </a>
      </div>
    </nav>
  );
}
