import { create } from 'zustand';
import type {
  ArchitectureProject,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureGroup,
  SelectionState,
  SimulationState,
  UIState,
  TransformMode,
  LayoutAlgorithm,
  ValidationIssue,
  PresentationSlide,
  NodeType,
  Position3D,
  ThemeId,
  ToastMessage,
} from '@/types/architecture';
import {
  cloneProject,
  createEmptyProject,
  createNode,
  createEdge,
  duplicateNode,
  generateId,
  snapPosition,
} from '@/utils/architectureHelpers';
import { runAutoLayout } from '@/utils/layout';
import { validateArchitecture } from '@/utils/validation';
import {
  saveProjectToStorage,
  loadProjectFromStorage,
  getActiveProjectId,
  setActiveProjectId,
  exportProjectJson,
  validateImportedProject,
  deleteProjectFromStorage,
  listProjects,
} from '@/persistence/storage';
import { buildDemoArchitecture, loadTemplate, createNewProjectId } from '@/data/templates';
import { applyThemeToDocument, getTheme } from '@/themes';

const MAX_HISTORY = 50;

const defaultSimulation: SimulationState = {
  active: false,
  speed: 1,
  requestRate: 100,
  packetRate: 20,
  errorRate: 0.02,
  latencyMultiplier: 1,
  trafficType: 'request',
  traceEdgeIds: [],
};

const defaultUI: UIState = {
  leftPanelOpen: true,
  rightPanelOpen: true,
  fullscreenViewport: false,
  commandPaletteOpen: false,
  templatePickerOpen: false,
  contextMenu: null,
  connectionMode: false,
  connectionSourceId: null,
  transformMode: 'translate',
  presentationMode: false,
  metricsMode: false,
  validationPanelOpen: false,
  minimapVisible: true,
  toasts: [],
};

const defaultSelection: SelectionState = {
  nodeIds: [],
  edgeIds: [],
  groupIds: [],
};

