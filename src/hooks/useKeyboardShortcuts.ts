import { useEffect } from 'react';
import { useArchitectureStore } from '@/store/architectureStore';

export function useKeyboardShortcuts() {
  const store = useArchitectureStore;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const mod = e.ctrlKey || e.metaKey;
      const s = store.getState();

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        s.setUI({ commandPaletteOpen: !s.ui.commandPaletteOpen });
        return;
      }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        s.saveProject();
        return;
      }
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        s.undo();
        return;
      }
      if (mod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        s.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        s.duplicateSelectedNodes();
        return;
      }
      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        s.selectAll();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        s.deleteSelection();
        return;
      }
      if (e.key === 'Escape') {
        if (s.ui.presentationMode) {
          s.setPresentationMode(false);
          return;
        }
        if (s.ui.fullscreenViewport) {
          s.setUI({ fullscreenViewport: false });
          return;
        }
        s.clearSelection();
        s.setUI({
          commandPaletteOpen: false,
          templatePickerOpen: false,
          connectionMode: false,
          connectionSourceId: null,
          contextMenu: null,
        });
        return;
      }
      if (e.key.toLowerCase() === 'f') {
        s.focusSelection();
        return;
      }
      if (e.key === '1') {
        window.dispatchEvent(new CustomEvent('architecture:camera-view', { detail: { view: 'top' } }));
      }
      if (e.key === '2') {
        window.dispatchEvent(new CustomEvent('architecture:camera-view', { detail: { view: 'front' } }));
      }
      if (e.key === '3') {
        window.dispatchEvent(new CustomEvent('architecture:camera-view', { detail: { view: 'side' } }));
      }
      if (e.key === '0') {
        window.dispatchEvent(new CustomEvent('architecture:camera-view', { detail: { view: 'iso' } }));
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);
}
