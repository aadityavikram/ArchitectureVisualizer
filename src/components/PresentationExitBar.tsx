import { X } from 'lucide-react';
import { useArchitectureStore } from '@/store/architectureStore';

/** Visible when presentation mode hides the main toolbar chrome. */
export function PresentationExitBar() {
  const presentation = useArchitectureStore((s) => s.ui.presentationMode);
  const projectName = useArchitectureStore((s) => s.project.metadata.name);
  const setPresentationMode = useArchitectureStore((s) => s.setPresentationMode);

  if (!presentation) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center p-3">
      <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-white/10 bg-black/70 px-4 py-2 shadow-lg backdrop-blur-md">
        <span className="text-sm text-white/90">{projectName} — Presentation</span>
        <button
          type="button"
          onClick={() => setPresentationMode(false)}
          className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
          aria-label="Exit presentation mode"
        >
          <X className="h-3.5 w-3.5" />
          Exit
        </button>
        <span className="hidden text-[10px] text-white/50 sm:inline">Esc</span>
      </div>
    </div>
  );
}
