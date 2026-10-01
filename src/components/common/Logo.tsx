import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { cn } from '@/lib/cn';

interface LogoProps {
  tone?: 'default' | 'inverse';
  className?: string;
  onClick?: () => void;
}

/** Brand mark: monogram tile with a gold "node" + wordmark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-9 shrink-0', className)} aria-hidden>
      <rect width="40" height="40" rx="10" className="fill-navy-950" />
      <path
        d="M12.5 11h9.1c4 0 6.6 2 6.6 5.2 0 2.1-1.1 3.6-2.9 4.3 2.4.6 3.9 2.4 3.9 4.8 0 3.5-2.8 5.7-7.1 5.7h-9.6V11Zm8.3 8.2c1.9 0 3-.9 3-2.4s-1.1-2.3-3-2.3h-3.9v4.7h3.9Zm.6 8.3c2 0 3.2-.9 3.2-2.6 0-1.6-1.2-2.5-3.2-2.5h-4.5v5.1h4.5Z"
        fill="#fff"
      />
      <circle cx="30" cy="11" r="2.6" className="fill-gold-400" />
    </svg>
  );
}

export function Logo({ tone = 'default', className, onClick }: LogoProps) {
  const inverse = tone === 'inverse';
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn('group inline-flex min-w-0 items-center gap-2.5', className)}
      aria-label={`${site.name} — home`}
    >
      <LogoMark className={cn(inverse && '[&_rect]:fill-white/10')} />
      <span className="flex min-w-0 flex-col leading-none">
        <span className={cn('truncate text-[0.9375rem] font-extrabold tracking-[0.06em]', inverse ? 'text-white' : 'text-navy-950')}>
          BUSINESS <span className={inverse ? 'text-gold-300' : 'text-brand-700'}>TAMIL NADU</span>
        </span>
        <span className={cn('mt-1 truncate text-[0.625rem] font-medium tracking-[0.14em] uppercase', inverse ? 'text-white/55' : 'text-navy-400')}>
          {site.tagline}
        </span>
      </span>
    </Link>
  );
}
