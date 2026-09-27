import { useMemo, useState } from 'react';
import { LayoutTemplate, Search, X } from 'lucide-react';
import { useArchitectureStore } from '@/store/architectureStore';
import { templates, templateCategories, getTemplatesByCategory } from '@/data/templates';

export function TemplatePickerSheet() {
  const open = useArchitectureStore((s) => s.ui.templatePickerOpen);
  const setUI = useArchitectureStore((s) => s.setUI);
  const loadTemplateById = useArchitectureStore((s) => s.loadTemplateById);
  const loadDemo = useArchitectureStore((s) => s.loadDemo);
  const [query, setQuery] = useState('');

  const filteredByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templateCategories
      .map((cat) => ({
        ...cat,
        items: getTemplatesByCategory(cat.id).filter((t) => {
          if (!q) return true;
          return (
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.id.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query]);

  const close = () => {
    setQuery('');
    setUI({ templatePickerOpen: false });
  };

  const pick = (id: string) => {
    loadTemplateById(id);
    close();
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 top-11 z-[55] bg-black/60 lg:top-0"
        aria-label="Close templates"
        onClick={close}
      />
      <div
        className="safe-bottom fixed inset-x-0 bottom-0 top-11 z-[60] flex max-h-[calc(100dvh-2.75rem)] flex-col rounded-t-2xl border border-surface-border bg-surface shadow-2xl lg:top-auto lg:mx-auto lg:mb-auto lg:mt-[10vh] lg:max-h-[min(80dvh,720px)] lg:max-w-lg lg:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-picker-title"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-surface-border px-4 py-3">
          <LayoutTemplate className="h-5 w-5 text-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 id="template-picker-title" className="text-sm font-semibold text-white">
              Templates
            </h2>
            <p className="text-[11px] text-gray-500">{templates.length} interview-grade architectures</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
            onClick={close}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-surface-border px-3 py-2">
          <label className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-overlay px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates…"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
              autoFocus
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          <button
            type="button"
            className="mb-2 w-full rounded-lg border border-dashed border-surface-border px-3 py-3 text-left text-sm text-gray-300 hover:border-accent/40 hover:bg-white/5"
            onClick={() => {
              loadDemo();
              close();
            }}
          >
            <span className="font-medium text-white">E-commerce demo</span>
            <span className="mt-0.5 block text-xs text-gray-500">Default starter architecture with observability</span>
          </button>

          {filteredByCategory.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-gray-500">No templates match your search.</p>
          ) : (
            filteredByCategory.map((cat) => (
              <section key={cat.id} className="mb-3">
                <h3 className="sticky top-0 z-10 bg-surface px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {cat.label}
                </h3>
                <ul className="space-y-1">
                  {cat.items.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2.5 text-left active:bg-white/10 hover:bg-white/5"
                        onClick={() => pick(t.id)}
                      >
                        <span className="block text-sm font-medium text-white">{t.name}</span>
                        <span className="mt-0.5 line-clamp-2 text-xs text-gray-500">{t.description}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}
