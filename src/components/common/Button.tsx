import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'accent' | 'brand' | 'secondary' | 'ghost' | 'inverse' | 'inverse-outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out select-none disabled:pointer-events-none disabled:opacity-50 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-navy-950 text-white shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_6px_16px_-6px_rgb(11_27_59/0.6)] hover:bg-navy-800',
  accent: 'bg-gold-400 text-navy-950 shadow-[0_6px_16px_-8px_rgb(201_141_34/0.8)] hover:bg-gold-300',
  brand: 'bg-brand-600 text-white shadow-[0_6px_16px_-8px_rgb(37_87_232/0.8)] hover:bg-brand-700',
  secondary: 'border border-line bg-white text-navy-950 hover:border-navy-200 hover:bg-navy-50',
  ghost: 'text-navy-800 hover:bg-navy-50 hover:text-navy-950',
  inverse: 'bg-white text-navy-950 hover:bg-navy-50',
  'inverse-outline': 'border border-white/20 text-white hover:border-white/40 hover:bg-white/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-[10px] px-3.5 text-sm',
  md: 'h-11 rounded-control px-5 text-sm',
  lg: 'h-13 rounded-control px-6 text-[0.9375rem]',
  icon: 'size-10 rounded-control',
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
}

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never; href?: never };
type AsLink = CommonProps & Omit<LinkProps, 'className' | 'children'> & { to: LinkProps['to']; href?: never };
type AsAnchor = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: never };

export type ButtonProps = AsButton | AsLink | AsAnchor;

function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: Pick<CommonProps, 'variant' | 'size' | 'fullWidth' | 'className'>) {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
}

/** One button component that renders a <button>, router <Link> or external <a>. */
export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(props, ref) {
  const { variant, size, leftIcon, rightIcon, loading, fullWidth, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, fullWidth, className });
  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {rightIcon}
    </>
  );

  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link ref={ref as Ref<HTMLAnchorElement>} className={classes} {...(rest as LinkProps)}>
        {content}
      </Link>
    );
  }
  if ('href' in rest && rest.href !== undefined) {
    const anchor = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    const external = /^https?:/.test(anchor.href ?? '');
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...anchor}
      >
        {content}
      </a>
    );
  }
  const button = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      {...button}
      ref={ref as Ref<HTMLButtonElement>}
      type={button.type ?? 'button'}
      className={classes}
      disabled={button.disabled || loading}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
});
