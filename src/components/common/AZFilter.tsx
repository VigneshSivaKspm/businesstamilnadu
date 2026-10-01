import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { ALPHABET } from '@/utils/format';

interface AZFilterProps {
  /** Currently selected letter (for in-page filtering). */
  active?: string;
  /** Letters that have at least one listing; others are de-emphasised. */
  available?: Record<string, number>;
  /** When provided, letters call this instead of navigating. */
  onSelect?: (letter: string) => void;
  size?: 'sm' | 'md';
  tone?: 'default' | 'inverse';
  className?: string;
}

/** Functional A–Z index linking to /businesses?letter=X. */
export function AZFilter({ active, available, onSelect, size = 'md', tone = 'default', className }: AZFilterProps) {
  const inverse = tone === 'inverse';
  const cell = cn(
    'grid place-items-center rounded-lg font-semibold transition-colors',
    size === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm sm:size-11',
  );

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Browse businesses alphabetically">
      {ALPHABET.map((letter) => {
        const count = available?.[letter] ?? 0;
        const isActive = active === letter;
        const empty = available !== undefined && count === 0;
        const classes = cn(
          cell,
          isActive
            ? 'bg-navy-950 text-white'
            : inverse
              ? 'bg-white/5 text-white/80 hover:bg-white/15 hover:text-white'
              : 'border border-line bg-white text-navy-800 hover:border-navy-300 hover:bg-navy-50',
          empty && !isActive && (inverse ? 'text-white/30' : 'text-navy-300'),
        );
        const label = `Businesses starting with ${letter}${available ? ` (${count})` : ''}`;
        return (
          <li key={letter}>
            {onSelect ? (
              <button
                type="button"
                className={classes}
                aria-pressed={isActive}
                aria-label={label}
                onClick={() => onSelect(isActive ? '' : letter)}
              >
                {letter}
              </button>
            ) : (
              <Link to={`/businesses?letter=${letter}`} className={classes} aria-label={label}>
                {letter}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
