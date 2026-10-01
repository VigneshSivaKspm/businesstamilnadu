import { ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState, ErrorState } from '@/components/common/States';
import { categoryService, districtService } from '@/services';
import type { RegistrationStatus } from '@/types';
import { adminApi } from '../api';
import { useAdmin } from '../AdminContext';
import { AdminPageHeader, FilterTabs, StatusPill } from '../components/AdminUi';
import { SearchInput } from '../components/ListControls';
import { timeAgo, useAdminParams, useApi } from '../hooks';

type StatusFilter = RegistrationStatus | 'all';

export default function RegistrationsPage() {
  const { stats } = useAdmin();
  const { values, page, set, key } = useAdminParams({ status: 'pending', q: '' });
  const status = values.status as StatusFilter;
  const { data, error, reload } = useApi(`regs:${key}`, () =>
    adminApi.registrations.list({ status, q: values.q, page, pageSize: 20 }),
  );

  return (
    <>
      <AdminPageHeader title="Registrations" description="Businesses submitted through “List Your Business”. Review, approve or reject each one." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs<StatusFilter>
          label="Registration status"
          value={status}
          onChange={(v) => set({ status: v })}
          options={[
            { value: 'pending', label: 'Pending', count: stats?.registrations.pending },
            { value: 'approved', label: 'Approved', count: stats?.registrations.approved },
            { value: 'rejected', label: 'Rejected', count: stats?.registrations.rejected },
            { value: 'all', label: 'All' },
          ]}
        />
        <SearchInput label="registrations" value={values.q} onChange={(q) => set({ q })} placeholder="Name, reference, phone, email…" />
      </div>

      {error ? (
        <ErrorState onRetry={reload} description={error.message} />
      ) : !data ? (
        <Skeleton className="h-80 rounded-card" />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="size-6" aria-hidden />}
          title={values.q ? 'No matching registrations' : status === 'pending' ? 'Nothing waiting for review' : 'No registrations here yet'}
          description={status === 'pending' && !values.q ? 'New submissions from the website will appear here.' : 'Try a different filter or search term.'}
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="hidden border-b border-line bg-navy-50/60 text-xs font-semibold text-navy-500 md:table-header-group">
              <tr>
                <th className="px-5 py-3">Business</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((r) => (
                <tr key={r.id} className="relative flex flex-col gap-1 px-5 py-4 hover:bg-navy-50/40 md:table-row md:p-0">
                  <td className="md:px-5 md:py-3.5">
                    <Link to={`/admin/registrations/${r.id}`} className="font-semibold text-navy-950 after:absolute after:inset-0 hover:text-brand-700">
                      {r.businessName}
                    </Link>
                    <span className="block text-xs text-navy-500">
                      {categoryService.getSubcategory(r.subcategoryId)?.name ?? categoryService.getCategory(r.categoryId)?.name}
                      <span className="text-navy-300"> · </span>
                      <span className="font-mono">{r.reference}</span>
                    </span>
                  </td>
                  <td className="text-navy-700 md:px-4 md:py-3.5">
                    {r.locality ? `${r.locality}, ` : ''}
                    {districtService.getDistrict(r.district)?.name}
                  </td>
                  <td className="text-navy-700 md:px-4 md:py-3.5">
                    <span className="block">{r.contactPerson}</span>
                    <span className="block text-xs text-navy-500">{r.phone}</span>
                  </td>
                  <td className="text-xs text-navy-500 md:px-4 md:py-3.5">{timeAgo(r.submittedAt)}</td>
                  <td className="md:px-4 md:py-3.5">
                    <StatusPill status={r.status} label={r.status === 'approved' ? 'Approved' : undefined} />
                  </td>
                  <td className="hidden text-right md:table-cell md:px-4 md:py-3.5">
                    <ArrowRight className="ml-auto size-4 text-navy-300" aria-hidden />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pageCount > 1 && <Pagination className="mt-6" page={data.page} pageCount={data.pageCount} onChange={(p) => set({ page: p })} />}
    </>
  );
}
