import { useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useOverlay } from '@/hooks/useOverlay';
import { pluralize } from '@/utils/format';
import { FilterSidebar, type FilterSidebarProps } from './FilterSidebar';

interface MobileFiltersProps extends FilterSidebarProps {
  open: boolean;
  onClose: () => void;
  resultCount?: number;
}

/** Bottom-sheet filter panel for small screens. Filters apply live. */
export function MobileFilters({ open, onClose, resultCount, ...sidebarProps }: MobileFiltersProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlay(open, panelRef, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="animate-fade-in absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-filters-title"
        tabIndex={-1}
        className="animate-slide-up absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-white shadow-panel outline-none"
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-navy-200" aria-hidden />
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 id="mobile-filters-title" className="text-h4">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-lg text-navy-700 hover:bg-navy-50"
            aria-label="Close filters"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <FilterSidebar {...sidebarProps} idPrefix="mobile-filter" />
        </div>
        <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>
            {resultCount === undefined ? 'Show results' : `Show ${pluralize(resultCount, 'result')}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
