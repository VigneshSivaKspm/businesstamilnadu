import { Globe, MessageCircle, Navigation, Phone } from 'lucide-react';
import { Button, type ButtonSize } from '@/components/common/Button';
import { cn } from '@/lib/cn';
import { analyticsService } from '@/services/analyticsService';
import type { Business } from '@/types';
import { directionsHref, telHref, whatsappHref } from '@/utils/format';

type Action = 'call' | 'whatsapp' | 'website' | 'directions';

interface ContactButtonsProps {
  business: Business;
  actions?: Action[];
  size?: ButtonSize;
  className?: string;
  /** Stretch buttons to fill the row equally. */
  stretch?: boolean;
}

/**
 * Call / WhatsApp / Website / Directions actions. Actions without the
 * underlying data are omitted rather than shown disabled.
 */
export function ContactButtons({
  business,
  actions = ['call', 'whatsapp', 'website', 'directions'],
  size = 'md',
  className,
  stretch,
}: ContactButtonsProps) {
  const available = actions.filter((action) => {
    if (action === 'call') return Boolean(business.phone);
    if (action === 'whatsapp') return Boolean(business.whatsapp);
    if (action === 'website') return Boolean(business.website);
    return Boolean(business.address || (business.latitude && business.longitude));
  });

  const iconClass = 'size-4';
  const message = `Hello ${business.name}, I found your business on Business Tamil Nadu.`;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {available.map((action) => {
        const common = {
          size,
          className: cn(stretch && 'flex-1'),
          onClick: () => analyticsService.trackLead(business.id, action),
        } as const;
        switch (action) {
          case 'call':
            return (
              <Button key={action} {...common} href={telHref(business.phone!)} variant="primary" leftIcon={<Phone className={iconClass} aria-hidden />}>
                Call Now
              </Button>
            );
          case 'whatsapp':
            return (
              <Button
                key={action}
                {...common}
                href={whatsappHref(business.whatsapp!, message)}
                variant="secondary"
                leftIcon={<MessageCircle className={cn(iconClass, 'text-emerald-600')} aria-hidden />}
              >
                WhatsApp
              </Button>
            );
          case 'website':
            return (
              <Button key={action} {...common} href={business.website!} variant="secondary" leftIcon={<Globe className={iconClass} aria-hidden />}>
                Website
              </Button>
            );
          case 'directions':
            return (
              <Button
                key={action}
                {...common}
                href={directionsHref(business)}
                variant="secondary"
                leftIcon={<Navigation className={iconClass} aria-hidden />}
              >
                Directions
              </Button>
            );
        }
      })}
    </div>
  );
}
