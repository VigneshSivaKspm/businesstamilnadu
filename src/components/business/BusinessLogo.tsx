import { cn } from '@/lib/cn';
import { initials } from '@/utils/format';

const palettes = [
  'bg-navy-950 text-white',
  'bg-brand-600 text-white',
  'bg-navy-100 text-navy-800',
  'bg-gold-100 text-gold-700',
  'bg-brand-50 text-brand-700',
  'bg-navy-700 text-white',
];

const sizes = {
  sm: 'size-10 rounded-[10px] text-xs',
  md: 'size-12 rounded-xl text-sm',
  lg: 'size-16 rounded-2xl text-lg',
  xl: 'size-20 rounded-2xl text-2xl sm:size-24',
};

function paletteFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palettes[hash % palettes.length];
}

interface BusinessLogoProps {
  name: string;
  logo?: string;
  size?: keyof typeof sizes;
  className?: string;
}

/** Business logo with a consistent monogram fallback when no logo is uploaded. */
export function BusinessLogo({ name, logo, size = 'md', className }: BusinessLogoProps) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        loading="lazy"
        decoding="async"
        className={cn('shrink-0 border border-line bg-white object-contain', sizes[size], className)}
      />
    );
  }
  return (
    <span
      className={cn('grid shrink-0 place-items-center font-bold tracking-wide', sizes[size], paletteFor(name), className)}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
