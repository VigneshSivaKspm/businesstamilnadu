import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Building2, LayoutGrid, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@/hooks/useQuery';
import { cn } from '@/lib/cn';
import { highlightParts } from '@/lib/search';
import { searchService } from '@/services';
import type { Suggestion, SuggestionType } from '@/types';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  /** Called on Enter without a highlighted suggestion. */
  onSubmit: (value: string) => void;
  district?: string;
  placeholder?: string;
  label?: string;
  size?: 'md' | 'lg';
  className?: string;
  inputClassName?: string;
  icon?: ReactNode;
  autoFocus?: boolean;
}

const groupMeta: Record<SuggestionType, { title: string; Icon: typeof Search }> = {
  category: { title: 'Categories', Icon: LayoutGrid },
  business: { title: 'Businesses', Icon: Building2 },
  district: { title: 'Districts', Icon: MapPin },
};

/**
 * Accessible combobox with grouped suggestions (categories, businesses,
 * districts). Arrow keys move, Enter opens, Escape closes.
 */
export function SearchAutocomplete({
  value,
  onChange,
  onSubmit,
  district,
  placeholder = 'What are you looking for?',
  label = 'Search businesses, services or categories',
  size = 'lg',
  className,
  inputClassName,
  icon,
  autoFocus,
}: SearchAutocompleteProps) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = useDebounce(value.trim(), 120);
  const { data } = useQuery(`suggest:${term.toLowerCase()}:${district ?? ''}`, () => searchService.suggest(term, district));

  const groups = useMemo(() => {
    if (!data || term.length < 2) return [];
    return (['category', 'business', 'district'] as const)
      .map((type) => ({
        type,
        items: type === 'category' ? data.categories : type === 'business' ? data.businesses : data.districts,
      }))
      .filter((g) => g.items.length > 0);
  }, [data, term]);

  const flat: Suggestion[] = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const showList = open && value.trim().length >= 2;
  const activeIndex = active < flat.length ? active : -1;

  const choose = (suggestion: Suggestion) => {
    setOpen(false);
    setActive(-1);
    navigate(suggestion.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (flat.length ? (i + 1) % flat.length : -1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (flat.length ? (i <= 0 ? flat.length - 1 : i - 1) : -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (showList && activeIndex >= 0) choose(flat[activeIndex]);
      else {
        setOpen(false);
        onSubmit(value);
      }
    } else if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setActive(-1);
      }
    }
  };

  let optionIndex = -1;

  return (
    <div className={cn('relative min-w-0', className)}>
      <label htmlFor={`${id}-input`} className="sr-only">
        {label}
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-navy-400">
        {icon ?? <Search className={size === 'lg' ? 'size-5' : 'size-4'} aria-hidden />}
      </div>
      <input
        ref={inputRef}
        id={`${id}-input`}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-activedescendant={showList && activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
        autoComplete="off"
        enterKeyHint="search"
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        className={cn(
          'w-full min-w-0 appearance-none bg-transparent text-navy-950 placeholder:text-navy-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden',
          size === 'lg' ? 'h-14 pr-4 pl-12 text-base' : 'h-11 pr-3 pl-10 text-sm',
          inputClassName,
        )}
      />

      {showList && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="animate-fade-up absolute inset-x-0 top-full z-40 mt-2 max-h-[min(26rem,70vh)] overflow-y-auto rounded-xl border border-line bg-white p-2 text-left shadow-panel"
        >
          {groups.length === 0 ? (
            <div className="px-3 py-4 text-sm text-navy-500" role="presentation">
              Press Enter to search for “{value.trim()}”
            </div>
          ) : (
            groups.map(({ type, items }) => {
              const { title, Icon } = groupMeta[type];
              return (
                <div key={type} role="group" aria-labelledby={`${id}-${type}`} className="py-1">
                  <div id={`${id}-${type}`} className="text-label px-3 pt-1 pb-1.5 text-[0.6875rem] text-navy-400">
                    {title}
                  </div>
                  {items.map((item) => {
                    optionIndex += 1;
                    const index = optionIndex;
                    const isActive = index === activeIndex;
                    return (
                      <div
                        key={item.id}
                        id={`${id}-opt-${index}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => choose(item)}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5',
                          isActive ? 'bg-navy-50' : 'hover:bg-navy-50/60',
                        )}
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-navy-500 ring-1 ring-line">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-navy-950">
                            {highlightParts(item.label, term).map((part, i) =>
                              part.match ? (
                                <mark key={i} className="bg-transparent text-brand-700">
                                  {part.text}
                                </mark>
                              ) : (
                                <span key={i}>{part.text}</span>
                              ),
                            )}
                          </span>
                          {item.sublabel && <span className="block truncate text-xs text-navy-500">{item.sublabel}</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
          {groups.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false);
                onSubmit(value);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-line px-3 pt-3 pb-2 text-sm font-semibold text-brand-700 hover:text-navy-950"
              tabIndex={-1}
            >
              <Search className="size-4" aria-hidden />
              See all results for “{value.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
