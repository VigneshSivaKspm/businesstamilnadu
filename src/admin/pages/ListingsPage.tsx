import { useState } from 'react';
import { BadgeCheck, ExternalLink, Pencil, Plus, Sparkles, Store, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Pagination } from '@/components/common/Pagination';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState, ErrorState } from '@/components/common/States';
import { useToast } from '@/components/common/Toast';
import { BusinessLogo } from '@/components/business/BusinessLogo';
import { SelectControl } from '@/components/forms/Field';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import { categoryService, districtService } from '@/services';
import type { Business } from '@/types';
import { adminApi } from '../api';
import { useAdmin } from '../AdminContext';
import { AdminPageHeader, ConfirmDialog, StatusPill } from '../components/AdminUi';
import { SearchInput } from '../components/ListControls';
import { timeAgo, useAdminParams, useApi } from '../hooks';

function Toggle({ on, label, onClick, Icon, tone }: { on: boolean; label: string; onClick: () => void; Icon: typeof BadgeCheck; tone: 'brand' | 'gold' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-8 place-items-center rounded-lg border transition-colors',
        on
          ? tone === 'brand'
            ? 'border-brand-200 bg-brand-50 text-brand-700'
            : 'border-gold-200 bg-gold-50 text-gold-600'
          : 'border-line bg-white text-navy-300 hover:text-navy-600',
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

export default function ListingsPage() {
  const notify = useToast();
  const { refreshStats } = useAdmin();
  const { values, page, set, key } = useAdminParams({
    q: '',
    status: 'all',
    district: '',
    category: '',
    verified: '',
    featured: '',
    demo: '',
    sort: 'updated',
  });
  const { data, error, reload, setData } = useApi(`listings:${key}`, () => adminApi.businesses.list({ ...values, page, pageSize: 20 }));
  const [toDelete, setToDelete] = useState<Business | null>(null);
  const [busy, setBusy] = useState(false);

  const patch = async (business: Business, changes: Partial<Pick<Business, 'verified' | 'featured' | 'status'>>, message: string) => {
    // Optimistic update, rolled back on failure.
    setData((d) => (d ? { ...d, items: d.items.map((b) => (b.id === business.id ? { ...b, ...changes } : b)) } : d));
    try {
      await adminApi.businesses.patch(business.id, changes);
      notify(message);
      refreshStats();
    } catch (err) {
      setData((d) => (d ? { ...d, items: d.items.map((b) => (b.id === business.id ? business : b)) } : d));
      notify(err instanceof ApiError ? err.message : 'Update failed.', 'info');
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await adminApi.businesses.remove(toDelete.id);
      notify(`${toDelete.name} deleted`);
      refreshStats();
      reload();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Delete failed.', 'info');
    } finally {
      setBusy(false);
      setToDelete(null);
    }
  };

  const filterSelect = (name: keyof typeof values, label: string, options: Array<{ value: string; label: string }>) => (
    <div className="min-w-0">
      <label htmlFor={`f-${name}`} className="sr-only">
        {label}
      </label>
      <SelectControl id={`f-${name}`} value={values[name]} onChange={(e) => set({ [name]: e.target.value })} className="h-10 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectControl>
    </div>
  );

  const hasFilters = ['q', 'district', 'category', 'verified', 'featured', 'demo'].some((k) => values[k as keyof typeof values]) || values.status !== 'all';

  return (
    <>
      <AdminPageHeader
        title="Listings"
        description={data ? `${data.total} listing${data.total === 1 ? '' : 's'}${hasFilters ? ' match these filters' : ' in the directory'}` : 'Every business in the directory.'}
        actions={
          <Button to="/admin/listings/new" variant="primary" leftIcon={<Plus className="size-4" aria-hidden />}>
            New listing
          </Button>
        }
      />

      <div className="mb-5 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput label="listings" value={values.q} onChange={(q) => set({ q })} placeholder="Name, slug, phone, locality…" />
          {hasFilters && (
            <button type="button" onClick={() => set({ q: '', status: 'all', district: '', category: '', verified: '', featured: '', demo: '' })} className="text-sm font-semibold text-brand-700 hover:text-navy-950">
              Clear filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
          {filterSelect('status', 'Status', [
            { value: 'all', label: 'Any status' },
            { value: 'approved', label: 'Live' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'pending', label: 'Pending' },
          ])}
          {filterSelect('district', 'District', [{ value: '', label: 'All districts' }, ...districtService.getAll().map((d) => ({ value: d.slug, label: d.name }))])}
          {filterSelect('category', 'Category', [{ value: '', label: 'All categories' }, ...categoryService.getSorted().map((c) => ({ value: c.slug, label: c.name }))])}
          {filterSelect('verified', 'Verified', [
            { value: '', label: 'Verified: any' },
            { value: 'true', label: 'Verified' },
            { value: 'false', label: 'Not verified' },
          ])}
          {filterSelect('featured', 'Featured', [
            { value: '', label: 'Featured: any' },
            { value: 'true', label: 'Featured' },
            { value: 'false', label: 'Not featured' },
          ])}
          {filterSelect('demo', 'Sample listings', [
            { value: '', label: 'Samples: any' },
            { value: 'true', label: 'Sample listings' },
            { value: 'false', label: 'Real listings' },
          ])}
          {filterSelect('sort', 'Sort', [
            { value: 'updated', label: 'Recently updated' },
            { value: 'created', label: 'Recently added' },
            { value: 'name', label: 'Name A–Z' },
          ])}
        </div>
      </div>

      {error ? (
        <ErrorState onRetry={reload} description={error.message} />
      ) : !data ? (
        <Skeleton className="h-96 rounded-card" />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={<Store className="size-6" aria-hidden />}
          title="No listings found"
          description={hasFilters ? 'Try changing the filters.' : 'Approve a registration or create a listing to get started.'}
          actions={
            <Button to="/admin/listings/new" variant="primary">
              New listing
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="hidden border-b border-line bg-navy-50/60 text-xs font-semibold text-navy-500 lg:table-header-group">
              <tr>
                <th className="px-5 py-3">Business</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Badges</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((b) => {
                const live = b.status === 'approved' || !b.status;
                return (
                  <tr key={b.id} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 px-4 py-4 lg:table-row lg:p-0">
                    <td className="col-span-2 min-w-0 lg:px-5 lg:py-3">
                      <div className="flex items-center gap-3">
                        <BusinessLogo name={b.name} logo={b.logo} size="sm" />
                        <div className="min-w-0">
                          <Link to={`/admin/listings/${b.id}`} className="block truncate font-semibold text-navy-950 hover:text-brand-700">
                            {b.name}
                          </Link>
                          <span className="block truncate text-xs text-navy-500">
                            {b.categoryName}
                            {b.isDemo && <span className="ml-2 rounded bg-navy-100 px-1.5 py-px text-[0.625rem] font-semibold text-navy-600 uppercase">Sample</span>}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-navy-700 lg:px-4 lg:py-3">{districtService.getDistrict(b.district)?.name ?? b.district}</td>
                    <td className="text-right lg:px-4 lg:py-3 lg:text-left">
                      <StatusPill status={b.status ?? 'approved'} />
                    </td>
                    <td className="lg:px-4 lg:py-3">
                      <div className="flex gap-1.5">
                        <Toggle on={b.verified} label={b.verified ? 'Remove verified badge' : 'Mark as verified'} Icon={BadgeCheck} tone="brand" onClick={() => patch(b, { verified: !b.verified }, b.verified ? 'Verified badge removed' : 'Marked as verified')} />
                        <Toggle on={b.featured} label={b.featured ? 'Remove featured' : 'Feature listing'} Icon={Sparkles} tone="gold" onClick={() => patch(b, { featured: !b.featured }, b.featured ? 'No longer featured' : 'Now featured')} />
                      </div>
                    </td>
                    <td className="hidden text-xs text-navy-500 lg:table-cell lg:px-4 lg:py-3">{timeAgo(b.updatedAt ?? b.createdAt)}</td>
                    <td className="col-span-2 lg:px-4 lg:py-3">
                      <div className="flex flex-wrap items-center gap-1 lg:justify-end">
                        <Button to={`/admin/listings/${b.id}`} size="sm" variant="secondary" leftIcon={<Pencil className="size-3.5" aria-hidden />}>
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => patch(b, { status: live ? 'suspended' : 'approved' }, live ? `${b.name} suspended` : `${b.name} is live`)}
                          className="h-9 rounded-[10px] px-3 text-sm font-semibold text-navy-700 hover:bg-navy-50"
                        >
                          {live ? 'Suspend' : 'Publish'}
                        </button>
                        {live && (
                          <a
                            href={`/business/${b.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grid size-9 place-items-center rounded-[10px] text-navy-500 hover:bg-navy-50 hover:text-navy-900"
                            aria-label={`View ${b.name} on the website`}
                            title="View on website"
                          >
                            <ExternalLink className="size-4" aria-hidden />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setToDelete(b)}
                          className="grid size-9 place-items-center rounded-[10px] text-navy-400 hover:bg-red-50 hover:text-red-700"
                          aria-label={`Delete ${b.name}`}
                          title="Delete"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pageCount > 1 && <Pagination className="mt-6" page={data.page} pageCount={data.pageCount} onChange={(p) => set({ page: p })} />}

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete ${toDelete?.name ?? 'listing'}?`}
        description="The listing is removed from the website permanently. To hide it temporarily, use Suspend instead."
        confirmLabel="Delete listing"
        tone="danger"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
