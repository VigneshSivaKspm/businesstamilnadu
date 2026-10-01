import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export const controlClass =
  'w-full min-w-0 rounded-control border bg-white px-3.5 text-[0.9375rem] text-navy-950 shadow-[0_1px_2px_rgb(15_32_67/0.04)] transition-[border-color,box-shadow] placeholder:text-navy-400 hover:border-navy-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-400';

interface FieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  optionalLabel?: boolean;
}

/** Label + control + hint/error, wired with aria-describedby. */
export function FieldWrapper({ id, label, required, hint, error, children, className, optionalLabel }: FieldWrapperProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold text-navy-900">
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-red-600" aria-hidden>
              *
            </span>
          )}
        </span>
        {optionalLabel && !required && <span className="text-xs font-normal text-navy-400">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] font-medium text-red-600" role="alert">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.8125rem] text-navy-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: ReactNode) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

interface BaseFieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  wrapperClassName?: string;
  optionalLabel?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, BaseFieldProps & InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ label, hint, error, wrapperClassName, optionalLabel = true, id, className, required, ...props }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldWrapper id={fieldId} label={label} required={required} hint={hint} error={error} className={wrapperClassName} optionalLabel={optionalLabel}>
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(controlClass, 'h-11', error ? 'border-red-400' : 'border-line', className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);

export const TextAreaField = forwardRef<HTMLTextAreaElement, BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextAreaField({ label, hint, error, wrapperClassName, optionalLabel = true, id, className, required, ...props }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldWrapper id={fieldId} label={label} required={required} hint={hint} error={error} className={wrapperClassName} optionalLabel={optionalLabel}>
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(controlClass, 'min-h-28 resize-y py-3 leading-relaxed', error ? 'border-red-400' : 'border-line', className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);

interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, wrapperClassName, optionalLabel = true, id, className, required, options, placeholder, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper id={fieldId} label={label} required={required} hint={hint} error={error} className={wrapperClassName} optionalLabel={optionalLabel}>
      <SelectControl
        ref={ref}
        id={fieldId}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(error ? 'border-red-400' : 'border-line', className)}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectControl>
    </FieldWrapper>
  );
});

/** Styled native select — accessible and reliable on every mobile browser. */
export const SelectControl = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function SelectControl(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(controlClass, 'h-11 cursor-pointer appearance-none truncate border-line pr-10', className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-navy-400" aria-hidden />
    </div>
  );
});

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
  error?: string;
}

export function Checkbox({ label, description, error, id, className, ...props }: CheckboxProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="group flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
          <input
            id={fieldId}
            type="checkbox"
            className={cn(
              'peer size-5 cursor-pointer appearance-none rounded-md border bg-white transition-colors checked:border-navy-950 checked:bg-navy-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
              error ? 'border-red-400' : 'border-navy-300 group-hover:border-navy-500',
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            {...props}
          />
          <Check className="pointer-events-none absolute size-3.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-navy-900">{label}</span>
          {description && <span className="mt-0.5 block text-xs text-navy-500">{description}</span>}
        </span>
      </label>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 ml-8 text-[0.8125rem] font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
