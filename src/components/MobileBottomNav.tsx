import { Blocks, PanelRight, Play, Square, Search, LayoutTemplate } from 'lucide-react';
import { useArchitectureStore } from '@/store/architectureStore';
import { useResponsiveLayout } from '@/hooks/useMediaQuery';

export function MobileBottomNav() {
  const { isTablet } = useResponsiveLayout();
  const ui = useArchitectureStore((s) => s.ui);
  const simulation = useArchitectureStore((s) => s.simulation);
  const setUI = useArchitectureStore((s) => s.setUI);
  const toggleTemplatePicker = useArchitectureStore((s) => s.toggleTemplatePicker);
  const startSimulation = useArchitectureStore((s) => s.startSimulation);
  const stopSimulation = useArchitectureStore((s) => s.stopSimulation);
  const nodeCount = useArchitectureStore((s) => s.project.nodes.length);

  if (!isTablet || ui.presentationMode) return null;

  const itemClass =
    'flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] text-gray-400 active:bg-white/10';

  const toggleLeft = () => {
    const next = !ui.leftPanelOpen;
    setUI({ leftPanelOpen: next, rightPanelOpen: next ? false : ui.rightPanelOpen });
  };
  const toggleRight = () => {
    const next = !ui.rightPanelOpen;
    setUI({ rightPanelOpen: next, leftPanelOpen: next ? false : ui.leftPanelOpen });
  };

  return (
    <nav
      className="safe-bottom fixed bottom-0 left-0 right-0 z-30 border-t border-surface-border bg-surface-raised/95 px-2 pt-1 backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around gap-1">
        <button
          type="button"
          className={`${itemClass} ${ui.leftPanelOpen ? 'text-accent-glow' : ''}`}
          onClick={toggleLeft}
          aria-pressed={ui.leftPanelOpen}
        >
          <Blocks className="h-5 w-5" />
          Components
        </button>
        <button
          type="button"
          className={`${itemClass} ${ui.rightPanelOpen ? 'text-accent-glow' : ''}`}
          onClick={toggleRight}
          aria-pressed={ui.rightPanelOpen}
        >
          <PanelRight className="h-5 w-5" />
          Inspector
        </button>
        <button
          type="button"
          className={itemClass}
          onClick={() => (simulation.active ? stopSimulation() : startSimulation())}
        >
          {simulation.active ? <Square className="h-5 w-5 text-red-400" /> : <Play className="h-5 w-5 text-green-400" />}
          {simulation.active ? 'Stop' : 'Simulate'}
        </button>
        <button type="button" className={itemClass} onClick={() => setUI({ commandPaletteOpen: true })}>
          <Search className="h-5 w-5" />
          Search
        </button>
        <button
          type="button"
          className={`${itemClass} ${ui.templatePickerOpen ? 'text-accent-glow' : ''}`}
          onClick={toggleTemplatePicker}
          aria-pressed={ui.templatePickerOpen}
        >
          <LayoutTemplate className="h-5 w-5" />
          Templates
        </button>
      </div>
      <p className="pb-1 text-center font-mono text-[9px] text-gray-500">
        {nodeCount} nodes · {simulation.active ? 'sim on' : 'sim off'}
      </p>
    </nav>
  );
}
