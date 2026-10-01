import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, CircleCheck, Clock, Mail, MessageCircle, Pencil, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { Checkbox, SelectField, TextAreaField, TextField } from '@/components/forms/Field';
import { Stepper } from '@/components/forms/Stepper';
import { site, VERIFIED_EXPLANATION } from '@/config/site';
import { useDebounce } from '@/hooks/useDebounce';
import { breadcrumbSchema } from '@/lib/schema';
import { categoryService, districtService, registrationService } from '@/services';
import type { Registration, RegistrationInput } from '@/types';
import { whatsappHref } from '@/utils/format';
import { MediaStep, type MediaFiles } from './MediaStep';
import {
  DESCRIPTION_MAX,
  STEPS,
  emptyRegistration,
  summarize,
  validateStep,
  type FormErrors,
} from './registrationForm';

const crumbs = [
  { name: 'Home', path: '/' },
  { name: 'List Your Business', path: '/register-business' },
];

function ReviewSection({ title, onEdit, rows }: { title: string; onEdit: () => void; rows: Array<[string, string]> }) {
  return (
    <div className="rounded-xl border border-line">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-bold text-navy-950">{title}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-navy-950">
          <Pencil className="size-3.5" aria-hidden />
          Edit<span className="sr-only"> {title}</span>
        </button>
      </div>
      <dl className="grid gap-x-6 gap-y-3 px-4 py-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-navy-500">{label}</dt>
            <dd className={value ? 'mt-0.5 text-sm break-words text-navy-900' : 'mt-0.5 text-sm text-navy-400'}>{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SuccessPanel({ registration, onReset }: { registration: Registration; onReset: () => void }) {
  const category = categoryService.getCategory(registration.categoryId)?.name ?? '';
  const subcategory = categoryService.getSubcategory(registration.subcategoryId)?.name ?? '';
  const district = districtService.getDistrict(registration.district)?.name ?? '';
  const body = `Reference: ${registration.reference}\n\n${summarize({ ...registration, confirmAccuracy: true }, { category, subcategory, district })}`;
  const subject = `New business listing — ${registration.businessName} (${registration.reference})`;

  return (
    <div className="rounded-2xl border border-line bg-white p-6 text-center sm:p-10" role="status" aria-live="polite">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
        <CircleCheck className="size-7" aria-hidden />
      </span>
      <h2 className="text-h2 mt-6">Details saved</h2>
      <p className="text-body mx-auto mt-3 max-w-lg text-navy-600">
        Thank you. <strong>{registration.businessName}</strong> has been saved with reference{' '}
        <strong className="font-mono text-navy-950">{registration.reference}</strong>.
      </p>
      {!registrationService.isRemoteEnabled && (
        <div className="mx-auto mt-6 max-w-lg rounded-xl border border-gold-200 bg-gold-50 p-4 text-left text-sm text-gold-700">
          <p className="font-semibold">One more step to reach our team</p>
          <p className="mt-1">
            Online submission isn’t connected yet, so your details are stored in this browser only. Send them to us by email
            or WhatsApp and we’ll start verification.
          </p>
        </div>
      )}
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button
          href={`mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
          variant="primary"
          leftIcon={<Mail className="size-4" aria-hidden />}
        >
          Send by email
        </Button>
        <Button
          href={whatsappHref(site.contact.whatsapp, `${subject}\n\n${body}`)}
          variant="secondary"
          leftIcon={<MessageCircle className="size-4 text-emerald-600" aria-hidden />}
        >
          Send on WhatsApp
        </Button>
      </div>
      <div className="mt-8 flex justify-center gap-6 border-t border-line pt-6 text-sm">
        <button type="button" onClick={onReset} className="font-semibold text-brand-700 hover:text-navy-950">
          List another business
        </button>
        <Link to="/businesses" className="font-semibold text-navy-700 hover:text-navy-950">
          Explore businesses
        </Link>
      </div>
    </div>
  );
}

export default function RegisterBusinessPage() {
  const [draft] = useState(() => registrationService.loadDraft());
  const [values, setValues] = useState<RegistrationInput>(() => ({ ...emptyRegistration, ...draft, confirmAccuracy: false }));
  const [restored, setRestored] = useState(Boolean(draft?.businessName));
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [media, setMedia] = useState<MediaFiles>({ logo: [], cover: [], gallery: [] });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<Registration | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Autosave the draft (text fields only) while the user types.
  const debounced = useDebounce(values, 600);
  useEffect(() => {
    if (!result) registrationService.saveDraft({ ...debounced, confirmAccuracy: false });
  }, [debounced, result]);

  const set = <K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const category = categoryService.getCategory(values.categoryId);
  const district = districtService.getDistrict(values.district);
  const localities = values.district ? districtService.getLocalities(values.district) : [];

  const goTo = (next: number) => {
    setStep(next);
    setReached((r) => Math.max(r, next));
    setErrors({});
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const focusFirstError = (found: FormErrors) => {
    const first = Object.keys(found)[0];
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
  };

  const onNext = () => {
    const found = validateStep(step, values);
    setErrors(found);
    if (Object.keys(found).length) {
      focusFirstError(found);
      return;
    }
    goTo(step + 1);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      onNext();
      return;
    }
    // Re-validate every step before submitting.
    for (let i = 0; i < STEPS.length; i++) {
      const found = validateStep(i, values);
      if (Object.keys(found).length) {
        if (i !== step) goTo(i);
        setErrors(found);
        focusFirstError(found);
        return;
      }
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const registration = await registrationService.submit({
        ...values,
        logoFileName: media.logo[0]?.name ?? '',
        coverFileName: media.cover[0]?.name ?? '',
        galleryFileNames: media.gallery.map((f) => f.name),
      });
      setResult(registration);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitError('We couldn’t save your details. Please try again, or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    registrationService.clearDraft();
    setValues(emptyRegistration);
    setMedia({ logo: [], cover: [], gallery: [] });
    setStep(0);
    setReached(0);
    setResult(null);
    setRestored(false);
  };

  const field = <K extends keyof RegistrationInput>(key: K) => ({
    name: key,
    value: values[key] as string,
    error: errors[key],
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as RegistrationInput[K]),
  });

  return (
    <>
      <SEO
        title="List Your Business"
        description="List your business on Business Tamil Nadu and reach customers across all 38 districts. Free to submit, reviewed by our team."
        canonicalPath="/register-business"
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="For business owners"
        title="List Your Business on Business Tamil Nadu"
        description="Reach customers across Tamil Nadu and build your online business presence."
      />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-12">
          <div className="min-w-0">
            {result ? (
              <SuccessPanel registration={result} onReset={reset} />
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate className="scroll-mt-24 rounded-2xl border border-line bg-white shadow-soft">
                <div className="border-b border-line px-5 py-5 sm:px-8">
                  <Stepper steps={STEPS} current={step} reached={reached} onSelect={goTo} />
                </div>

                <div className="px-5 py-7 sm:px-8 sm:py-8">
                  {restored && step === 0 && (
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-navy-50 px-4 py-3 text-sm text-navy-700">
                      <span>We restored your unfinished draft from this device.</span>
                      <button type="button" onClick={reset} className="font-semibold text-brand-700 hover:text-navy-950">
                        Start over
                      </button>
                    </div>
                  )}

                  <h2 ref={headingRef} tabIndex={-1} className="text-h3 outline-none">
                    {STEPS[step].title}
                  </h2>
                  <p className="text-body-sm mt-1 text-navy-500">
                    Fields marked <span className="text-red-600">*</span> are required.
                  </p>

                  <div className="mt-7">
                    {step === 0 && (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <TextField label="Business Name" required wrapperClassName="sm:col-span-2" autoComplete="organization" {...field('businessName')} />
                        <SelectField
                          label="Business Category"
                          required
                          placeholder="Select a category"
                          options={categoryService.getSorted().map((c) => ({ value: c.slug, label: c.name }))}
                          {...field('categoryId')}
                          onChange={(e) => {
                            set('categoryId', e.target.value);
                            set('subcategoryId', '');
                          }}
                        />
                        <SelectField
                          label="Subcategory"
                          required
                          disabled={!category}
                          placeholder={category ? 'Select a subcategory' : 'Choose a category first'}
                          options={category?.subcategories.map((s) => ({ value: s.slug, label: s.name })) ?? []}
                          {...field('subcategoryId')}
                        />
                        <TextField label="Year Established" inputMode="numeric" maxLength={4} placeholder="e.g. 2015" {...field('yearEstablished')} />
                        <TextAreaField
                          label="Short Description"
                          required
                          wrapperClassName="sm:col-span-2"
                          maxLength={DESCRIPTION_MAX}
                          hint={`${values.shortDescription.trim().length}/${DESCRIPTION_MAX} characters — what you do and who you serve.`}
                          {...field('shortDescription')}
                        />
                      </div>
                    )}

                    {step === 1 && (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <SelectField
                          label="District"
                          required
                          placeholder="Select District"
                          options={districtService.getAll().map((d) => ({ value: d.slug, label: d.name }))}
                          {...field('district')}
                        />
                        <TextField
                          label="City / Town"
                          required
                          autoComplete="address-level2"
                          list="city-suggestions"
                          {...field('city')}
                        />
                        <datalist id="city-suggestions">
                          {districtService.getCities(values.district || undefined).map((c) => (
                            <option key={c.slug} value={c.name} />
                          ))}
                        </datalist>
                        <TextField label="Locality" list="locality-suggestions" hint={district ? `e.g. ${localities.slice(0, 2).join(', ')}` : undefined} {...field('locality')} />
                        <datalist id="locality-suggestions">
                          {localities.map((l) => (
                            <option key={l} value={l} />
                          ))}
                        </datalist>
                        <TextField label="PIN Code" required inputMode="numeric" maxLength={6} autoComplete="postal-code" {...field('pinCode')} />
                        <TextAreaField label="Full Address" required wrapperClassName="sm:col-span-2" autoComplete="street-address" rows={3} {...field('address')} />
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <TextField label="Contact Person" required autoComplete="name" wrapperClassName="sm:col-span-2" {...field('contactPerson')} />
                        <TextField label="Phone Number" required type="tel" autoComplete="tel" placeholder="+91 98xxx xxxxx" {...field('phone')} />
                        <TextField
                          label="WhatsApp Number"
                          type="tel"
                          placeholder="Leave blank if same as phone"
                          hint={values.phone && !values.whatsapp ? (
                            <button type="button" className="font-semibold text-brand-700" onClick={() => set('whatsapp', values.phone)}>
                              Use phone number
                            </button>
                          ) : undefined}
                          {...field('whatsapp')}
                        />
                        <TextField label="Email" type="email" autoComplete="email" {...field('email')} />
                        <TextField label="Website" type="url" inputMode="url" placeholder="www.example.com" {...field('website')} />
                      </div>
                    )}

                    {step === 3 && (
                      <div className="grid gap-5">
                        <TextAreaField label="Services" hint="Separate services with commas, e.g. Root canal, Implants, Aligners" rows={3} {...field('services')} />
                        <TextField label="Operating Hours" placeholder="e.g. Mon–Sat 9:30 AM – 7:00 PM, Sunday closed" {...field('openingHours')} />
                        <TextField label="Service Areas" placeholder="e.g. Coimbatore, Tiruppur, Erode" hint="Districts or towns you serve." {...field('serviceAreas')} />
                      </div>
                    )}

                    {step === 4 && <MediaStep media={media} onChange={setMedia} />}

                    {step === 5 && (
                      <div className="space-y-4">
                        <ReviewSection
                          title="Basic Information"
                          onEdit={() => goTo(0)}
                          rows={[
                            ['Business name', values.businessName],
                            ['Category', [category?.name, categoryService.getSubcategory(values.subcategoryId)?.name].filter(Boolean).join(' › ')],
                            ['Year established', values.yearEstablished],
                            ['Description', values.shortDescription],
                          ]}
                        />
                        <ReviewSection
                          title="Location"
                          onEdit={() => goTo(1)}
                          rows={[
                            ['District', district?.name ?? ''],
                            ['City / Town', values.city],
                            ['Locality', values.locality],
                            ['Address', [values.address, values.pinCode].filter(Boolean).join(' – ')],
                          ]}
                        />
                        <ReviewSection
                          title="Contact"
                          onEdit={() => goTo(2)}
                          rows={[
                            ['Contact person', values.contactPerson],
                            ['Phone', values.phone],
                            ['WhatsApp', values.whatsapp],
                            ['Email', values.email],
                            ['Website', values.website],
                          ]}
                        />
                        <ReviewSection
                          title="Business Details & Media"
                          onEdit={() => goTo(3)}
                          rows={[
                            ['Services', values.services],
                            ['Operating hours', values.openingHours],
                            ['Service areas', values.serviceAreas],
                            ['Images selected', `${media.logo.length + media.cover.length + media.gallery.length}`],
                          ]}
                        />
                        <Checkbox
                          className="pt-2"
                          name="confirmAccuracy"
                          label="I confirm that the information provided is accurate."
                          description="Our team may contact you to verify these details before the listing goes live."
                          checked={values.confirmAccuracy}
                          error={errors.confirmAccuracy}
                          onChange={(e) => set('confirmAccuracy', e.target.checked)}
                        />
                        {submitError && (
                          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                            {submitError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-8">
                  {step > 0 ? (
                    <Button variant="ghost" onClick={() => goTo(step - 1)} leftIcon={<ArrowLeft className="size-4" aria-hidden />}>
                      Back
                    </Button>
                  ) : (
                    <span className="text-xs text-navy-400">Draft saves automatically on this device</span>
                  )}
                  {step < STEPS.length - 1 ? (
                    <Button type="submit" variant="primary" rightIcon={<ArrowRight className="size-4" aria-hidden />}>
                      Continue
                    </Button>
                  ) : (
                    <Button type="submit" variant="accent" loading={submitting} size="lg">
                      Submit Business
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-5" aria-label="About listing">
            <div className="rounded-2xl bg-navy-950 p-6 text-white">
              <h2 className="text-h4 text-white">What you get</h2>
              <ul className="mt-4 space-y-3.5 text-sm text-white/75">
                {[
                  { Icon: Users, text: 'A profile customers across Tamil Nadu can find by service, district and locality' },
                  { Icon: MessageCircle, text: 'Call, WhatsApp, website and directions buttons in one place' },
                  { Icon: BadgeCheck, text: 'A Verified badge once our team reviews your details' },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex gap-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-gold-300" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-h4">What happens next</h2>
              <ol className="mt-4 space-y-4 text-sm">
                {[
                  { Icon: Clock, title: 'Review', text: 'Our team checks the submitted details.' },
                  { Icon: ShieldCheck, title: 'Verification', text: 'We may call to confirm ownership.' },
                  { Icon: CircleCheck, title: 'Go live', text: 'Your profile becomes discoverable.' },
                ].map(({ Icon, title, text }) => (
                  <li key={title} className="flex gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-700">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold text-navy-900">{title}</span>
                      <span className="text-navy-500">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-navy-500">{VERIFIED_EXPLANATION}</p>
            </div>
            <p className="px-1 text-sm text-navy-500">
              Questions?{' '}
              <Link to="/contact" className="font-semibold text-brand-700 hover:text-navy-950">
                Contact our team
              </Link>
            </p>
          </aside>
        </div>
      </Container>
    </>
  );
}
