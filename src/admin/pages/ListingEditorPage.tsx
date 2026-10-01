import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, Copy, ExternalLink, Info, Star, Trash2, X } from 'lucide-react';
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { ErrorState } from '@/components/common/States';
import { useToast } from '@/components/common/Toast';
import { Checkbox, FieldWrapper, SelectField, TextAreaField, TextField, controlClass } from '@/components/forms/Field';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import { slugify } from '@/lib/slug';
import { categoryService, districtService } from '@/services';
import type { Business, Weekday } from '@/types';
import { WEEKDAYS, WEEKDAY_LABELS } from '@/utils/hours';
import { adminApi } from '../api';
import { useAdmin } from '../AdminContext';
import { AdminPageHeader, ConfirmDialog, Panel, StatusPill } from '../components/AdminUi';
import { formatDateTime, useApi } from '../hooks';
import { emptyListing, fieldForErrorPath, toForm, toPayload, type ListingForm } from './listingForm';

const omit = (obj: Record<string, string>, key: string) => {
  const next = { ...obj };
  delete next[key];
  return next;
};

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Panel title={title}>
      {description && <p className="-mt-1 mb-5 text-sm text-navy-500">{description}</p>}
      {children}
    </Panel>
  );
}

function ImagePreview({ url, alt, className }: { url: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!/^https:\/\/.+/i.test(url) || failed === url) return null;
  return <img src={url} alt={alt} onError={() => setFailed(url)} className={cn('rounded-lg border border-line bg-navy-50 object-cover', className)} />;
}

