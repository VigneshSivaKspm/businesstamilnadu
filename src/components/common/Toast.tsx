import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { CircleCheck, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info';
}

const ToastContext = createContext<(message: string, tone?: Toast['tone']) => void>(() => {});

/** Lightweight toast notifications announced to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback(
    (message: string, tone: Toast['tone'] = 'success') => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="animate-fade-up pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-navy-950 py-3 pr-2 pl-4 text-sm text-white shadow-panel"
          >
            {toast.tone === 'success' ? (
              <CircleCheck className="size-4.5 shrink-0 text-emerald-400" aria-hidden />
            ) : (
              <Info className="size-4.5 shrink-0 text-brand-300" aria-hidden />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className={cn('grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white')}
              aria-label="Dismiss notification"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export const useToast = () => useContext(ToastContext);
