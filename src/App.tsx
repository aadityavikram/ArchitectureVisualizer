import { TopBar } from '@/toolbar/TopBar';
import { ComponentLibrary } from '@/panels/ComponentLibrary';
import { Inspector } from '@/panels/Inspector';
import { StatusBar } from '@/panels/StatusBar';
import { ArchitectureViewport } from '@/scene/ArchitectureViewport';
import { CommandPalette } from '@/components/CommandPalette';
import { ToastContainer } from '@/components/ToastContainer';
import { Minimap } from '@/components/Minimap';
import { PresentationExitBar } from '@/components/PresentationExitBar';
import { useArchitectureStore } from '@/store/architectureStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { NodeType } from '@/types/architecture';
import { markFirstRunDone, isFirstRun } from '@/persistence/storage';
import { useEffect } from 'react';

export default function App() {
  const ui = useArchitectureStore((s) => s.ui);
  const addNode = useArchitectureStore((s) => s.addNode);
  const loadDemo = useArchitectureStore((s) => s.loadDemo);
  const runValidation = useArchitectureStore((s) => s.runValidation);

  useKeyboardShortcuts();

  useEffect(() => {
    if (isFirstRun()) {
      loadDemo();
      markFirstRunDone();
    }
    runValidation();
  }, [loadDemo, runValidation]);

  const handleDrop = (type: string, position: { x: number; y: number; z: number }) => {
    addNode(type as NodeType, position);
  };

  const showSidePanels = !ui.presentationMode && !ui.fullscreenViewport;
  const showMainChrome = !ui.presentationMode;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--ui-bg,#0a0e14)] text-[var(--ui-text,#e6edf3)]">
      {showMainChrome && <TopBar />}
      <div className="relative flex min-h-0 flex-1">
        {showSidePanels && ui.leftPanelOpen && <ComponentLibrary />}
        <main className="relative min-w-0 flex-1">
          <ArchitectureViewport onDrop={handleDrop} />
          <PresentationExitBar />
          {showSidePanels && ui.minimapVisible && <Minimap />}
        </main>
        {showSidePanels && ui.rightPanelOpen && <Inspector />}
      </div>
      {showMainChrome && !ui.fullscreenViewport && <StatusBar />}
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
