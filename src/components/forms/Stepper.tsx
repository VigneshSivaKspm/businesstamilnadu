import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StepperProps {
  steps: ReadonlyArray<{ id: string; title: string; short: string }>;
  current: number;
  /** Highest step the user has reached; earlier steps are clickable. */
  reached: number;
  onSelect: (index: number) => void;
}

export function Stepper({ steps, current, reached, onSelect }: StepperProps) {
  const progress = ((current + 1) / steps.length) * 100;
  return (
    <div>
      {/* Compact progress for small screens */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-navy-950">{steps[current].title}</span>
          <span className="text-navy-500">
            Step {current + 1} of {steps.length}
          </span>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy-100"
          role="progressbar"
          aria-valuenow={current + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label="Registration progress"
        >
          <div className="h-full rounded-full bg-navy-950 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ol className="hidden items-center md:flex">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const clickable = index <= reached && !active;
          return (
            <li key={step.id} className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}>
              <button
                type="button"
                onClick={() => clickable && onSelect(index)}
                disabled={!clickable}
                aria-current={active ? 'step' : undefined}
                className={cn('group flex items-center gap-2.5 rounded-lg py-1 pr-2 text-left', clickable && 'cursor-pointer')}
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors',
                    active && 'bg-navy-950 text-white ring-4 ring-navy-100',
                    done && 'bg-brand-600 text-white group-hover:bg-brand-700',
                    !active && !done && 'border border-line bg-white text-navy-400',
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : index + 1}
                </span>
                <span className={cn('text-sm font-semibold whitespace-nowrap', active ? 'text-navy-950' : done ? 'text-navy-700' : 'text-navy-400')}>
                  {step.short}
                  {done && <span className="sr-only"> (completed)</span>}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span className={cn('mx-2 h-px flex-1', index < current ? 'bg-brand-600' : 'bg-line')} aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
