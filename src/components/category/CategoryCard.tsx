import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { cn } from '@/lib/cn';
import type { Category } from '@/types';
import { pluralize } from '@/utils/format';

interface CategoryCardProps {
  category: Category;
  businessCount?: number;
  variant?: 'default' | 'detailed';
  className?: string;
}

export function CategoryCard({ category, businessCount, variant = 'default', className }: CategoryCardProps) {
  const detailed = variant === 'detailed';
  return (
    <Link
      to={`/categories/${category.slug}`}
      className={cn(
        'group relative flex h-full flex-col rounded-card border border-line bg-white p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-lift',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-navy-50 text-navy-800 ring-1 ring-navy-100 transition-colors group-hover:bg-navy-950 group-hover:text-gold-300 group-hover:ring-navy-950">
          <CategoryIcon icon={category.icon} className="size-5" />
        </span>
        <ArrowRight
          className="size-4 -translate-x-1 text-navy-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-navy-700 group-hover:opacity-100"
          aria-hidden
        />
      </div>
      <h3 className="text-h4 mt-4 leading-snug">{category.name}</h3>
      {detailed && <p className="text-body-sm mt-1.5 line-clamp-2 text-navy-500">{category.description}</p>}
      <p className="mt-auto flex flex-wrap gap-x-3 pt-3 text-xs font-medium text-navy-500">
        <span>{pluralize(category.subcategories.length, 'subcategory', 'subcategories')}</span>
        {businessCount !== undefined && (
          <span className="text-brand-700">{pluralize(businessCount, 'listing')}</span>
        )}
      </p>
    </Link>
  );
}
