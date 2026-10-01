import { FileCheck2, Rocket, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { cn } from '@/lib/cn';

const steps = [
  {
    Icon: Send,
    title: 'Submit Your Business',
    body: 'Provide your business information using our streamlined registration process.',
  },
  {
    Icon: FileCheck2,
    title: 'Verification',
    body: 'Our team reviews the submitted information to improve listing quality and trust.',
  },
  {
    Icon: Rocket,
    title: 'Go Live',
    body: 'Once approved, your business profile becomes discoverable across the Business Tamil Nadu platform.',
  },
];

export function OnboardingSection({ className, showCta = true }: { className?: string; showCta?: boolean }) {
  return (
    <section className={cn('py-16 sm:py-24', className)} aria-labelledby="onboarding-title">
      <Container>
        <SectionHeading
          id="onboarding-title"
          eyebrow="How listing works"
          title="Simple Business Onboarding"
          description="Get discovered across Tamil Nadu in three simple steps."
          align="center"
        />
        <div className="relative mt-12">
          <div className="absolute top-12 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent md:block" aria-hidden />
          <ol className="relative grid gap-5 md:grid-cols-3 md:gap-6">
          {steps.map(({ Icon, title, body }, index) => (
            <li key={title} className="relative rounded-card border border-line bg-white p-6 text-center sm:p-7">
              <span className="relative mx-auto grid size-12 place-items-center rounded-xl bg-navy-950 text-gold-300 shadow-soft">
                <Icon className="size-5" aria-hidden />
                <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-gold-400 text-[0.6875rem] font-bold text-navy-950 ring-4 ring-white">
                  {index + 1}
                </span>
              </span>
              <h3 className="text-h3 mt-5">{title}</h3>
              <p className="text-body-sm mt-2 text-navy-500">{body}</p>
            </li>
          ))}
          </ol>
        </div>
        {showCta && (
          <div className="mt-10 flex justify-center">
            <Button to="/register-business" variant="primary" size="lg">
              List Your Business
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
