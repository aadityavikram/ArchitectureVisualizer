import { useMemo, useState, useEffect } from 'react';
import { Search, Box } from 'lucide-react';
import { useArchitectureStore } from '@/store/architectureStore';
import { templates } from '@/data/templates';
import type { CommandPaletteItem } from '@/types/architecture';

export function CommandPalette() {
  const open = useArchitectureStore((s) => s.ui.commandPaletteOpen);
  const setUI = useArchitectureStore((s) => s.setUI);
  const project = useArchitectureStore((s) => s.project);
  const [query, setQuery] = useState('');

  const actions: CommandPaletteItem[] = useMemo(() => {
    const items: CommandPaletteItem[] = [
      {
        id: 'sim-start',
        label: 'Start simulation',
        category: 'action',
        keywords: ['simulation', 'animate'],
        action: () => useArchitectureStore.getState().startSimulation(),
      },
      {
        id: 'sim-stop',
        label: 'Stop simulation',
        category: 'action',
        keywords: ['simulation'],
        action: () => useArchitectureStore.getState().stopSimulation(),
      },
      {
        id: 'layout-h',
        label: 'Auto layout (hierarchical)',
        category: 'action',
        keywords: ['layout', 'auto'],
        action: () => useArchitectureStore.getState().runAutoLayout('hierarchical'),
      },
      {
        id: 'validate',
        label: 'Validate architecture',
        category: 'action',
        keywords: ['validate', 'lint'],
        action: () => useArchitectureStore.getState().runValidation(),
      },
      {
        id: 'focus',
        label: 'Focus selection',
        category: 'action',
        keywords: ['focus', 'camera'],
        action: () => useArchitectureStore.getState().focusSelection(),
      },
      {
        id: 'presentation',
        label: 'Toggle presentation mode',
        category: 'action',
        keywords: ['presentation', 'slides'],
        action: () =>
          useArchitectureStore.getState().setPresentationMode(!useArchitectureStore.getState().ui.presentationMode),
      },
    ];

    for (const n of project.nodes) {
      items.push({
        id: `node-${n.id}`,
        label: `Focus: ${n.name}`,
        category: 'node',
        keywords: [n.name, n.type, 'focus'],
        action: () => {
          useArchitectureStore.getState().selectNode(n.id);
          useArchitectureStore.getState().focusSelection();
        },
      });
    }

    for (const t of templates) {
      items.push({
        id: `tpl-${t.id}`,
        label: `Load template: ${t.name}`,
        category: 'template',
        keywords: [t.name, 'template'],
        action: () => useArchitectureStore.getState().loadTemplateById(t.id),
      });
    }

    return items;
  }, [project.nodes]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return actions.slice(0, 12);
    return actions
      .filter((a) => a.label.toLowerCase().includes(q) || a.keywords.some((k) => k.includes(q)))
      .slice(0, 12);
  }, [actions, query]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-3 pt-[10vh] backdrop-blur-sm sm:p-4 sm:pt-[15vh]"
      onClick={() => setUI({ commandPaletteOpen: false })}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-surface-border bg-surface-raised shadow-2xl max-sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-surface-border px-3 py-2">
          <Search className="h-4 w-4 text-ui-text-muted" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes, templates, actions…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-ui-text-muted"
            aria-label="Command search"
          />
          <kbd className="rounded border border-surface-border px-1.5 text-[10px] text-ui-text-muted">Esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/5"
                onClick={() => {
                  item.action();
                  setUI({ commandPaletteOpen: false });
                }}
              >
                <Box className="h-3.5 w-3.5 text-accent" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] uppercase text-ui-text-muted">{item.category}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="px-3 py-4 text-sm text-ui-text-muted">No results</li>}
        </ul>
      </div>
    </div>
  );
}
