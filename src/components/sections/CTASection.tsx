import { ArrowRight, Check, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { cn } from '@/lib/cn';

interface CTASectionProps {
  title?: string;
  description?: string;
  className?: string;
}

const points = ['Free to submit', 'Reviewed by our team', 'Calls, WhatsApp & directions in one profile'];

/** Conversion band for business owners. */
export function CTASection({
  title = 'Grow Your Business Across Tamil Nadu',
  description = 'Create your Business Tamil Nadu profile and help more customers discover your services.',
  className,
}: CTASectionProps) {
  return (
    <section className={cn('py-16 sm:py-20', className)} aria-labelledby="cta-title">
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl bg-navy-950 px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          <div className="bg-grid-dark absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,transparent,black)]" aria-hidden />
          <div className="absolute -top-32 -right-24 -z-10 size-96 rounded-full bg-brand-600/30 blur-[100px]" aria-hidden />
          <div className="absolute -bottom-40 left-1/3 -z-10 size-80 rounded-full bg-gold-500/15 blur-[100px]" aria-hidden />

          <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-label text-gold-300">For business owners</p>
              <h2 id="cta-title" className="text-h1 mt-3 text-white">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{description}</p>
              <ul className="mt-6 flex flex-col gap-2.5 text-sm text-white/80 sm:flex-row sm:flex-wrap sm:gap-x-6">
                {points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <Check className="size-4 text-gold-300" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch xl:flex-row xl:justify-end">
              <Button to="/register-business" variant="accent" size="lg" leftIcon={<Plus className="size-4" aria-hidden />}>
                List Your Business
              </Button>
              <Button to="/businesses" variant="inverse-outline" size="lg" rightIcon={<ArrowRight className="size-4" aria-hidden />}>
                Explore Businesses
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
