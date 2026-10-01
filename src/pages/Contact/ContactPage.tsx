import { useState, type FormEvent } from 'react';
import { ChevronDown, CircleCheck, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { SEO } from '@/components/common/SEO';
import { SelectField, TextAreaField, TextField } from '@/components/forms/Field';
import { site } from '@/config/site';
import { breadcrumbSchema } from '@/lib/schema';
import { ApiError } from '@/lib/api';
import { contactService } from '@/services';
import type { ContactMessageInput } from '@/types';
import { telHref, whatsappHref } from '@/utils/format';
import { isValidEmail, isValidIndianPhone } from '@/utils/validation';

const SUBJECTS = [
  { value: 'general', label: 'General enquiry' },
  { value: 'listing', label: 'Help with listing my business' },
  { value: 'claim', label: 'Claim a business listing' },
  { value: 'advertising', label: 'Advertising & featured listings' },
  { value: 'correction', label: 'Report incorrect information' },
  { value: 'support', label: 'Technical support' },
];

const FAQS = [
  {
    q: 'Is it free to list my business?',
    a: 'Yes. Submitting a basic listing is free. Optional featured placement and premium profiles will be offered separately in future and will always be clearly labelled.',
  },
  {
    q: 'What does the Verified badge mean?',
    a: 'Verification means the submitted business information has been reviewed by the Business Tamil Nadu team. It is not a government certification or an endorsement of service quality.',
  },
  {
    q: 'How long does verification take?',
    a: 'Our team reviews submissions in the order they are received and may call the listed number to confirm details before the listing goes live.',
  },
  {
    q: 'How do I update or claim an existing listing?',
    a: 'Choose “Claim a business listing” in the form above and include the business name and your role. We’ll contact you to confirm ownership.',
  },
];

type Errors = Partial<Record<keyof ContactMessageInput, string>>;

function validate(v: ContactMessageInput): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = 'Enter your name.';
  if (!isValidEmail(v.email)) e.email = 'Enter a valid email address.';
  if (v.phone && !isValidIndianPhone(v.phone)) e.phone = 'Enter a valid 10-digit phone number.';
  if (!v.subject) e.subject = 'Choose a subject.';
  if (v.message.trim().length < 20) e.message = 'Please write at least 20 characters so we can help.';
  return e;
}

