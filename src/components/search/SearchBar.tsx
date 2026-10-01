import { useState, type FormEvent } from 'react';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';
import { urls } from '@/lib/urls';
import { districtService } from '@/services';
import { analyticsService } from '@/services/analyticsService';
import { SearchAutocomplete } from './SearchAutocomplete';

interface SearchBarProps {
  initialQuery?: string;
  initialDistrict?: string;
  /** `hero` is the large homepage module; `inline` suits page headers. */
  variant?: 'hero' | 'inline';
  className?: string;
  autoFocus?: boolean;
}

/** Keyword + district search module with autocomplete. */
export function SearchBar({ initialQuery = '', initialDistrict = '', variant = 'hero', className, autoFocus }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [district, setDistrict] = useState(initialDistrict);
  const districts = districtService.getAll();
  const hero = variant === 'hero';

  const submit = (value = query) => {
    analyticsService.trackSearch(value, district || undefined);
    navigate(urls.search(value, district));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn(
        'relative flex flex-col gap-2 rounded-2xl bg-white p-2 md:flex-row md:items-center md:gap-0',
        hero ? 'shadow-panel ring-1 ring-white/10' : 'border border-line shadow-soft',
        className,
      )}
    >
      <SearchAutocomplete
        value={query}
        onChange={setQuery}
        onSubmit={submit}
        district={district || undefined}
        size={hero ? 'lg' : 'md'}
        className="flex-1"
        autoFocus={autoFocus}
      />

      <div className="hidden h-8 w-px bg-line md:block" aria-hidden />

      <div className="relative border-t border-line md:w-56 md:border-t-0 lg:w-64">
        <label htmlFor={`district-${variant}`} className="sr-only">
          Select District
        </label>
        <MapPin
          className={cn('pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-navy-400', hero ? 'size-5' : 'size-4')}
          aria-hidden
        />
        <select
          id={`district-${variant}`}
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className={cn(
            'w-full cursor-pointer appearance-none truncate bg-transparent pr-10 text-navy-950 focus:outline-none',
            hero ? 'h-14 pl-12 text-base' : 'h-11 pl-10 text-sm',
            !district && 'text-navy-400',
          )}
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.slug} value={d.slug} className="text-navy-950">
              {d.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-navy-400" aria-hidden />
      </div>

      <Button
        type="submit"
        variant="primary"
        size={hero ? 'lg' : 'md'}
        className={cn('md:ml-2', hero && 'h-14 px-7')}
        leftIcon={<Search className="size-4.5" aria-hidden />}
      >
        Search Businesses
      </Button>
    </form>
  );
}
