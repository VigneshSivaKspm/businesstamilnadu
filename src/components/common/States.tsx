import type { ReactNode } from 'react';
import { AlertTriangle, RotateCcw, SearchX } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No businesses found',
  description = 'Try changing your district, category, or search term.',
  icon,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-card border border-dashed border-navy-200 bg-white px-6 py-14 text-center',
        className,
      )}
      role="status"
    >
      <div className="grid size-14 place-items-center rounded-2xl bg-navy-50 text-navy-500">
        {icon ?? <SearchX className="size-6" aria-hidden />}
      </div>
      <h3 className="text-h3 mt-5">{title}</h3>
      <p className="text-body-sm mt-2 max-w-md text-navy-500">{description}</p>
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** Shown when data fails to load (network or backend errors). */
export function ErrorState({
  title = 'We couldn’t load this content',
  description = 'Please check your connection and try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center rounded-card border border-red-100 bg-red-50/50 px-6 py-12 text-center', className)} role="alert">
      <div className="grid size-12 place-items-center rounded-xl bg-red-100 text-red-600">
        <AlertTriangle className="size-5" aria-hidden />
      </div>
      <h3 className="text-h4 mt-4">{title}</h3>
      <p className="text-body-sm mt-1.5 text-navy-500">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" leftIcon={<RotateCcw className="size-4" aria-hidden />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
