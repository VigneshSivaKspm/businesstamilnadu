import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
}

/** 1 … 4 5 [6] 7 8 … 20 */
function getPageItems(page: number, pageCount: number): Array<number | 'gap'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const items: Array<number | 'gap'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) items.push('gap');
  for (let p = start; p <= end; p++) items.push(p);
  if (end < pageCount - 1) items.push('gap');
  items.push(pageCount);
  return items;
}

export function Pagination({ page, pageCount, onChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const items = getPageItems(page, pageCount);
  const navButton =
    'inline-flex h-10 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-sm font-semibold text-navy-800 transition-colors hover:border-navy-200 hover:bg-navy-50 disabled:pointer-events-none disabled:opacity-40';

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-between gap-3 sm:justify-center', className)}>
      <button type="button" className={navButton} onClick={() => onChange(page - 1)} disabled={page <= 1}>
        <ChevronLeft className="size-4" aria-hidden />
        <span>Previous</span>
      </button>

      <ol className="hidden items-center gap-1 sm:flex">
        {items.map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className="px-1.5 text-sm text-navy-400" aria-hidden>
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  'size-10 rounded-control text-sm font-semibold transition-colors',
                  item === page ? 'bg-navy-950 text-white' : 'text-navy-700 hover:bg-navy-50',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>
      <p className="text-sm font-medium text-navy-600 sm:hidden" aria-live="polite">
        Page {page} of {pageCount}
      </p>

      <button type="button" className={navButton} onClick={() => onChange(page + 1)} disabled={page >= pageCount}>
        <span>Next</span>
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
