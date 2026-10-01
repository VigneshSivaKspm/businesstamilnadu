import { useRef, type ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useOverlay } from '@/hooks/useOverlay';
import { cn } from '@/lib/cn';

export function AdminPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && <div className="mb-3">{back}</div>}
        <h1 className="text-[1.625rem] leading-tight font-bold tracking-tight text-navy-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-navy-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const pillTones = {
  pending: 'bg-gold-50 text-gold-700 ring-gold-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  live: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  suspended: 'bg-navy-100 text-navy-700 ring-navy-200',
  new: 'bg-brand-50 text-brand-700 ring-brand-200',
  read: 'bg-navy-50 text-navy-600 ring-navy-100',
  archived: 'bg-navy-50 text-navy-500 ring-navy-100',
} as const;

const pillLabels: Partial<Record<keyof typeof pillTones, string>> = { approved: 'Live', live: 'Live' };

export function StatusPill({ status, label, className }: { status: string; label?: string; className?: string }) {
  const key = status as keyof typeof pillTones;
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[0.6875rem] font-semibold capitalize ring-1 ring-inset',
        pillTones[key] ?? pillTones.read,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label ?? pillLabels[key] ?? status}
    </span>
  );
}

export function Panel({ title, children, actions, className, bodyClassName }: {
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('rounded-card border border-line bg-white', className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-bold text-navy-950">{title}</h2>
          {actions}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

/** Label/value grid used on detail screens. */
export function DetailList({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-medium text-navy-500">{label}</dt>
          <dd className="mt-0.5 text-sm break-words text-navy-900">{value || <span className="text-navy-300">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'default';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

/** Accessible confirmation modal (focus-trapped, Escape to cancel). */
export function ConfirmDialog({ open, title, description, confirmLabel, tone = 'default', busy, onConfirm, onCancel, children }: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlay(open, panelRef, onCancel);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4">
      <div className="animate-fade-in absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" onClick={onCancel} aria-hidden />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        tabIndex={-1}
        className="animate-fade-up relative w-full max-w-md rounded-2xl bg-white p-6 shadow-panel outline-none"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 grid size-9 place-items-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-800"
          aria-label="Close"
        >
          <X className="size-4" aria-hidden />
        </button>
        <div className="flex gap-4">
          {tone === 'danger' && (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle className="size-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0 pr-6">
            <h2 id="confirm-title" className="text-h4">
              {title}
            </h2>
            {description && <div className="mt-1.5 text-sm text-navy-600">{description}</div>}
          </div>
        </div>
        {children && <div className="mt-5">{children}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className={cn(tone === 'danger' && 'bg-red-600 shadow-none hover:bg-red-700')}
            loading={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Segmented tabs used for status filters. */
export function FilterTabs<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; count?: number }>;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="scrollbar-none flex gap-1 overflow-x-auto rounded-control bg-navy-100/60 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-2 rounded-[9px] px-3.5 text-sm font-semibold transition-colors',
            value === o.value ? 'bg-white text-navy-950 shadow-soft' : 'text-navy-600 hover:text-navy-950',
          )}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={cn('rounded-full px-1.5 text-[0.6875rem] tabular-nums', value === o.value ? 'bg-navy-950 text-white' : 'bg-navy-200/70 text-navy-700')}>
              {o.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