type ArchitectureStore = {
  projectId: string;
  project: ArchitectureProject;
  selection: SelectionState;
  simulation: SimulationState;
  ui: UIState;
  history: { past: HistorySnapshot[]; future: HistorySnapshot[] };
  validationIssues: ValidationIssue[];
  presentationSlides: PresentationSlide[];
  fps: number;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  newProject: (name?: string) => void;
  loadDemo: () => void;
  loadTemplateById: (id: string) => void;
  loadProject: (id: string) => void;
  saveProject: () => void;
  saveProjectAs: (name: string) => void;
  importProjectJson: (json: string) => boolean;
  exportJson: () => string;
  deleteStoredProject: (id: string) => void;
  listStoredProjects: () => ReturnType<typeof listProjects>;

  addNode: (type: NodeType, position: Position3D, overrides?: Partial<ArchitectureNode>) => string;
  removeNode: (id: string) => void;
  updateNode: (id: string, patch: Partial<ArchitectureNode>) => void;
  moveNode: (id: string, position: Position3D) => void;
  duplicateSelectedNodes: () => void;
  renameNode: (id: string, name: string) => void;

  addEdge: (sourceId: string, targetId: string, overrides?: Partial<ArchitectureEdge>) => string | null;
  removeEdge: (id: string) => void;
  updateEdge: (id: string, patch: Partial<ArchitectureEdge>) => void;

  addGroup: (group: ArchitectureGroup) => void;
  updateGroup: (id: string, patch: Partial<ArchitectureGroup>) => void;
  removeGroup: (id: string) => void;

  selectNode: (id: string, additive?: boolean) => void;
  selectEdge: (id: string, additive?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelection: () => void;

  setTransformMode: (mode: TransformMode) => void;
  setConnectionMode: (active: boolean) => void;
  handleConnectionClick: (nodeId: string) => void;

  startSimulation: () => void;
  stopSimulation: () => void;
  setSimulation: (patch: Partial<SimulationState>) => void;
  simulateNodeFailure: (nodeId: string) => void;
  resetSimulationHealth: () => void;
  traceRequest: (startNodeId: string) => void;

  runAutoLayout: (algorithm: LayoutAlgorithm) => void;
  runValidation: () => void;

  setTheme: (themeId: ThemeId) => void;
  updateSettings: (patch: Partial<ArchitectureProject['settings']>) => void;
  updateCamera: (camera: ArchitectureProject['camera']) => void;
  setUI: (patch: Partial<UIState>) => void;
  toggleTemplatePicker: () => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  focusSelection: () => void;
  setFps: (fps: number) => void;

  setPresentationMode: (active: boolean) => void;
  addPresentationSlide: (name: string) => void;
};

type HistorySnapshot = {
  project: ArchitectureProject;
  selection: SelectionState;
};

function initProject(): { projectId: string; project: ArchitectureProject } {
  const activeId = getActiveProjectId();
  if (activeId) {
    const loaded = loadProjectFromStorage(activeId);
    if (loaded) return { projectId: activeId, project: loaded };
  }
  const demo = buildDemoArchitecture();
  const id = createNewProjectId();
  saveProjectToStorage(id, demo);
  setActiveProjectId(id);
  return { projectId: id, project: demo };
}

const initial = initProject();
applyThemeToDocument(getTheme(initial.project.settings.themeId as ThemeId));

export const useArchitectureStore = create<ArchitectureStore>((set, get) => ({
  projectId: initial.projectId,
  project: initial.project,
  selection: { ...defaultSelection },
  simulation: { ...defaultSimulation },
  ui: { ...defaultUI },
  history: { past: [], future: [] },
  validationIssues: [],
  presentationSlides: [],
  fps: 60,

  pushHistory: () => {
    const { project, selection, history } = get();
    const snapshot: HistorySnapshot = { project: cloneProject(project), selection: { ...selection } };
    const past = [...history.past, snapshot].slice(-MAX_HISTORY);
    set({ history: { past, future: [] } });
  },

  undo: () => {
    const { history, project, selection } = get();
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    const current: HistorySnapshot = { project: cloneProject(project), selection: { ...selection } };
    set({
      project: cloneProject(previous.project),
      selection: { ...previous.selection },
      history: {
        past: history.past.slice(0, -1),
        future: [current, ...history.future],
      },
    });
  },

  redo: () => {
    const { history, project, selection } = get();
    if (history.future.length === 0) return;
    const next = history.future[0];
    const current: HistorySnapshot = { project: cloneProject(project), selection: { ...selection } };
    set({
      project: cloneProject(next.project),
      selection: { ...next.selection },
      history: {
        past: [...history.past, current],
        future: history.future.slice(1),
      },
    });
  },

  newProject: (name) => {
    get().pushHistory();
    const project = createEmptyProject(name);
    const id = createNewProjectId();
    set({ projectId: id, project, selection: { ...defaultSelection }, validationIssues: [] });
    saveProjectToStorage(id, project);
    get().addToast('New project created', 'success');
  },

  loadDemo: () => {
    get().pushHistory();
    const project = buildDemoArchitecture();
    set({ project, selection: { ...defaultSelection } });
    saveProjectToStorage(get().projectId, project);
    get().addToast('Demo architecture loaded', 'success');
  },

  loadTemplateById: (id) => {
    const project = loadTemplate(id);
    if (!project) return;
    get().pushHistory();
    set({ project, selection: { nodeIds: [], edgeIds: [], groupIds: [] } });
    saveProjectToStorage(get().projectId, project);
    get().addToast(`Template "${project.metadata.name}" loaded — run Auto Layout if needed`, 'success');
  },

  loadProject: (id) => {
    const project = loadProjectFromStorage(id);
    if (!project) return;
    set({ projectId: id, project, selection: { ...defaultSelection } });
    setActiveProjectId(id);
    applyThemeToDocument(getTheme(project.settings.themeId as ThemeId));
  },

  saveProject: () => {
    const { projectId, project } = get();
    saveProjectToStorage(projectId, project);
    get().addToast('Project saved', 'success');
  },

  saveProjectAs: (name) => {
    const project = cloneProject(get().project);
    project.metadata.name = name;
    const id = createNewProjectId();
    saveProjectToStorage(id, project);
    set({ projectId: id, project });
    get().addToast(`Saved as "${name}"`, 'success');
  },

  importProjectJson: (json) => {
    try {
      const data = validateImportedProject(JSON.parse(json));
      if (!data) {
        get().addToast('Invalid project file', 'error');
        return false;
      }
      get().pushHistory();
      const id = createNewProjectId();
      set({ projectId: id, project: data, selection: { ...defaultSelection } });
      saveProjectToStorage(id, data);
      get().addToast('Project imported', 'success');
      return true;
    } catch {
      get().addToast('Failed to parse JSON', 'error');
      return false;
    }
  },

  exportJson: () => exportProjectJson(get().project),

  deleteStoredProject: deleteProjectFromStorage,
  listStoredProjects: listProjects,

  addNode: (type, position, overrides) => {
    get().pushHistory();
    const { project } = get();
    const snapped = snapPosition(position, project.settings.gridSize, project.settings.snapToGrid);
    const node = createNode(type, snapped, overrides);
    set({ project: { ...project, nodes: [...project.nodes, node] } });
    return node.id;
  },

  removeNode: (id) => {
    get().pushHistory();
    const { project, selection } = get();
    set({
      project: {
        ...project,
        nodes: project.nodes.filter((n) => n.id !== id),
        edges: project.edges.filter((e) => e.sourceId !== id && e.targetId !== id),
        groups: project.groups.map((g) => ({
          ...g,
          nodeIds: g.nodeIds.filter((nid) => nid !== id),
        })),
      },
      selection: {
        nodeIds: selection.nodeIds.filter((nid) => nid !== id),
        edgeIds: selection.edgeIds,
        groupIds: selection.groupIds,
      },
    });
  },

  updateNode: (id, patch) => {
    get().pushHistory();
    const { project } = get();
    set({
      project: {
        ...project,
        nodes: project.nodes.map((n) => (n.id === id ? { ...n, ...patch, metadata: { ...n.metadata, ...patch.metadata } } : n)),
      },
    });
  },

  moveNode: (id, position) => {
    const { project } = get();
    const snapped = snapPosition(position, project.settings.gridSize, project.settings.snapToGrid);
    set({
      project: {
        ...project,
        nodes: project.nodes.map((n) => (n.id === id ? { ...n, position: snapped } : n)),
      },
    });
  },

  duplicateSelectedNodes: () => {
    const { selection, project } = get();
    if (selection.nodeIds.length === 0) return;
    get().pushHistory();
    const newNodes: ArchitectureNode[] = [];
    const idMap = new Map<string, string>();
    for (const id of selection.nodeIds) {
      const node = project.nodes.find((n) => n.id === id);
      if (!node) continue;
      const dup = duplicateNode(node);
      idMap.set(id, dup.id);
      newNodes.push(dup);
    }
    set({
      project: { ...project, nodes: [...project.nodes, ...newNodes] },
      selection: { ...selection, nodeIds: newNodes.map((n) => n.id) },
    });
  },

  renameNode: (id, name) => get().updateNode(id, { name }),

  addEdge: (sourceId, targetId, overrides) => {
    if (sourceId === targetId) return null;
    const { project } = get();
    const exists = project.edges.some(
      (e) => e.sourceId === sourceId && e.targetId === targetId && e.type === (overrides?.type ?? 'data-flow'),
    );
    if (exists) return null;
    get().pushHistory();
    const edge = createEdge(sourceId, targetId, overrides?.protocol ?? 'HTTP', overrides);
    set({ project: { ...project, edges: [...project.edges, edge] } });
    return edge.id;
  },

  removeEdge: (id) => {
    get().pushHistory();
    const { project, selection } = get();
    set({
      project: { ...project, edges: project.edges.filter((e) => e.id !== id) },
      selection: { ...selection, edgeIds: selection.edgeIds.filter((eid) => eid !== id) },
    });
  },

  updateEdge: (id, patch) => {
    get().pushHistory();
    const { project } = get();
    set({
      project: {
        ...project,
        edges: project.edges.map((e) =>
          e.id === id ? { ...e, ...patch, metadata: { ...e.metadata, ...patch.metadata } } : e,
        ),
      },
    });
  },

  addGroup: (group) => {
    get().pushHistory();
    const { project } = get();
    set({ project: { ...project, groups: [...project.groups, group] } });
  },

  updateGroup: (id, patch) => {
    get().pushHistory();
    const { project } = get();
    set({
      project: {
        ...project,
        groups: project.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      },
    });
  },

  removeGroup: (id) => {
    get().pushHistory();
    const { project } = get();
    set({
      project: {
        ...project,
        groups: project.groups.filter((g) => g.id !== id),
        nodes: project.nodes.map((n) => (n.groupId === id ? { ...n, groupId: undefined } : n)),
      },
    });
  },

  selectNode: (id, additive = false) => {
    const { selection, ui } = get();
    if (ui.connectionMode && ui.connectionSourceId) {
      get().addEdge(ui.connectionSourceId, id);
      set({ ui: { ...ui, connectionSourceId: null, connectionMode: false } });
      get().addToast('Connection created', 'success');
      return;
    }
    if (ui.connectionMode && !ui.connectionSourceId) {
      set({ ui: { ...ui, connectionSourceId: id } });
      return;
    }
    set({
      selection: additive
        ? {
            nodeIds: selection.nodeIds.includes(id)
              ? selection.nodeIds.filter((nid) => nid !== id)
              : [...selection.nodeIds, id],
            edgeIds: [],
            groupIds: [],
          }
        : { nodeIds: [id], edgeIds: [], groupIds: [] },
    });
  },

  selectEdge: (id, additive = false) => {
    const { selection } = get();
    set({
      selection: additive
        ? {
            edgeIds: selection.edgeIds.includes(id)
              ? selection.edgeIds.filter((eid) => eid !== id)
              : [...selection.edgeIds, id],
            nodeIds: [],
            groupIds: [],
          }
        : { nodeIds: [], edgeIds: [id], groupIds: [] },
    });
  },

  selectAll: () => {
    const { project } = get();
    set({
      selection: {
        nodeIds: project.nodes.map((n) => n.id),
        edgeIds: [],
        groupIds: [],
      },
    });
  },

  clearSelection: () => set({ selection: { ...defaultSelection } }),

  deleteSelection: () => {
    const { selection, project } = get();
    if (selection.nodeIds.length === 0 && selection.edgeIds.length === 0) return;
    get().pushHistory();
    const nodeSet = new Set(selection.nodeIds);
    const edgeSet = new Set(selection.edgeIds);
    set({
      project: {
        ...project,
        nodes: project.nodes.filter((n) => !nodeSet.has(n.id)),
        edges: project.edges.filter(
          (e) => !edgeSet.has(e.id) && !nodeSet.has(e.sourceId) && !nodeSet.has(e.targetId),
        ),
        groups: project.groups.map((g) => ({
          ...g,
          nodeIds: g.nodeIds.filter((id) => !nodeSet.has(id)),
        })),
      },
      selection: { ...defaultSelection },
    });
  },

  setTransformMode: (mode) => set({ ui: { ...get().ui, transformMode: mode } }),

  setConnectionMode: (active) =>
    set({ ui: { ...get().ui, connectionMode: active, connectionSourceId: active ? get().ui.connectionSourceId : null } }),

  handleConnectionClick: (nodeId) => get().selectNode(nodeId),

  startSimulation: () => set({ simulation: { ...get().simulation, active: true } }),
  stopSimulation: () => set({ simulation: { ...get().simulation, active: false, traceEdgeIds: [] } }),
  setSimulation: (patch) => set({ simulation: { ...get().simulation, ...patch } }),

  simulateNodeFailure: (nodeId) => {
    get().updateNode(nodeId, { status: 'failed' });
    const { project } = get();
    const relatedEdges = project.edges.filter((e) => e.sourceId === nodeId || e.targetId === nodeId);
    for (const e of relatedEdges) {
      get().updateEdge(e.id, { metadata: { ...e.metadata, status: 'failed' } });
    }
    get().addToast('Node failure simulated', 'warning');
  },

  resetSimulationHealth: () => {
    const { project } = get();
    get().pushHistory();
    set({
      project: {
        ...project,
        nodes: project.nodes.map((n) => ({ ...n, status: 'healthy' as const })),
        edges: project.edges.map((e) => ({
          ...e,
          metadata: { ...e.metadata, status: 'healthy' as const },
        })),
      },
    });
  },

  traceRequest: (startNodeId) => {
    const { project } = get();
    const path: string[] = [];
    let current = startNodeId;
    const visited = new Set<string>();
    while (current && !visited.has(current)) {
      visited.add(current);
      const edge = project.edges.find((e) => e.sourceId === current);
      if (!edge) break;
      path.push(edge.id);
      current = edge.targetId;
    }
    set({ simulation: { ...get().simulation, traceEdgeIds: path, active: true } });
  },

  runAutoLayout: (algorithm) => {
    get().pushHistory();
    const { project } = get();
    const positions = runAutoLayout(algorithm, project.nodes, project.edges);
    set({
      project: {
        ...project,
        nodes: project.nodes.map((n) => {
          const p = positions.get(n.id);
          return p ? { ...n, position: p } : n;
        }),
      },
    });
    get().addToast(`Auto layout (${algorithm}) applied`, 'success');
  },

  runValidation: () => {
    const issues = validateArchitecture(get().project);
    set({ validationIssues: issues, ui: { ...get().ui, validationPanelOpen: true } });
  },

  setTheme: (themeId) => {
    applyThemeToDocument(getTheme(themeId));
    get().updateSettings({ themeId });
  },

  updateSettings: (patch) => {
    const { project } = get();
    set({ project: { ...project, settings: { ...project.settings, ...patch } } });
  },

  updateCamera: (camera) => {
    const { project } = get();
    set({ project: { ...project, camera } });
  },

  setUI: (patch) => set({ ui: { ...get().ui, ...patch } }),

  toggleTemplatePicker: () => {
    const ui = get().ui;
    const next = !ui.templatePickerOpen;
    set({
      ui: {
        ...ui,
        templatePickerOpen: next,
        ...(next ? { leftPanelOpen: false, rightPanelOpen: false } : {}),
      },
    });
  },

  addToast: (message, type = 'info') => {
    const id = generateId();
    set({ ui: { ...get().ui, toasts: [...get().ui.toasts, { id, message, type }] } });
    setTimeout(() => get().dismissToast(id), 4000);
  },

  dismissToast: (id) =>
    set({ ui: { ...get().ui, toasts: get().ui.toasts.filter((t) => t.id !== id) } }),

  focusSelection: () => {
    window.dispatchEvent(new CustomEvent('architecture:focus-selection'));
  },

  setFps: (fps) => set({ fps }),

  setPresentationMode: (active) => set({ ui: { ...get().ui, presentationMode: active } }),

  addPresentationSlide: (name) => {
    const { project, presentationSlides } = get();
    const slide: PresentationSlide = {
      id: generateId(),
      name,
      camera: cloneProject(project).camera,
      highlightedNodeIds: [...get().selection.nodeIds],
    };
    set({ presentationSlides: [...presentationSlides, slide] });
  },
}));

export const useProject = () => useArchitectureStore((s) => s.project);
export const useNodes = () => useArchitectureStore((s) => s.project.nodes);
export const useEdges = () => useArchitectureStore((s) => s.project.edges);
export const useGroups = () => useArchitectureStore((s) => s.project.groups);
export const useSelection = () => useArchitectureStore((s) => s.selection);
export const useSimulation = () => useArchitectureStore((s) => s.simulation);
export const useUI = () => useArchitectureStore((s) => s.ui);
