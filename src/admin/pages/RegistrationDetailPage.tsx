import { useState } from 'react';
import { ArrowLeft, CircleCheck, ExternalLink, Mail, MessageCircle, Phone, RotateCcw, Trash2, XCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { ErrorState } from '@/components/common/States';
import { useToast } from '@/components/common/Toast';
import { Checkbox, TextAreaField } from '@/components/forms/Field';
import { ApiError } from '@/lib/api';
import { categoryService, districtService } from '@/services';
import { telHref, whatsappHref } from '@/utils/format';
import { adminApi } from '../api';
import { useAdmin } from '../AdminContext';
import { AdminPageHeader, ConfirmDialog, DetailList, Panel, StatusPill } from '../components/AdminUi';
import { formatDateTime, timeAgo, useApi } from '../hooks';

export default function RegistrationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { refreshStats } = useAdmin();
  const { data: reg, error, reload, setData } = useApi(`reg:${id}`, () => adminApi.registrations.get(id));
  const duplicates = useApi(`reg-dupes:${reg?.businessName ?? ''}`, () =>
    reg ? adminApi.businesses.list({ q: reg.businessName.split(/\s+/).slice(0, 2).join(' '), pageSize: 5 }) : Promise.resolve(null),
  );

  const [verified, setVerified] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [notes, setNotes] = useState<string | null>(null);
  const [dialog, setDialog] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [busy, setBusy] = useState(false);

  if (error) return <ErrorState title={error.status === 404 ? 'Registration not found' : undefined} description={error.message} onRetry={error.status === 404 ? undefined : reload} />;
  if (!reg) return <Skeleton className="h-[32rem] rounded-card" />;

  const category = categoryService.getCategory(reg.categoryId);
  const subcategory = categoryService.getSubcategory(reg.subcategoryId);
  const district = districtService.getDistrict(reg.district);

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      notify(success);
      refreshStats();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Something went wrong.', 'info');
    } finally {
      setBusy(false);
      setDialog(null);
    }
  };

  const approve = () =>
    run(async () => {
      const { businessId } = await adminApi.registrations.approve(reg.id, { verified, featured });
      navigate(`/admin/listings/${businessId}?created=1`);
    }, `${reg.businessName} is now live`);

  const reject = () =>
    run(async () => {
      await adminApi.registrations.reject(reg.id, reason.trim());
      reload();
    }, 'Registration rejected');

  const remove = () =>
    run(async () => {
      await adminApi.registrations.remove(reg.id);
      navigate('/admin/registrations', { replace: true });
    }, 'Registration deleted');

  const saveNotes = () =>
    run(async () => {
      await adminApi.registrations.saveNotes(reg.id, notes ?? '');
      setData((d) => (d ? { ...d, notes: notes ?? '' } : d));
      setNotes(null);
    }, 'Notes saved');

  const possibleDuplicates = duplicates.data?.items ?? [];

  return (
    <>
      <AdminPageHeader
        back={
          <Link to="/admin/registrations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-950">
            <ArrowLeft className="size-4" aria-hidden />
            Registrations
          </Link>
        }
        title={reg.businessName}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusPill status={reg.status} label={reg.status === 'approved' ? 'Approved' : undefined} />
            <span className="font-mono">{reg.reference}</span>
            <span>Submitted {timeAgo(reg.submittedAt)}</span>
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          {possibleDuplicates.length > 0 && reg.status === 'pending' && (
            <div className="rounded-card border border-gold-200 bg-gold-50 p-4 text-sm text-gold-700">
              <p className="font-semibold">Possible existing listings with a similar name</p>
              <ul className="mt-2 space-y-1">
                {possibleDuplicates.map((b) => (
                  <li key={b.id}>
                    <Link to={`/admin/listings/${b.id}`} className="underline-offset-4 hover:underline">
                      {b.name}
                    </Link>{' '}
                    <span className="text-gold-600">· {districtService.getDistrict(b.district)?.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Panel title="Business">
            <DetailList
              items={[
                ['Business name', reg.businessName],
                ['Category', [category?.name, subcategory?.name].filter(Boolean).join(' › ')],
                ['Year established', reg.yearEstablished],
                ['Description', reg.shortDescription],
              ]}
            />
          </Panel>
          <Panel title="Location">
            <DetailList
              items={[
                ['District', district?.name],
                ['City / Town', reg.city],
                ['Locality', reg.locality],
                ['PIN code', reg.pinCode],
                ['Address', reg.address],
              ]}
            />
          </Panel>
          <Panel title="Contact">
            <DetailList
              items={[
                ['Contact person', reg.contactPerson],
                ['Phone', reg.phone && <a href={telHref(reg.phone)} className="font-semibold text-brand-700 hover:text-navy-950">{reg.phone}</a>],
                ['WhatsApp', reg.whatsapp],
                ['Email', reg.email && <a href={`mailto:${reg.email}`} className="text-brand-700 hover:text-navy-950">{reg.email}</a>],
                ['Website', reg.website && (
                  <a href={reg.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:text-navy-950">
                    {reg.website.replace(/^https?:\/\//, '')}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                )],
              ]}
            />
          </Panel>
          <Panel title="Details & media">
            <DetailList
              items={[
                ['Services', reg.services],
                ['Operating hours', reg.openingHours],
                ['Service areas', reg.serviceAreas],
                [
                  'Images chosen (not uploaded)',
                  [reg.logoFileName && `Logo: ${reg.logoFileName}`, reg.coverFileName && `Cover: ${reg.coverFileName}`, ...(reg.galleryFileNames ?? [])]
                    .filter(Boolean)
                    .join(', '),
                ],
              ]}
            />
          </Panel>
          <Panel title="Internal notes">
            <TextAreaField
              label="Notes"
              optionalLabel={false}
              hint="Visible to admins only."
              rows={3}
              value={notes ?? reg.notes ?? ''}
              onChange={(e) => setNotes(e.target.value)}
            />
            {notes !== null && notes !== (reg.notes ?? '') && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="primary" onClick={saveNotes} loading={busy}>
                  Save notes
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setNotes(null)}>
                  Discard
                </Button>
              </div>
            )}
          </Panel>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {reg.status === 'pending' && (
            <>
              <Panel title="Approve">
                <p className="text-sm text-navy-600">Creates a live listing from these details. You can edit it straight after.</p>
                <div className="mt-4 space-y-3">
                  <Checkbox label="Mark as verified" description="You have reviewed and confirmed these details." checked={verified} onChange={(e) => setVerified(e.target.checked)} />
                  <Checkbox label="Feature this listing" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                </div>
                <Button variant="primary" fullWidth className="mt-5 bg-emerald-700 hover:bg-emerald-800" leftIcon={<CircleCheck className="size-4" aria-hidden />} onClick={() => setDialog('approve')}>
                  Approve & publish
                </Button>
              </Panel>
              <Panel title="Reject">
                <TextAreaField
                  label="Reason"
                  optionalLabel={false}
                  rows={2}
                  placeholder="e.g. Could not verify the phone number"
                  value={reason}
                  error={reasonError}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setReasonError('');
                  }}
                />
                <Button
                  variant="secondary"
                  fullWidth
                  className="mt-3 text-red-700 hover:border-red-200 hover:bg-red-50"
                  leftIcon={<XCircle className="size-4" aria-hidden />}
                  onClick={() => (reason.trim().length < 3 ? setReasonError('Give a short reason (kept internal).') : setDialog('reject'))}
                >
                  Reject
                </Button>
              </Panel>
            </>
          )}

          {reg.status === 'approved' && (
            <Panel title="Approved">
              <p className="text-sm text-navy-600">
                By {reg.reviewedBy ?? 'an admin'} on {formatDateTime(reg.reviewedAt)}.
              </p>
              {reg.businessId && (
                <Button to={`/admin/listings/${reg.businessId}`} variant="primary" fullWidth className="mt-4">
                  Open listing
                </Button>
              )}
            </Panel>
          )}

          {reg.status === 'rejected' && (
            <Panel title="Rejected">
              <p className="text-sm text-navy-600">
                By {reg.reviewedBy ?? 'an admin'} on {formatDateTime(reg.reviewedAt)}.
              </p>
              {reg.rejectionReason && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{reg.rejectionReason}</p>}
              <Button
                variant="secondary"
                fullWidth
                className="mt-4"
                leftIcon={<RotateCcw className="size-4" aria-hidden />}
                loading={busy}
                onClick={() => run(async () => { await adminApi.registrations.reopen(reg.id); reload(); }, 'Moved back to pending')}
              >
                Reopen for review
              </Button>
            </Panel>
          )}

          <Panel title="Contact the applicant">
            <div className="flex flex-wrap gap-2">
              <Button href={telHref(reg.phone)} size="sm" variant="secondary" leftIcon={<Phone className="size-4" aria-hidden />}>
                Call
              </Button>
              <Button href={whatsappHref(reg.whatsapp || reg.phone, `Hello ${reg.contactPerson}, this is Business Tamil Nadu regarding your listing ${reg.reference}.`)} size="sm" variant="secondary" leftIcon={<MessageCircle className="size-4 text-emerald-600" aria-hidden />}>
                WhatsApp
              </Button>
              {reg.email && (
                <Button href={`mailto:${reg.email}?subject=${encodeURIComponent(`Your Business Tamil Nadu listing (${reg.reference})`)}`} size="sm" variant="secondary" leftIcon={<Mail className="size-4" aria-hidden />}>
                  Email
                </Button>
              )}
            </div>
          </Panel>

          <button
            type="button"
            onClick={() => setDialog('delete')}
            className="inline-flex items-center gap-2 px-1 text-sm font-semibold text-red-700 hover:text-red-800"
          >
            <Trash2 className="size-4" aria-hidden />
            Delete registration
          </button>
        </aside>
      </div>

      <ConfirmDialog
        open={dialog === 'approve'}
        title={`Publish ${reg.businessName}?`}
        description={`The listing goes live immediately${verified ? ' with a Verified badge' : ''}${featured ? ' and Featured placement' : ''}.`}
        confirmLabel="Approve & publish"
        busy={busy}
        onConfirm={approve}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'reject'}
        title="Reject this registration?"
        description="It moves to the Rejected tab. You can reopen it later."
        confirmLabel="Reject"
        tone="danger"
        busy={busy}
        onConfirm={reject}
        onCancel={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'delete'}
        title="Delete this registration permanently?"
        description="This can’t be undone. Any listing already created from it is not affected."
        confirmLabel="Delete"
        tone="danger"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDialog(null)}
      />
    </>
  );
}
