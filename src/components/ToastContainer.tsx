import { useArchitectureStore } from '@/store/architectureStore';
import { X } from 'lucide-react';

export function ToastContainer() {
  const toasts = useArchitectureStore((s) => s.ui.toasts);
  const dismiss = useArchitectureStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-28 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col gap-2 max-lg:bottom-32 md:bottom-16" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm shadow-lg backdrop-blur-md ${
            t.type === 'success'
              ? 'border-green-500/40 bg-green-950/80 text-green-100'
              : t.type === 'error'
                ? 'border-red-500/40 bg-red-950/80 text-red-100'
                : t.type === 'warning'
                  ? 'border-yellow-500/40 bg-yellow-950/80 text-yellow-100'
                  : 'border-surface-border bg-surface-raised/95 text-white'
          }`}
        >
          <span>{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <X className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      ))}
    </div>
  );
}
