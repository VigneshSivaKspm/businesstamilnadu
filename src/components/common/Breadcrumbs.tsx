import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  tone?: 'default' | 'inverse';
  className?: string;
}

/** Breadcrumb trail. The last item is the current page. Pair with `breadcrumbSchema` for JSON-LD. */
export function Breadcrumbs({ items, tone = 'default', className }: BreadcrumbsProps) {
  const inverse = tone === 'inverse';
  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.8125rem]">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className={cn('size-3.5 shrink-0', inverse ? 'text-white/40' : 'text-navy-300')} aria-hidden />
              )}
              {last ? (
                <span aria-current="page" className={cn('truncate font-medium', inverse ? 'text-white' : 'text-navy-900')}>
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className={cn(
                    'inline-flex items-center gap-1 truncate transition-colors',
                    inverse ? 'text-white/60 hover:text-white' : 'text-navy-500 hover:text-navy-950',
                  )}
                >
                  {index === 0 && <Home className="size-3.5" aria-hidden />}
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
