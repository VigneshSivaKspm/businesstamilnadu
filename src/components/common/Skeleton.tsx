import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-navy-100/70', className)} aria-hidden />;
}

export function BusinessCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
  return (
    <div className={cn('rounded-card border border-line bg-white p-5', variant === 'list' && 'sm:flex sm:gap-5')}>
      <div className="flex items-start gap-3.5">
        <Skeleton className="size-12 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 flex-1 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-[10px]" />
        <Skeleton className="h-9 flex-1 rounded-[10px]" />
      </div>
    </div>
  );
}

export function BusinessGridSkeleton({ count = 6, variant = 'grid' }: { count?: number; variant?: 'grid' | 'list' }) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-4', variant === 'grid' && 'sm:grid-cols-2 2xl:grid-cols-3')}
      role="status"
      aria-label="Loading businesses"
    >
      {Array.from({ length: count }, (_, i) => (
        <BusinessCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-white p-5">
      <Skeleton className="size-11 rounded-xl" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  );
}

export function DistrictGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading districts">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-20 rounded-card" />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading business profile">
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-3 w-64" />
          <div className="mt-8 flex gap-5">
            <Skeleton className="size-20 rounded-2xl" />
            <div className="flex-1 space-y-3 pt-2">
              <Skeleton className="h-7 w-2/3 max-w-md" />
              <Skeleton className="h-4 w-1/2 max-w-xs" />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-32 rounded-control" />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-48 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </div>
        <Skeleton className="h-80 rounded-card" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" role="status" aria-label="Loading page">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-6 h-10 w-2/3 max-w-xl" />
      <Skeleton className="mt-4 h-4 w-1/2 max-w-md" />
      <div className="mt-12">
        <BusinessGridSkeleton count={3} />
      </div>
    </div>
  );
}
