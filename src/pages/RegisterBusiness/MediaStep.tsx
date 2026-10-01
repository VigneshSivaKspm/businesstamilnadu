import { useEffect, useId, useMemo, useState } from 'react';
import { ImagePlus, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ImagePickerProps {
  label: string;
  hint: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  aspect?: string;
}

const MAX_SIZE_MB = 5;

function usePreviews(files: File[]) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
  return urls;
}

/** Image chooser with local previews. Files stay in the browser until uploads launch. */
function ImagePicker({ label, hint, multiple, files, onChange, aspect = 'aspect-square' }: ImagePickerProps) {
  const id = useId();
  const previews = usePreviews(files);
  const [error, setError] = useState('');

  const add = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const invalid = incoming.find((f) => !f.type.startsWith('image/') || f.size > MAX_SIZE_MB * 1024 * 1024);
    if (invalid) {
      setError(`“${invalid.name}” must be an image under ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError('');
    onChange(multiple ? [...files, ...incoming].slice(0, 8) : incoming.slice(0, 1));
  };

  return (
    <div>
      <p className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-navy-900">
        {label}
        <span className="text-xs font-normal text-navy-400">Optional</span>
      </p>
      <div className={cn('grid gap-3', multiple ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1')}>
        {previews.map((src, index) => (
          <div key={src} className={cn('relative overflow-hidden rounded-xl border border-line bg-navy-50', multiple ? 'aspect-square' : aspect)}>
            <img src={src} alt={`${label} preview ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(files.filter((_, i) => i !== index))}
              className="absolute top-2 right-2 grid size-8 place-items-center rounded-lg bg-navy-950/80 text-white hover:bg-navy-950"
              aria-label={`Remove ${files[index]?.name ?? 'image'}`}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        {(multiple || files.length === 0) && (
          <label
            htmlFor={id}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-navy-200 bg-paper px-4 py-6 text-center transition-colors hover:border-navy-400 hover:bg-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-500',
              multiple ? 'aspect-square' : aspect,
            )}
          >
            <ImagePlus className="size-6 text-navy-400" aria-hidden />
            <span className="mt-2 text-sm font-semibold text-navy-800">Choose image{multiple ? 's' : ''}</span>
            <span className="mt-0.5 text-xs text-navy-500">{hint}</span>
            <input id={id} type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={(e) => add(e.target.files)} />
          </label>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[0.8125rem] font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export interface MediaFiles {
  logo: File[];
  cover: File[];
  gallery: File[];
}

export function MediaStep({ media, onChange }: { media: MediaFiles; onChange: (media: MediaFiles) => void }) {
  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        Image uploads are being prepared. You can preview your images here; our team will request the final files during
        verification.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[12rem_1fr]">
        <ImagePicker label="Business logo" hint="Square, PNG or JPG" files={media.logo} onChange={(logo) => onChange({ ...media, logo })} />
        <ImagePicker
          label="Cover photo"
          hint="Wide image, 1600 × 900 recommended"
          files={media.cover}
          onChange={(cover) => onChange({ ...media, cover })}
          aspect="aspect-[16/9]"
        />
      </div>
      <ImagePicker
        label="Gallery"
        hint="Up to 8 images"
        multiple
        files={media.gallery}
        onChange={(gallery) => onChange({ ...media, gallery })}
      />
    </div>
  );
}
