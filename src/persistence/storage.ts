import type { ArchitectureProject } from '@/types/architecture';

const STORAGE_KEY = 'architecture-visualizer-projects';
const ACTIVE_KEY = 'architecture-visualizer-active';
const FIRST_RUN_KEY = 'architecture-visualizer-first-run';

export type StoredProject = {
  id: string;
  project: ArchitectureProject;
};

export function listProjects(): StoredProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredProject[];
  } catch {
    return [];
  }
}

export function saveProjectToStorage(id: string, project: ArchitectureProject): void {
  const projects = listProjects();
  const idx = projects.findIndex((p) => p.id === id);
  const entry: StoredProject = { id, project: { ...project, metadata: { ...project.metadata, updatedAt: new Date().toISOString() } } };
  if (idx >= 0) projects[idx] = entry;
  else projects.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  localStorage.setItem(ACTIVE_KEY, id);
}

export function loadProjectFromStorage(id: string): ArchitectureProject | null {
  const projects = listProjects();
  const found = projects.find((p) => p.id === id);
  return found ? found.project : null;
}

export function deleteProjectFromStorage(id: string): void {
  const projects = listProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  const active = localStorage.getItem(ACTIVE_KEY);
  if (active === id) localStorage.removeItem(ACTIVE_KEY);
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function isFirstRun(): boolean {
  return localStorage.getItem(FIRST_RUN_KEY) !== 'done';
}

export function markFirstRunDone(): void {
  localStorage.setItem(FIRST_RUN_KEY, 'done');
}

export function validateImportedProject(data: unknown): ArchitectureProject | null {
  if (!data || typeof data !== 'object') return null;
  const p = data as ArchitectureProject;
  if (typeof p.version !== 'number' || !Array.isArray(p.nodes) || !Array.isArray(p.edges)) return null;
  if (!p.metadata || !p.camera || !p.settings) return null;
  return migrateProject(p);
}

function migrateProject(project: ArchitectureProject): ArchitectureProject {
  if (project.version < 1) {
    return { ...project, version: 1 };
  }
  return project;
}

export function exportProjectJson(project: ArchitectureProject): string {
  return JSON.stringify(project, null, 2);
}
