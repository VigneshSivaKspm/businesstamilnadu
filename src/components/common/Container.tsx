import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide';
}

const widths = {
  narrow: 'max-w-4xl',
  default: 'max-w-7xl',
  wide: 'max-w-[90rem]',
};

export function Container({ size = 'default', className, ...props }: ContainerProps) {
  return <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widths[size], className)} {...props} />;
}
