import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { controlClass } from '@/components/forms/Field';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';

/** Search box that updates the URL after a short pause. */
export function SearchInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setText(value);
  }
  const debounced = useDebounce(text, 300);
  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- react only to the debounced text
  }, [debounced]);

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-sm">
      <label className="sr-only" htmlFor={`search-${label}`}>
        {label}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-navy-400" aria-hidden />
      <input
        id={`search-${label}`}
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className={cn(controlClass, 'h-10 border-line pl-10 text-sm')}
      />
    </div>
  );
}