export default function ListingEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { refreshStats } = useAdmin();
  const existing = useApi(`listing:${id ?? 'new'}`, () => (id ? adminApi.businesses.get(id) : Promise.resolve(null)));

  const [form, setForm] = useState<ListingForm>(emptyListing);
  const [baseline, setBaseline] = useState<string>(() => JSON.stringify(emptyListing()));
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [subSearch, setSubSearch] = useState('');

  // Load the listing into the form once it arrives.
  const business = existing.data;
  if (business && business.id !== loadedId) {
    const next = toForm(business);
    setLoadedId(business.id);
    setForm(next);
    setBaseline(JSON.stringify(next));
    setSlugTouched(true);
  }

  const dirty = JSON.stringify(form) !== baseline;
  /** Set right before programmatic navigation after a save/delete, so the guard doesn't fire. */
  const allowLeave = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && !allowLeave.current && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const set = <K extends keyof ListingForm>(key: K, value: ListingForm[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'name' && isNew && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    if (errors[key as string]) setErrors((e) => omit(e, key as string));
  };
  const setDay = (day: Weekday, patch: Partial<ListingForm['hours'][Weekday]>) => {
    setForm((f) => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], ...patch } } }));
    setErrors((e) => omit(e, `openingHours.${day}`));
  };

  const category = categoryService.getCategory(form.categoryId);
  const subOptions = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    const pool = q ? categoryService.getAllSubcategories() : (category?.subcategories ?? []);
    return pool.filter((s) => !q || s.name.toLowerCase().includes(q)).slice(0, 60);
  }, [category, subSearch]);
  const localities = form.district ? districtService.getLocalities(form.district) : [];

  const text = (key: keyof ListingForm) => ({
    name: key,
    value: form[key] as string,
    error: errors[key],
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const clientErrors: Record<string, string> = {};
    if (form.name.trim().length < 2) clientErrors.name = 'Enter the business name.';
    if (!form.categoryId) clientErrors.categoryId = 'Choose a category.';
    if (!form.district) clientErrors.district = 'Choose a district.';
    if (form.description.trim().length < 20) clientErrors.description = 'Write at least 20 characters.';
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setFormError('Please fix the highlighted fields.');
      document.querySelector<HTMLElement>(`[name="${Object.keys(clientErrors)[0]}"]`)?.focus();
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload = toPayload(form);
      const saved: Business = isNew ? await adminApi.businesses.create(payload) : await adminApi.businesses.update(id, payload);
      const next = toForm(saved);
      setForm(next);
      setBaseline(JSON.stringify(next));
      setLoadedId(saved.id);
      existing.setData(() => saved);
      refreshStats();
      notify(isNew ? 'Listing created' : 'Changes saved');
      if (isNew) {
        allowLeave.current = true;
        navigate(`/admin/listings/${saved.id}`, { replace: true });
        allowLeave.current = false;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const mapped: Record<string, string> = {};
        for (const [path, message] of Object.entries(err.fields)) mapped[fieldForErrorPath(path)] ??= message;
        setErrors(mapped);
        setFormError(err.message);
        const first = Object.keys(mapped)[0];
        if (first) document.querySelector<HTMLElement>(`[name="${first}"], [data-field="${first}"]`)?.focus();
      } else {
        setFormError('Saving failed. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await adminApi.businesses.remove(id);
      refreshStats();
      notify('Listing deleted');
      allowLeave.current = true;
      navigate('/admin/listings', { replace: true });
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Delete failed.', 'info');
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  if (existing.error) {
    return <ErrorState title={existing.error.status === 404 ? 'Listing not found' : undefined} description={existing.error.message} onRetry={existing.reload} />;
  }
  if (!isNew && !business) return <Skeleton className="h-[40rem] rounded-card" />;

  const publicUrl = `/business/${form.slug}`;

  return (
    <>
      <AdminPageHeader
        back={
          <Link to="/admin/listings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-950">
            <ArrowLeft className="size-4" aria-hidden />
            Listings
          </Link>
        }
        title={isNew ? 'New listing' : business?.name}
        description={
          !isNew && business ? (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusPill status={business.status ?? 'approved'} />
              {business.isDemo && <StatusPill status="read" label="Sample listing" />}
              <span>Updated {formatDateTime(business.updatedAt ?? business.createdAt)}</span>
            </span>
          ) : (
            'Add a business directly to the directory.'
          )
        }
      />

      {params.get('created') === '1' && (
        <p className="mb-6 flex items-start gap-2.5 rounded-card border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          This listing was created from a registration and is now live. Review the details, add opening hours and images, then save.
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Section title="Basics">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Business name" required optionalLabel={false} wrapperClassName="sm:col-span-2" {...text('name')} />
              <TextField
                label="URL slug"
                wrapperClassName="sm:col-span-2"
                optionalLabel={false}
                hint={
                  <span>
                    businesstamilnadu.in<strong className="text-navy-800">/business/{form.slug || '…'}</strong>
                    {isNew && !slugTouched && ' — generated from the name'}
                  </span>
                }
                {...text('slug')}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value).slice(0, 120));
                }}
              />
              <SelectField
                label="Primary category"
                required
                optionalLabel={false}
                placeholder="Choose a category"
                options={categoryService.getSorted().map((c) => ({ value: c.slug, label: c.name }))}
                {...text('categoryId')}
              />
              <TextField label="Year established" inputMode="numeric" maxLength={4} {...text('yearEstablished')} />

              <FieldWrapper id="subcategories" label="Subcategories" error={errors.subcategoryIds} className="sm:col-span-2" optionalLabel hint="Where this listing appears in category and search pages.">
                <div data-field="subcategoryIds" tabIndex={-1} className="rounded-control border border-line p-3">
                  {form.subcategoryIds.length > 0 && (
                    <ul className="mb-3 flex flex-wrap gap-1.5" aria-label="Selected subcategories">
                      {form.subcategoryIds.map((sid) => (
                        <li key={sid}>
                          <button
                            type="button"
                            onClick={() => set('subcategoryIds', form.subcategoryIds.filter((x) => x !== sid))}
                            className="inline-flex h-7 items-center gap-1 rounded-full bg-navy-950 pr-2 pl-3 text-xs font-semibold text-white hover:bg-navy-800"
                            aria-label={`Remove ${categoryService.getSubcategory(sid)?.name ?? sid}`}
                          >
                            {categoryService.getSubcategory(sid)?.name ?? sid}
                            <X className="size-3" aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <input
                    id="subcategories"
                    type="search"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    placeholder={category ? `Showing ${category.name} — type to search all` : 'Choose a category, or search all subcategories'}
                    className={cn(controlClass, 'h-9 border-line text-sm')}
                  />
                  <ul className="mt-3 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
                    {subOptions
                      .filter((s) => !form.subcategoryIds.includes(s.slug))
                      .map((s) => (
                        <li key={s.slug}>
                          <button
                            type="button"
                            onClick={() => form.subcategoryIds.length < 12 && set('subcategoryIds', [...form.subcategoryIds, s.slug])}
                            className="inline-flex h-7 items-center rounded-full border border-line px-3 text-xs font-medium text-navy-700 hover:border-navy-300 hover:bg-navy-50"
                          >
                            + {s.name}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              </FieldWrapper>

              <TextAreaField
                label="Short description"
                wrapperClassName="sm:col-span-2"
                rows={2}
                maxLength={300}
                hint={`${form.shortDescription.length}/300 — shown on listing cards.`}
                {...text('shortDescription')}
              />
              <TextAreaField label="Full description" required optionalLabel={false} wrapperClassName="sm:col-span-2" rows={5} {...text('description')} />
            </div>
          </Section>

          <Section title="Location">
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="District"
                required
                optionalLabel={false}
                placeholder="Choose a district"
                options={districtService.getAll().map((d) => ({ value: d.slug, label: d.name }))}
                {...text('district')}
              />
              <TextField label="City / Town" list="admin-cities" {...text('city')} />
              <datalist id="admin-cities">
                {districtService.getCities(form.district || undefined).map((c) => (
                  <option key={c.slug} value={c.name} />
                ))}
              </datalist>
              <TextField label="Locality" list="admin-localities" {...text('locality')} />
              <datalist id="admin-localities">
                {localities.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
              <TextField label="PIN code" inputMode="numeric" maxLength={6} {...text('pinCode')} />
              <TextAreaField label="Address" wrapperClassName="sm:col-span-2" rows={2} {...text('address')} />
              <TextField label="Latitude" inputMode="decimal" hint="Leave blank to use the district centre." {...text('latitude')} />
              <TextField label="Longitude" inputMode="decimal" {...text('longitude')} />
            </div>
          </Section>

          <Section title="Contact">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Contact person" hint="Not shown on the public site." {...text('contactPerson')} />
              <TextField label="Phone" type="tel" {...text('phone')} />
              <TextField
                label="WhatsApp"
                type="tel"
                hint={
                  form.phone && !form.whatsapp ? (
                    <button type="button" className="font-semibold text-brand-700" onClick={() => set('whatsapp', form.phone)}>
                      Use phone number
                    </button>
                  ) : undefined
                }
                {...text('whatsapp')}
              />
              <TextField label="Email" type="email" {...text('email')} />
              <TextField label="Website" type="url" wrapperClassName="sm:col-span-2" placeholder="www.example.com" {...text('website')} />
            </div>
          </Section>

          <Section title="Services & hours">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextAreaField label="Services" rows={5} hint="One per line." {...text('services')} />
              <TextAreaField label="Service areas" rows={5} hint="One per line, e.g. districts or towns." {...text('serviceAreas')} />
            </div>
            <div className="mt-6">
              <Checkbox label="Show opening hours" description="Powers the “Open now” filter and the hours table." checked={form.hoursEnabled} onChange={(e) => set('hoursEnabled', e.target.checked)} />
              {form.hoursEnabled && (
                <div className="mt-4 rounded-control border border-line">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                    <span className="text-xs font-semibold text-navy-500">IST, 24-hour</span>
                    <button
                      type="button"
                      onClick={() => {
                        const mon = form.hours.mon;
                        setForm((f) => ({ ...f, hours: { ...f.hours, tue: { ...mon }, wed: { ...mon }, thu: { ...mon }, fri: { ...mon } } }));
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-navy-950"
                    >
                      <Copy className="size-3.5" aria-hidden />
                      Copy Monday to Tue–Fri
                    </button>
                  </div>
                  <ul className="divide-y divide-line">
                    {WEEKDAYS.map((day) => {
                      const d = form.hours[day];
                      const err = errors[`openingHours.${day}`];
                      return (
                        <li key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
                          <span className="w-24 text-sm font-semibold text-navy-800">{WEEKDAY_LABELS[day]}</span>
                          <Checkbox label="Closed" checked={d.closed} onChange={(e) => setDay(day, { closed: e.target.checked })} />
                          {!d.closed && (
                            <span className="flex items-center gap-2">
                              <input
                                type="time"
                                aria-label={`${WEEKDAY_LABELS[day]} opens`}
                                value={d.open}
                                data-field={`openingHours.${day}`}
                                onChange={(e) => setDay(day, { open: e.target.value })}
                                className={cn(controlClass, 'h-9 w-32 text-sm', err ? 'border-red-400' : 'border-line')}
                              />
                              <span className="text-navy-400">–</span>
                              <input
                                type="time"
                                aria-label={`${WEEKDAY_LABELS[day]} closes`}
                                value={d.close}
                                onChange={(e) => setDay(day, { close: e.target.value })}
                                className={cn(controlClass, 'h-9 w-32 text-sm', err ? 'border-red-400' : 'border-line')}
                              />
                            </span>
                          )}
                          {err && (
                            <span className="w-full text-xs font-medium text-red-600" role="alert">
                              {err}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </Section>

          <Section title="Images" description="Paste https:// image URLs (e.g. from your CDN or image host). Direct uploads need a storage service and aren’t set up yet.">
            <div className="grid gap-5 sm:grid-cols-[1fr_6rem] sm:items-end">
              <TextField label="Logo URL" type="url" {...text('logo')} />
              <ImagePreview url={form.logo} alt="Logo preview" className="hidden size-24 sm:block" />
              <TextField label="Cover image URL" type="url" {...text('coverImage')} />
              <ImagePreview url={form.coverImage} alt="Cover preview" className="hidden h-24 w-24 sm:block" />
            </div>
            <TextAreaField label="Gallery photo URLs" wrapperClassName="mt-5" rows={4} hint="One URL per line, up to 12." {...text('photos')} />
            {form.photos.trim() && (
              <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {form.photos
                  .split('\n')
                  .map((u) => u.trim())
                  .filter(Boolean)
                  .slice(0, 12)
                  .map((u, i) => (
                    <li key={`${u}-${i}`}>
                      <ImagePreview url={u} alt={`Photo ${i + 1}`} className="aspect-square w-full" />
                    </li>
                  ))}
              </ul>
            )}
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Panel title="Publishing">
            <div className="space-y-4">
              <SelectField
                label="Status"
                optionalLabel={false}
                options={[
                  { value: 'approved', label: 'Live — visible on the website' },
                  { value: 'suspended', label: 'Suspended — hidden' },
                  { value: 'pending', label: 'Pending — hidden' },
                ]}
                value={form.status}
                onChange={(e) => set('status', e.target.value as ListingForm['status'])}
              />
              <Checkbox label="Verified" description="Details reviewed by our team." checked={form.verified} onChange={(e) => set('verified', e.target.checked)} />
              <Checkbox label="Featured" description="Highlighted placement, always labelled." checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              <SelectField
                label="Plan"
                optionalLabel={false}
                options={[
                  { value: 'free', label: 'Free' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'featured', label: 'Featured' },
                  { value: 'premium', label: 'Premium' },
                ]}
                value={form.plan}
                onChange={(e) => set('plan', e.target.value as ListingForm['plan'])}
              />
              <Checkbox label="Sample listing" description="Labelled as fictional demo data on the site." checked={form.isDemo} onChange={(e) => set('isDemo', e.target.checked)} />
            </div>
            {formError && (
              <p className="mt-5 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700" role="alert">
                {formError}
              </p>
            )}
            <Button type="submit" variant="primary" fullWidth className="mt-5" loading={saving} disabled={!dirty && !isNew}>
              {isNew ? 'Create listing' : dirty ? 'Save changes' : 'Saved'}
            </Button>
            {dirty && !isNew && (
              <button
                type="button"
                onClick={() => setForm(JSON.parse(baseline) as ListingForm)}
                className="mt-2 w-full text-center text-sm font-semibold text-navy-500 hover:text-navy-950"
              >
                Discard changes
              </button>
            )}
          </Panel>

          {!isNew && business && (
            <Panel title="Details">
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-navy-500">Created</dt>
                  <dd className="text-right text-navy-900">{formatDateTime(business.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-navy-500">Rating</dt>
                  <dd className="flex items-center gap-1 text-navy-900">
                    {business.rating ? (
                      <>
                        <Star className="size-3.5 fill-gold-400 text-gold-400" aria-hidden />
                        {business.rating.toFixed(1)} ({business.reviewCount ?? 0})
                      </>
                    ) : (
                      'No ratings'
                    )}
                  </dd>
                </div>
                {business.registrationId && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-navy-500">Source</dt>
                    <dd>
                      <Link to={`/admin/registrations/${business.registrationId}`} className="font-semibold text-brand-700 hover:text-navy-950">
                        Registration
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 text-xs text-navy-400">Ratings come from customer reviews and can’t be edited here.</p>
              {(business.status ?? 'approved') === 'approved' && (
                <Button href={publicUrl} variant="secondary" size="sm" fullWidth className="mt-4" rightIcon={<ExternalLink className="size-3.5" aria-hidden />}>
                  View on website
                </Button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-800"
              >
                <Trash2 className="size-4" aria-hidden />
                Delete listing
              </button>
            </Panel>
          )}
        </aside>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${business?.name ?? 'this listing'}?`}
        description="It’s removed from the website permanently. Use Suspended status to hide it temporarily instead."
        confirmLabel="Delete listing"
        tone="danger"
        busy={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        description="Your changes to this listing will be lost."
        confirmLabel="Discard changes"
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}