export default function ContactPage() {
  const [params] = useSearchParams();
  const initialSubject = SUBJECTS.some((s) => s.value === params.get('subject')) ? params.get('subject')! : '';
  const businessSlug = params.get('business');
  const [values, setValues] = useState<ContactMessageInput>({
    name: '',
    email: '',
    phone: '',
    subject: initialSubject,
    message: businessSlug ? `Regarding the listing: ${window.location.origin}/business/${businessSlug}\n\n` : '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const set = (key: keyof ContactMessageInput, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus('sending');
    setServerError('');
    try {
      await contactService.send({ ...values, ...(businessSlug ? { businessSlug } : {}) }, honeypot);
      setStatus('sent');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields as Errors);
        setServerError(error.message);
      }
      setStatus('error');
    }
  };

  const subjectLabel = SUBJECTS.find((s) => s.value === values.subject)?.label ?? 'Enquiry';
  const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent(`${subjectLabel} — ${values.name}`)}&body=${encodeURIComponent(
    `${values.message}\n\n${values.name}\n${values.email}${values.phone ? `\n${values.phone}` : ''}`,
  )}`;

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ];

  const channels = [
    { Icon: Mail, label: 'Email', value: site.contact.email, href: `mailto:${site.contact.email}` },
    { Icon: Phone, label: 'Phone', value: site.contact.phone, href: telHref(site.contact.phone) },
    { Icon: MessageCircle, label: 'WhatsApp', value: 'Chat with our team', href: whatsappHref(site.contact.whatsapp) },
  ];

  return (
    <>
      <SEO
        title="Contact Us"
        description="Contact the Business Tamil Nadu team about listings, verification, advertising or support."
        canonicalPath="/contact"
        jsonLd={breadcrumbSchema(crumbs)}
      />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Contact"
        title="We’re here to help"
        description="Questions about listing your business, verification, advertising or using the directory? Send us a message."
      />

      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:gap-12">
          <div className="min-w-0 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-8">
            {status === 'sent' ? (
              <div className="py-6 text-center" role="status" aria-live="polite">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <CircleCheck className="size-7" aria-hidden />
                </span>
                <h2 className="text-h3 mt-5">{contactService.isRemoteEnabled ? 'Message sent' : 'Message saved'}</h2>
                <p className="text-body mx-auto mt-2 max-w-md text-navy-600">
                  {contactService.isRemoteEnabled
                    ? `Thank you — our team will reply to ${values.email} during support hours.`
                    : 'Online messaging isn’t connected yet, so your message is saved in this browser. Send it by email to make sure it reaches us.'}
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  {!contactService.isRemoteEnabled && (
                    <Button href={mailto} variant="primary" leftIcon={<Mail className="size-4" aria-hidden />}>
                      Send by email
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setValues({ name: '', email: '', phone: '', subject: '', message: '' });
                      setStatus('idle');
                    }}
                  >
                    Write another message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="relative">
                <h2 className="text-h3">Send a message</h2>
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Company website
                    <input type="text" name="company_url" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </label>
                </div>
                <p className="text-body-sm mt-1 text-navy-500">
                  Fields marked <span className="text-red-600">*</span> are required.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <TextField label="Name" name="name" required autoComplete="name" value={values.name} error={errors.name} onChange={(e) => set('name', e.target.value)} />
                  <TextField label="Email" name="email" type="email" required autoComplete="email" value={values.email} error={errors.email} onChange={(e) => set('email', e.target.value)} />
                  <TextField label="Phone" name="phone" type="tel" autoComplete="tel" value={values.phone} error={errors.phone} onChange={(e) => set('phone', e.target.value)} />
                  <SelectField
                    label="Subject"
                    name="subject"
                    required
                    placeholder="Choose a subject"
                    options={SUBJECTS}
                    value={values.subject}
                    error={errors.subject}
                    onChange={(e) => set('subject', e.target.value)}
                  />
                  <TextAreaField
                    label="Message"
                    name="message"
                    required
                    rows={6}
                    wrapperClassName="sm:col-span-2"
                    value={values.message}
                    error={errors.message}
                    onChange={(e) => set('message', e.target.value)}
                  />
                </div>
                {status === 'error' && (
                  <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                    {serverError || `Something went wrong. Please try again or email ${site.contact.email}.`}
                  </p>
                )}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-navy-500">
                    By sending, you agree to our{' '}
                    <Link to="/privacy-policy" className="font-semibold text-brand-700 hover:text-navy-950">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <Button type="submit" variant="primary" size="lg" loading={status === 'sending'}>
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-5" aria-label="Contact details">
            <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
              {channels.map(({ Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-navy-50/60"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-950 text-gold-300">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-navy-500">{label}</span>
                      <span className="block truncate text-sm font-semibold text-navy-950">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="space-y-4 rounded-2xl border border-line bg-white p-5">
              <div className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-navy-400" aria-hidden />
                <div>
                  <p className="text-xs text-navy-500">Support hours</p>
                  <p className="text-sm font-semibold text-navy-900">{site.contact.supportHours}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-navy-400" aria-hidden />
                <div>
                  <p className="text-xs text-navy-500">Office</p>
                  <p className="text-sm font-semibold text-navy-900">
                    {site.contact.officeName}, {site.contact.address}
                  </p>
                </div>
              </div>
            </div>
            <a href="#faq" className="block rounded-2xl bg-navy-50 p-5 text-sm transition-colors hover:bg-navy-100">
              <span className="font-semibold text-navy-950">Looking for a quick answer?</span>
              <span className="mt-0.5 block text-navy-600">Read the frequently asked questions →</span>
            </a>
          </aside>
        </div>

        <section id="faq" className="mt-16 scroll-mt-24" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-h2">
            Frequently asked questions
          </h2>
          <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
            {FAQS.map((item) => (
              <details key={item.q} className="group px-5 py-1 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-navy-950 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-navy-400 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="text-body-sm pb-5 text-navy-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
