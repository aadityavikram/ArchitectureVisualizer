import {
  Boxes,
  Save,
  FolderOpen,
  Undo2,
  Redo2,
  Play,
  Square,
  Link2,
  Move,
  RotateCw,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelRight,
  Download,
  LayoutTemplate,
  CheckCircle,
  Presentation,
  FileJson,
} from 'lucide-react';
import { useState } from 'react';
import { useArchitectureStore } from '@/store/architectureStore';
import { templates, templateCategories, getTemplatesByCategory } from '@/data/templates';
import { downloadFile, exportMarkdownDocs, exportMermaid, exportSvgDiagram } from '@/exporters';
import { exportProjectJson } from '@/persistence/storage';
import type { LayoutAlgorithm } from '@/types/architecture';
import { useResponsiveLayout } from '@/hooks/useMediaQuery';

export function TopBar() {
  const project = useArchitectureStore((s) => s.project);
  const ui = useArchitectureStore((s) => s.ui);
  const simulation = useArchitectureStore((s) => s.simulation);
  const setUI = useArchitectureStore((s) => s.setUI);
  const toggleTemplatePicker = useArchitectureStore((s) => s.toggleTemplatePicker);
  const saveProject = useArchitectureStore((s) => s.saveProject);
  const undo = useArchitectureStore((s) => s.undo);
  const redo = useArchitectureStore((s) => s.redo);
  const newProject = useArchitectureStore((s) => s.newProject);
  const loadDemo = useArchitectureStore((s) => s.loadDemo);
  const loadTemplateById = useArchitectureStore((s) => s.loadTemplateById);
  const importProjectJson = useArchitectureStore((s) => s.importProjectJson);
  const startSimulation = useArchitectureStore((s) => s.startSimulation);
  const stopSimulation = useArchitectureStore((s) => s.stopSimulation);
  const setConnectionMode = useArchitectureStore((s) => s.setConnectionMode);
  const setTransformMode = useArchitectureStore((s) => s.setTransformMode);
  const runAutoLayout = useArchitectureStore((s) => s.runAutoLayout);
  const runValidation = useArchitectureStore((s) => s.runValidation);
  const setPresentationMode = useArchitectureStore((s) => s.setPresentationMode);
  const listStored = useArchitectureStore((s) => s.listStoredProjects);
  const loadProject = useArchitectureStore((s) => s.loadProject);
  const [exportOpen, setExportOpen] = useState(false);
  const { isTablet } = useResponsiveLayout();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => importProjectJson(String(reader.result));
      reader.readAsText(file);
    };
    input.click();
  };

  const btn =
    'flex shrink-0 items-center gap-1 rounded px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40 min-h-[36px] lg:min-h-0 lg:py-1';
  const btnIcon = `${btn} px-2.5 lg:px-2`;

  return (
    <header className="shrink-0 border-b border-surface-border bg-surface-raised">
      <div className="flex h-11 items-center gap-1 overflow-x-auto overscroll-x-contain px-2 [-webkit-overflow-scrolling:touch] lg:overflow-visible">
      <div className="mr-1 flex shrink-0 items-center gap-2 border-r border-surface-border pr-2 lg:mr-2 lg:pr-3">
        <Boxes className="h-5 w-5 text-accent" aria-hidden />
        <span className="hidden text-sm font-semibold text-white sm:inline">Arch Viz</span>
      </div>

      <div className="hidden items-center gap-0.5 sm:flex">
        <button type="button" className={btn} onClick={() => newProject()} title="New project">
          New
        </button>
        <button type="button" className={btn} onClick={() => saveProject()} title="Save (Ctrl+S)">
          <Save className="h-3.5 w-3.5" /> <span className="hidden md:inline">Save</span>
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => {
            const stored = listStored();
            if (stored[0]) loadProject(stored[0].id);
          }}
        >
          <FolderOpen className="h-3.5 w-3.5" /> <span className="hidden md:inline">Load</span>
        </button>
        <button type="button" className={btn} onClick={handleImport}>
          <FileJson className="h-3.5 w-3.5" /> <span className="hidden lg:inline">Import</span>
        </button>
      </div>

      <button type="button" className={`${btnIcon} sm:hidden`} onClick={() => saveProject()} title="Save">
        <Save className="h-4 w-4" />
      </button>

      <div className="mx-1 hidden h-5 w-px shrink-0 bg-surface-border sm:block" />

      <button type="button" className={btnIcon} onClick={undo} title="Undo">
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={btnIcon} onClick={redo} title="Redo">
        <Redo2 className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 hidden h-5 w-px shrink-0 bg-surface-border md:block" />

      <button
        type="button"
        className={`${btnIcon} ${ui.transformMode === 'translate' ? 'bg-accent/20 text-accent-glow' : ''}`}
        onClick={() => setTransformMode('translate')}
      >
        <Move className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={`${btnIcon} ${ui.transformMode === 'rotate' ? 'bg-accent/20 text-accent-glow' : ''}`}
        onClick={() => setTransformMode('rotate')}
      >
        <RotateCw className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={`${btnIcon} ${ui.transformMode === 'scale' ? 'bg-accent/20 text-accent-glow' : ''}`}
        onClick={() => setTransformMode('scale')}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={`${btn} hidden lg:flex ${ui.connectionMode ? 'bg-accent/20 text-accent-glow' : ''}`}
        onClick={() => setConnectionMode(!ui.connectionMode)}
        title="Connection mode"
      >
        <Link2 className="h-3.5 w-3.5" /> Connect
      </button>

      <div className="mx-1 hidden h-5 w-px shrink-0 bg-surface-border lg:block" />

      <select
        className="hidden shrink-0 rounded border border-surface-border bg-surface-overlay px-1 py-1 text-xs text-white md:block"
        onChange={(e) => runAutoLayout(e.target.value as LayoutAlgorithm)}
        defaultValue=""
        aria-label="Auto layout"
      >
        <option value="" disabled>
          Auto Layout
        </option>
        <option value="hierarchical">Hierarchical</option>
        <option value="force-directed">Force Directed</option>
        <option value="grid">Grid</option>
        <option value="radial">Radial</option>
      </select>

      <select
        className="hidden max-w-[8rem] shrink-0 rounded border border-surface-border bg-surface-overlay px-1 py-1 text-xs text-white lg:block lg:max-w-none"
        onChange={(e) => {
          if (e.target.value) loadTemplateById(e.target.value);
          e.target.value = '';
        }}
        defaultValue=""
        aria-label="Templates"
      >
        <option value="" disabled>
          Templates ({templates.length})
        </option>
        {templateCategories.map((cat) => (
          <optgroup key={cat.id} label={cat.label}>
            {getTemplatesByCategory(cat.id).map((t) => (
              <option key={t.id} value={t.id} title={t.description}>
                {t.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <button
        type="button"
        className={`${btn} max-lg:flex lg:hidden ${ui.templatePickerOpen ? 'bg-accent/20 text-accent-glow' : ''}`}
        onClick={toggleTemplatePicker}
        title="Browse templates"
        aria-pressed={ui.templatePickerOpen}
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
        <span className="max-w-[4.5rem] truncate">Templates</span>
      </button>

      <div className="mx-1 hidden h-5 w-px shrink-0 bg-surface-border sm:block" />

      {!simulation.active ? (
        <button type="button" className={`${btn} hidden sm:flex`} onClick={startSimulation}>
          <Play className="h-3.5 w-3.5 text-green-400" /> <span className="hidden md:inline">Simulate</span>
        </button>
      ) : (
        <button type="button" className={`${btn} hidden sm:flex`} onClick={stopSimulation}>
          <Square className="h-3.5 w-3.5 text-red-400" /> <span className="hidden md:inline">Stop</span>
        </button>
      )}
      <button type="button" className={`${btnIcon} hidden md:flex`} onClick={runValidation} title="Validate">
        <CheckCircle className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={`${btnIcon} hidden lg:flex`} onClick={() => setPresentationMode(true)} title="Presentation">
        <Presentation className="h-3.5 w-3.5" />
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1 pl-2">
        <button type="button" className={`${btnIcon} hidden lg:flex`} onClick={() => setUI({ leftPanelOpen: !ui.leftPanelOpen })} aria-label="Toggle components">
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={`${btnIcon} hidden lg:flex`} onClick={() => setUI({ rightPanelOpen: !ui.rightPanelOpen })} aria-label="Toggle inspector">
          <PanelRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={`${btnIcon} hidden sm:flex ${ui.fullscreenViewport ? 'bg-accent/20 text-accent-glow' : ''}`}
          onClick={() => setUI({ fullscreenViewport: !ui.fullscreenViewport })}
          title={ui.fullscreenViewport ? 'Exit fullscreen viewport (Esc)' : 'Fullscreen viewport'}
          aria-pressed={ui.fullscreenViewport}
        >
          {ui.fullscreenViewport ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          <span className="hidden lg:inline">{ui.fullscreenViewport ? 'Exit full screen' : 'Full screen'}</span>
        </button>
        <div className="relative">
          <button type="button" className={btnIcon} onClick={() => setExportOpen((o) => !o)} aria-expanded={exportOpen}>
            <Download className="h-3.5 w-3.5" />
          </button>
          {exportOpen && (
            <>
              <button type="button" className="fixed inset-0 z-30 lg:hidden" aria-label="Close export menu" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 top-full z-40 mt-1 min-w-[160px] rounded border border-surface-border bg-surface-raised py-1 shadow-xl">
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs hover:bg-white/5 lg:py-1.5"
              onClick={() => {
                downloadFile(exportProjectJson(project), `${project.metadata.name}.json`, 'application/json');
                setExportOpen(false);
              }}
            >
              JSON
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs hover:bg-white/5 lg:py-1.5"
              onClick={() => {
                downloadFile(exportMermaid(project), `${project.metadata.name}.mmd`, 'text/plain');
                setExportOpen(false);
              }}
            >
              Mermaid
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs hover:bg-white/5 lg:py-1.5"
              onClick={() => {
                downloadFile(exportMarkdownDocs(project), `${project.metadata.name}.md`, 'text/markdown');
                setExportOpen(false);
              }}
            >
              Markdown
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs hover:bg-white/5 lg:py-1.5"
              onClick={() => {
                downloadFile(exportSvgDiagram(project), `${project.metadata.name}.svg`, 'image/svg+xml');
                setExportOpen(false);
              }}
            >
              SVG
            </button>
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-xs hover:bg-white/5 lg:py-1.5"
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (!canvas) return;
                canvas.toBlob((blob) => {
                  if (!blob) return;
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${project.metadata.name}.png`;
                  a.click();
                  URL.revokeObjectURL(url);
                });
                setExportOpen(false);
              }}
            >
              PNG Screenshot
            </button>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          className={btnIcon}
          onClick={() => (isTablet ? toggleTemplatePicker() : loadDemo())}
          title={isTablet ? 'Browse templates' : 'Load demo'}
          aria-pressed={isTablet ? ui.templatePickerOpen : undefined}
        >
          <LayoutTemplate className="h-3.5 w-3.5" />
        </button>
      </div>
      </div>
    </header>
  );
}
