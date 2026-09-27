import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  side: 'left' | 'right';
  children: ReactNode;
};

export function ResponsiveSidePanel({ open, onClose, side, children }: Props) {
  if (!open) return null;

  const positionClass =
    side === 'left'
      ? 'left-0 border-r border-surface-border'
      : 'right-0 border-l border-surface-border';

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 top-11 z-40 hidden bg-black/60 max-lg:block"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        className={`max-lg:fixed max-lg:bottom-0 max-lg:top-11 max-lg:z-50 flex h-full max-lg:h-[calc(100dvh-2.75rem)] w-[min(100%,20rem)] max-w-[min(100vw,20rem)] flex-col bg-surface max-lg:shadow-2xl lg:relative lg:z-auto lg:max-w-none lg:shadow-none ${positionClass} ${
          side === 'left' ? 'lg:w-72' : 'lg:w-80'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  );
}
