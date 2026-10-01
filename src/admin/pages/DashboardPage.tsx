import type { ReactNode } from 'react';
import { AlertTriangle, ArrowRight, BadgeCheck, Inbox, Sparkles, Store, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/common/Skeleton';
import { cn } from '@/lib/cn';
import { categoryService, districtService } from '@/services';
import { adminApi } from '../api';
import { useAdmin } from '../AdminContext';
import { AdminPageHeader, Panel, StatusPill } from '../components/AdminUi';
import { timeAgo, useApi } from '../hooks';

function StatCard({ label, value, to, Icon, accent, hint }: { label: string; value?: number; to: string; Icon: typeof Store; accent?: boolean; hint?: ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex flex-col rounded-card border p-5 transition-[border-color,box-shadow] hover:shadow-soft',
        accent ? 'border-gold-200 bg-gold-50/60 hover:border-gold-300' : 'border-line bg-white hover:border-navy-200',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-navy-600">{label}</span>
        <Icon className={cn('size-5', accent ? 'text-gold-600' : 'text-navy-400')} aria-hidden />
      </div>
      {value === undefined ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <span className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 tabular-nums">{value}</span>
      )}
      {hint && <span className="mt-1 text-xs text-navy-500">{hint}</span>}
    </Link>
  );
}

export default function DashboardPage() {
  const { admin, stats } = useAdmin();
  const pending = useApi('dash:pending', () => adminApi.registrations.list({ status: 'pending', pageSize: 5 }));
  const messages = useApi('dash:messages', () => adminApi.messages.list({ status: 'inbox', pageSize: 5 }));
  const activity = useApi('dash:activity', () => adminApi.activity());

  return (
    <>
      <AdminPageHeader title={`Welcome back, ${admin?.name.split(' ')[0] ?? ''}`} description="Here’s what needs your attention today." />

      {!!stats?.businesses.demo && (
        <div className="mb-6 flex flex-col gap-3 rounded-card border border-gold-200 bg-gold-50 p-4 text-sm text-gold-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <strong className="font-semibold">{stats.businesses.demo} sample listings</strong> are still live. Remove or replace them
              before launch.
            </span>
          </p>
          <Link to="/admin/listings?demo=true" className="shrink-0 font-semibold underline-offset-4 hover:underline">
            Review sample listings
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Pending registrations" value={stats?.registrations.pending} to="/admin/registrations" Icon={UserPlus} accent={!!stats?.registrations.pending} />
        <StatCard label="New messages" value={stats?.messages.new} to="/admin/messages" Icon={Inbox} accent={!!stats?.messages.new} />
        <StatCard
          label="Live listings"
          value={stats?.businesses.approved}
          to="/admin/listings?status=approved"
          Icon={Store}
          hint={stats ? `${stats.businesses.suspended} suspended` : undefined}
        />
        <StatCard
          label="Verified"
          value={stats?.businesses.verified}
          to="/admin/listings?verified=true"
          Icon={BadgeCheck}
          hint={stats ? `${stats.businesses.featured} featured` : undefined}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Awaiting review"
          actions={
            <Link to="/admin/registrations" className="text-xs font-semibold text-brand-700 hover:text-navy-950">
              View all
            </Link>
          }
          bodyClassName="p-0"
        >
          {pending.data?.items.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-navy-500">No registrations waiting. Nice work.</p>
          ) : (
            <ul className="divide-y divide-line">
              {(pending.data?.items ?? []).map((r) => (
                <li key={r.id}>
                  <Link to={`/admin/registrations/${r.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-navy-50/50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-navy-950">{r.businessName}</span>
                      <span className="block truncate text-xs text-navy-500">
                        {categoryService.getSubcategory(r.subcategoryId)?.name ?? r.categoryId} · {districtService.getDistrict(r.district)?.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-navy-400">{timeAgo(r.submittedAt)}</span>
                    <ArrowRight className="size-4 shrink-0 text-navy-300" aria-hidden />
                  </Link>
                </li>
              ))}
              {!pending.data && <li className="p-5"><Skeleton className="h-24" /></li>}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent messages"
          actions={
            <Link to="/admin/messages" className="text-xs font-semibold text-brand-700 hover:text-navy-950">
              Open inbox
            </Link>
          }
          bodyClassName="p-0"
        >
          {messages.data?.items.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-navy-500">Inbox zero.</p>
          ) : (
            <ul className="divide-y divide-line">
              {(messages.data?.items ?? []).map((m) => (
                <li key={m.id}>
                  <Link to={`/admin/messages/${m.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-navy-50/50">
                    <span className={cn('size-2 shrink-0 rounded-full', m.status === 'new' ? 'bg-brand-600' : 'bg-transparent')} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-sm text-navy-950', m.status === 'new' ? 'font-bold' : 'font-medium')}>{m.name}</span>
                      <span className="block truncate text-xs text-navy-500">{m.message}</span>
                    </span>
                    <span className="shrink-0 text-xs text-navy-400">{timeAgo(m.createdAt)}</span>
                  </Link>
                </li>
              ))}
              {!messages.data && <li className="p-5"><Skeleton className="h-24" /></li>}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent activity" className="mt-6" bodyClassName="p-0">
        {activity.data?.items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-navy-500">Actions taken by admins will appear here.</p>
        ) : (
          <ol className="divide-y divide-line">
            {(activity.data?.items ?? []).slice(0, 10).map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-navy-300" aria-hidden />
                <span className="min-w-0 flex-1 text-navy-700">
                  <strong className="font-semibold text-navy-950">{a.adminName}</strong> — {a.summary}
                </span>
                <StatusPill status="read" label={a.targetType} className="hidden sm:inline-flex" />
                <span className="shrink-0 text-xs text-navy-400">{timeAgo(a.at)}</span>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </>
  );
}
