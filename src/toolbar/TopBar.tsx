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
import { useArchitectureStore } from '@/store/architectureStore';
import { templates, templateCategories, getTemplatesByCategory } from '@/data/templates';
import { downloadFile, exportMarkdownDocs, exportMermaid, exportSvgDiagram } from '@/exporters';
import { exportProjectJson } from '@/persistence/storage';
import type { LayoutAlgorithm } from '@/types/architecture';

export function TopBar() {
  const project = useArchitectureStore((s) => s.project);
  const ui = useArchitectureStore((s) => s.ui);
  const simulation = useArchitectureStore((s) => s.simulation);
  const setUI = useArchitectureStore((s) => s.setUI);
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
    'flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-40';

  return (
    <header className="flex h-11 shrink-0 items-center gap-1 border-b border-surface-border bg-surface-raised px-2">
      <div className="mr-2 flex items-center gap-2 border-r border-surface-border pr-3">
        <Boxes className="h-5 w-5 text-accent" aria-hidden />
        <span className="hidden text-sm font-semibold text-white sm:inline">Arch Viz</span>
      </div>

      <div className="flex items-center gap-0.5">
        <button type="button" className={btn} onClick={() => newProject()} title="New project">
          New
        </button>
        <button type="button" className={btn} onClick={() => saveProject()} title="Save (Ctrl+S)">
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => {
            const stored = listStored();
            if (stored[0]) loadProject(stored[0].id);
          }}
        >
          <FolderOpen className="h-3.5 w-3.5" /> Load
        </button>
        <button type="button" className={btn} onClick={handleImport}>
          <FileJson className="h-3.5 w-3.5" /> Import
        </button>
      </div>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      <button type="button" className={btn} onClick={undo} title="Undo">
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={btn} onClick={redo} title="Redo">
        <Redo2 className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      <button
        type="button"
        className={`${btn} ${ui.transformMode === 'translate' ? 'bg-accent/20 text-accent-glow' : ''}`}
        onClick={() => setTransformMode('translate')}
      >
        <Move className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={`${btn} ${ui.transformMode === 'rotate' ? 'bg-accent/20 text-accent-glow' : ''}`}
        onClick={() => setTransformMode('rotate')}
      >
        <RotateCw className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={`${btn} ${ui.transformMode === 'scale' ? 'bg-accent/20 text-accent-glow' : ''}`}
        onClick={() => setTransformMode('scale')}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className={`${btn} ${ui.connectionMode ? 'bg-accent/20 text-accent-glow' : ''}`}
        onClick={() => setConnectionMode(!ui.connectionMode)}
        title="Connection mode"
      >
        <Link2 className="h-3.5 w-3.5" /> Connect
      </button>

      <div className="mx-1 h-5 w-px bg-surface-border" />

      <select
        className="rounded border border-surface-border bg-surface-overlay px-1 py-1 text-xs text-white"
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
        className="rounded border border-surface-border bg-surface-overlay px-1 py-1 text-xs text-white"
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

      <div className="mx-1 h-5 w-px bg-surface-border" />

      {!simulation.active ? (
        <button type="button" className={btn} onClick={startSimulation}>
          <Play className="h-3.5 w-3.5 text-green-400" /> Simulate
        </button>
      ) : (
        <button type="button" className={btn} onClick={stopSimulation}>
          <Square className="h-3.5 w-3.5 text-red-400" /> Stop
        </button>
      )}
      <button type="button" className={btn} onClick={runValidation}>
        <CheckCircle className="h-3.5 w-3.5" /> Validate
      </button>
      <button type="button" className={btn} onClick={() => setPresentationMode(true)}>
        <Presentation className="h-3.5 w-3.5" />
      </button>

      <div className="ml-auto flex items-center gap-1">
        <button type="button" className={btn} onClick={() => setUI({ leftPanelOpen: !ui.leftPanelOpen })}>
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn} onClick={() => setUI({ rightPanelOpen: !ui.rightPanelOpen })}>
          <PanelRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={`${btn} ${ui.fullscreenViewport ? 'bg-accent/20 text-accent-glow' : ''}`}
          onClick={() => setUI({ fullscreenViewport: !ui.fullscreenViewport })}
          title={ui.fullscreenViewport ? 'Exit fullscreen viewport (Esc)' : 'Fullscreen viewport'}
          aria-pressed={ui.fullscreenViewport}
        >
          {ui.fullscreenViewport ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          <span className="hidden lg:inline">{ui.fullscreenViewport ? 'Exit full screen' : 'Full screen'}</span>
        </button>
        <div className="relative group">
          <button type="button" className={btn}>
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <div className="invisible absolute right-0 top-full z-40 min-w-[160px] rounded border border-surface-border bg-surface-raised py-1 opacity-0 shadow-xl group-hover:visible group-hover:opacity-100">
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-white/5"
              onClick={() => downloadFile(exportProjectJson(project), `${project.metadata.name}.json`, 'application/json')}
            >
              JSON
            </button>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-white/5"
              onClick={() => downloadFile(exportMermaid(project), `${project.metadata.name}.mmd`, 'text/plain')}
            >
              Mermaid
            </button>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-white/5"
              onClick={() => downloadFile(exportMarkdownDocs(project), `${project.metadata.name}.md`, 'text/markdown')}
            >
              Markdown
            </button>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-white/5"
              onClick={() => downloadFile(exportSvgDiagram(project), `${project.metadata.name}.svg`, 'image/svg+xml')}
            >
              SVG
            </button>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-white/5"
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
              }}
            >
              PNG Screenshot
            </button>
          </div>
        </div>
        <button type="button" className={btn} onClick={loadDemo} title="Load demo">
          <LayoutTemplate className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
