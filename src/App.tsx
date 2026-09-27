import { TopBar } from '@/toolbar/TopBar';
import { ComponentLibrary } from '@/panels/ComponentLibrary';
import { Inspector } from '@/panels/Inspector';
import { StatusBar } from '@/panels/StatusBar';
import { ArchitectureViewport } from '@/scene/ArchitectureViewport';
import { CommandPalette } from '@/components/CommandPalette';
import { ToastContainer } from '@/components/ToastContainer';
import { Minimap } from '@/components/Minimap';
import { PresentationExitBar } from '@/components/PresentationExitBar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { TemplatePickerSheet } from '@/components/TemplatePickerSheet';
import { ResponsiveSidePanel } from '@/components/ResponsiveSidePanel';
import { useArchitectureStore } from '@/store/architectureStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useResponsiveLayout } from '@/hooks/useMediaQuery';
import type { NodeType } from '@/types/architecture';
import { markFirstRunDone, isFirstRun } from '@/persistence/storage';
import { useEffect, useRef } from 'react';

export default function App() {
  const ui = useArchitectureStore((s) => s.ui);
  const setUI = useArchitectureStore((s) => s.setUI);
  const addNode = useArchitectureStore((s) => s.addNode);
  const loadDemo = useArchitectureStore((s) => s.loadDemo);
  const runValidation = useArchitectureStore((s) => s.runValidation);
  const { isTablet } = useResponsiveLayout();
  const initializedMobile = useRef(false);

  useKeyboardShortcuts();

  useEffect(() => {
    if (isFirstRun()) {
      loadDemo();
      markFirstRunDone();
    }
    runValidation();
  }, [loadDemo, runValidation]);

  useEffect(() => {
    if (!isTablet || initializedMobile.current) return;
    initializedMobile.current = true;
    setUI({ leftPanelOpen: false, rightPanelOpen: false, minimapVisible: false });
  }, [isTablet, setUI]);

  useEffect(() => {
    if (!isTablet) return;
    document.body.style.overflow =
      ui.leftPanelOpen || ui.rightPanelOpen || ui.templatePickerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isTablet, ui.leftPanelOpen, ui.rightPanelOpen, ui.templatePickerOpen]);

  const handleDrop = (type: string, position: { x: number; y: number; z: number }) => {
    addNode(type as NodeType, position);
  };

  const showSidePanels = !ui.presentationMode && !ui.fullscreenViewport;
  const showMainChrome = !ui.presentationMode;
  const closeLeft = () => setUI({ leftPanelOpen: false });
  const closeRight = () => setUI({ rightPanelOpen: false });

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--ui-bg,#0a0e14)] text-[var(--ui-text,#e6edf3)]">
      {showMainChrome && <TopBar />}
      <div className="relative flex min-h-0 flex-1">
        {showSidePanels && (
          <ResponsiveSidePanel open={ui.leftPanelOpen} onClose={closeLeft} side="left">
            <ComponentLibrary onClose={closeLeft} />
          </ResponsiveSidePanel>
        )}
        <main className="relative min-h-0 min-w-0 flex-1 max-lg:pb-[4.5rem]">
          <ArchitectureViewport onDrop={handleDrop} />
          <PresentationExitBar />
          {showSidePanels && ui.minimapVisible && <Minimap />}
        </main>
        {showSidePanels && (
          <ResponsiveSidePanel open={ui.rightPanelOpen} onClose={closeRight} side="right">
            <Inspector onClose={closeRight} />
          </ResponsiveSidePanel>
        )}
      </div>
      {showMainChrome && !ui.fullscreenViewport && <StatusBar />}
      <MobileBottomNav />
      <TemplatePickerSheet />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
