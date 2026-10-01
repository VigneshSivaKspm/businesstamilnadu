import { useEffect, useState } from 'react';
import { Archive, ArrowLeft, ExternalLink, Inbox, Mail, MailOpen, MessageCircle, Phone, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Pagination } from '@/components/common/Pagination';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState, ErrorState } from '@/components/common/States';
import { useToast } from '@/components/common/Toast';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { ContactMessage, MessageStatus } from '@/types';
import { telHref, whatsappHref } from '@/utils/format';
import { adminApi } from '../api';
import { useAdmin } from '../AdminContext';
import { AdminPageHeader, ConfirmDialog, FilterTabs, StatusPill } from '../components/AdminUi';
import { SearchInput } from '../components/ListControls';
import { formatDateTime, timeAgo, useAdminParams, useApi } from '../hooks';

const SUBJECT_LABELS: Record<string, string> = {
  general: 'General enquiry',
  listing: 'Listing help',
  claim: 'Claim a listing',
  advertising: 'Advertising',
  correction: 'Incorrect information',
  support: 'Technical support',
};

type Filter = MessageStatus | 'inbox' | 'all';

function MessageView({ message, onChanged, onDeleted }: { message: ContactMessage; onChanged: (m: ContactMessage) => void; onDeleted: () => void }) {
  const notify = useToast();
  const { refreshStats } = useAdmin();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const linked = useApi(`msg-biz:${message.businessSlug ?? ''}`, () =>
    message.businessSlug ? adminApi.businesses.list({ q: message.businessSlug, pageSize: 1 }) : Promise.resolve(null),
  );
  const linkedBusiness = linked.data?.items.find((b) => b.slug === message.businessSlug);

  const setStatus = async (status: MessageStatus, toast?: string) => {
    try {
      await adminApi.messages.setStatus(message.id, status);
      onChanged({ ...message, status });
      refreshStats();
      if (toast) notify(toast);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Couldn’t update the message.', 'info');
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminApi.messages.remove(message.id);
      refreshStats();
      notify('Message deleted');
      onDeleted();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Couldn’t delete the message.', 'info');
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  const subject = SUBJECT_LABELS[message.subject] ?? message.subject;
  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${subject} — Business Tamil Nadu`)}&body=${encodeURIComponent(
    `Hello ${message.name},\n\n\n\n— Business Tamil Nadu\n\n> ${message.message.split('\n').join('\n> ')}`,
  )}`;

  return (
    <article className="rounded-card border border-line bg-white">
      <header className="border-b border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={message.status ?? 'new'} />
          <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{subject}</span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-navy-950">{message.name}</h2>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-600">
          <a href={`mailto:${message.email}`} className="hover:text-brand-700">
            {message.email}
          </a>
          {message.phone && (
            <a href={telHref(message.phone)} className="hover:text-brand-700">
              {message.phone}
            </a>
          )}
          <span className="text-navy-400">{formatDateTime(message.createdAt)}</span>
        </p>
      </header>
      <div className="p-5 sm:p-6">
        {message.businessSlug && (
          <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-navy-50 px-3.5 py-2.5 text-sm text-navy-700">
            <span>Regarding listing:</span>
            {linkedBusiness ? (
              <Link to={`/admin/listings/${linkedBusiness.id}`} className="font-semibold text-brand-700 hover:text-navy-950">
                {linkedBusiness.name}
              </Link>
            ) : (
              <span className="font-mono">{message.businessSlug}</span>
            )}
            <a href={`/business/${message.businessSlug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy-500 hover:text-navy-950">
              Public page <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </p>
        )}
        <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-navy-800">{message.message}</p>
      </div>
      <footer className="flex flex-wrap gap-2 border-t border-line p-4 sm:px-6">
        <Button href={replyHref} size="sm" variant="primary" leftIcon={<Mail className="size-4" aria-hidden />}>
          Reply by email
        </Button>
        {message.phone && (
          <Button href={whatsappHref(message.phone)} size="sm" variant="secondary" leftIcon={<MessageCircle className="size-4 text-emerald-600" aria-hidden />}>
            WhatsApp
          </Button>
        )}
        {message.phone && (
          <Button href={telHref(message.phone)} size="sm" variant="secondary" leftIcon={<Phone className="size-4" aria-hidden />}>
            Call
          </Button>
        )}
        <span className="flex-1" />
        {message.status === 'archived' ? (
          <Button size="sm" variant="ghost" leftIcon={<Inbox className="size-4" aria-hidden />} onClick={() => setStatus('read', 'Moved to inbox')}>
            Move to inbox
          </Button>
        ) : (
          <>
            <Button size="sm" variant="ghost" leftIcon={<MailOpen className="size-4" aria-hidden />} onClick={() => setStatus('new', 'Marked as unread')}>
              Mark unread
            </Button>
            <Button size="sm" variant="ghost" leftIcon={<Archive className="size-4" aria-hidden />} onClick={() => setStatus('archived', 'Archived')}>
              Archive
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-50 hover:text-red-800" leftIcon={<Trash2 className="size-4" aria-hidden />} onClick={() => setConfirmDelete(true)}>
          Delete
        </Button>
      </footer>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this message?"
        description="This can’t be undone."
        confirmLabel="Delete"
        tone="danger"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </article>
  );
}

export default function MessagesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stats, refreshStats } = useAdmin();
  const { values, page, set, key } = useAdminParams({ status: 'inbox', q: '' });
  const filter = values.status as Filter;
  const list = useApi(`msgs:${key}`, () => adminApi.messages.list({ status: filter, q: values.q, page, pageSize: 20 }));
  const selected = useApi(`msg:${id ?? ''}`, () => (id ? adminApi.messages.get(id) : Promise.resolve(null)));
  const search = key ? `?${key}` : '';

  // Opening a new message marks it as read.
  const selectedMessage = selected.data;
  useEffect(() => {
    if (selectedMessage?.status === 'new') {
      adminApi.messages
        .setStatus(selectedMessage.id, 'read')
        .then(() => {
          selected.setData((m) => (m ? { ...m, status: 'read' } : m));
          list.setData((l) => (l ? { ...l, items: l.items.map((x) => (x.id === selectedMessage.id ? { ...x, status: 'read' } : x)) } : l));
          refreshStats();
        })
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per opened message
  }, [selectedMessage?.id]);

  const onChanged = (m: ContactMessage) => {
    selected.setData(() => m);
    list.reload();
  };

  return (
    <>
      <AdminPageHeader title="Messages" description="Enquiries from the contact form, including listing claims and advertising requests." />

      <div className={cn('mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between', id && 'hidden lg:flex')}>
        <FilterTabs<Filter>
          label="Message status"
          value={filter}
          onChange={(v) => set({ status: v })}
          options={[
            { value: 'inbox', label: 'Inbox' },
            { value: 'new', label: 'Unread', count: stats?.messages.new },
            { value: 'archived', label: 'Archived', count: stats?.messages.archived },
            { value: 'all', label: 'All' },
          ]}
        />
        <SearchInput label="messages" value={values.q} onChange={(q) => set({ q })} placeholder="Name, email or message text…" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className={cn('min-w-0', id && 'hidden lg:block')}>
          {list.error ? (
            <ErrorState onRetry={list.reload} description={list.error.message} />
          ) : !list.data ? (
            <Skeleton className="h-96 rounded-card" />
          ) : list.data.items.length === 0 ? (
            <EmptyState icon={<Inbox className="size-6" aria-hidden />} title="No messages" description={values.q ? 'Try a different search.' : 'Messages sent from the contact page appear here.'} />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
              {list.data.items.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/admin/messages/${m.id}${search}`}
                    aria-current={m.id === id ? 'true' : undefined}
                    className={cn('flex gap-3 px-4 py-3.5 transition-colors', m.id === id ? 'bg-navy-50' : 'hover:bg-navy-50/50')}
                  >
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', m.status === 'new' ? 'bg-brand-600' : 'bg-transparent')} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn('truncate text-sm text-navy-950', m.status === 'new' ? 'font-bold' : 'font-medium')}>{m.name}</span>
                        <span className="shrink-0 text-xs text-navy-400">{timeAgo(m.createdAt)}</span>
                      </span>
                      <span className="block truncate text-xs font-semibold text-navy-600">{SUBJECT_LABELS[m.subject] ?? m.subject}</span>
                      <span className="mt-0.5 line-clamp-2 text-xs text-navy-500">{m.message}</span>
                      {m.status === 'new' && <span className="sr-only">Unread</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {list.data && list.data.pageCount > 1 && <Pagination className="mt-4" page={list.data.page} pageCount={list.data.pageCount} onChange={(p) => set({ page: p })} />}
        </div>

        <div className={cn('min-w-0', !id && 'hidden lg:block')}>
          {id && (
            <Link to={`/admin/messages${search}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-950 lg:hidden">
              <ArrowLeft className="size-4" aria-hidden />
              All messages
            </Link>
          )}
          {!id ? (
            <div className="grid h-full min-h-72 place-items-center rounded-card border border-dashed border-navy-200 text-sm text-navy-400">
              Select a message to read it.
            </div>
          ) : selected.error ? (
            <ErrorState title="Message not found" description={selected.error.message} />
          ) : !selectedMessage ? (
            <Skeleton className="h-96 rounded-card" />
          ) : (
            <MessageView
              key={selectedMessage.id}
              message={selectedMessage}
              onChanged={onChanged}
              onDeleted={() => {
                list.reload();
                navigate(`/admin/messages${search}`, { replace: true });
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
