import { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { componentLibrary, categoryLabels, categoryOrder } from '@/data/componentLibrary';
import type { NodeType } from '@/types/architecture';
import { getNodeColor, getTheme } from '@/themes';
import { useArchitectureStore } from '@/store/architectureStore';

export function ComponentLibrary() {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const themeId = useArchitectureStore((s) => s.project.settings.themeId);
  const theme = getTheme(themeId as 'dark');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return componentLibrary.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.type.includes(q),
    );
  }, [search]);

  const onDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/arch-node-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-surface-border bg-surface" aria-label="Component library">
      <div className="border-b border-surface-border p-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ui-text-muted">Components</h2>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-ui-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components…"
            className="w-full rounded-md border border-surface-border bg-surface-overlay py-1.5 pl-8 pr-2 text-xs text-white outline-none focus:border-accent"
            aria-label="Search components"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {categoryOrder.map((cat) => {
          const items = filtered.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          const isCollapsed = collapsed[cat];
          return (
            <div key={cat} className="mb-2">
              <button
                type="button"
                className="flex w-full items-center gap-1 rounded px-1 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-ui-text-muted hover:bg-white/5"
                onClick={() => setCollapsed((p) => ({ ...p, [cat]: !p[cat] }))}
              >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {categoryLabels[cat]}
              </button>
              {!isCollapsed &&
                items.map((item) => (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type)}
                    className="group mb-1 flex cursor-grab items-start gap-2 rounded-lg border border-transparent px-2 py-2 hover:border-surface-border hover:bg-surface-overlay active:cursor-grabbing"
                    title={item.description}
                  >
                    <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ui-text-muted opacity-0 group-hover:opacity-100" />
                    <div
                      className="mt-0.5 h-3 w-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: getNodeColor(item.type, theme) }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white">{item.name}</div>
                      <div className="truncate text-[10px] text-ui-text-muted">{item.description}</div>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
