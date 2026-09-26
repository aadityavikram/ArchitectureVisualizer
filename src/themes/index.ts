import type { ThemeId, AppTheme } from '@/types/architecture';

export const themes: Record<ThemeId, AppTheme> = {
  dark: {
    id: 'dark',
    name: 'Dark',
    ui: {
      background: '#0a0e14',
      surface: '#0f1419',
      surfaceRaised: '#151b23',
      border: '#2a3544',
      text: '#e6edf3',
      textMuted: '#8b949e',
      accent: '#3b82f6',
      accentMuted: '#2563eb',
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
    },
    scene: {
      background: '#0a0e14',
      fog: '#0a0e14',
      gridPrimary: '#1e293b',
      gridSecondary: '#334155',
      ambientIntensity: 0.45,
      directionalIntensity: 1.1,
    },
    node: {
      selection: '#60a5fa',
      hover: '#93c5fd',
      healthy: '#22c55e',
      degraded: '#eab308',
      failed: '#ef4444',
      utilizationLow: '#22c55e',
      utilizationMedium: '#eab308',
      utilizationHigh: '#ef4444',
    },
    edge: {
      default: '#64748b',
      active: '#38bdf8',
      error: '#f87171',
      particle: '#7dd3fc',
    },
  },
  light: {
    id: 'light',
    name: 'Light',
    ui: {
      background: '#f8fafc',
      surface: '#ffffff',
      surfaceRaised: '#f1f5f9',
      border: '#cbd5e1',
      text: '#0f172a',
      textMuted: '#64748b',
      accent: '#2563eb',
      accentMuted: '#1d4ed8',
      success: '#16a34a',
      warning: '#ca8a04',
      error: '#dc2626',
    },
    scene: {
      background: '#e2e8f0',
      fog: '#e2e8f0',
      gridPrimary: '#cbd5e1',
      gridSecondary: '#94a3b8',
      ambientIntensity: 0.65,
      directionalIntensity: 1.2,
    },
    node: {
      selection: '#2563eb',
      hover: '#3b82f6',
      healthy: '#16a34a',
      degraded: '#ca8a04',
      failed: '#dc2626',
      utilizationLow: '#16a34a',
      utilizationMedium: '#ca8a04',
      utilizationHigh: '#dc2626',
    },
    edge: {
      default: '#475569',
      active: '#0284c7',
      error: '#dc2626',
      particle: '#0ea5e9',
    },
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber',
    ui: {
      background: '#050508',
      surface: '#0a0a12',
      surfaceRaised: '#12121f',
      border: '#2d2d4a',
      text: '#e0e7ff',
      textMuted: '#a5b4fc',
      accent: '#a855f7',
      accentMuted: '#9333ea',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#fb7185',
    },
    scene: {
      background: '#050508',
      fog: '#050508',
      gridPrimary: '#1e1b4b',
      gridSecondary: '#312e81',
      ambientIntensity: 0.35,
      directionalIntensity: 1.4,
    },
    node: {
      selection: '#c084fc',
      hover: '#e879f9',
      healthy: '#34d399',
      degraded: '#fbbf24',
      failed: '#fb7185',
      utilizationLow: '#34d399',
      utilizationMedium: '#fbbf24',
      utilizationHigh: '#fb7185',
    },
    edge: {
      default: '#6366f1',
      active: '#a855f7',
      error: '#fb7185',
      particle: '#e879f9',
    },
  },
  blueprint: {
    id: 'blueprint',
    name: 'Blueprint',
    ui: {
      background: '#0c1929',
      surface: '#0f2744',
      surfaceRaised: '#133052',
      border: '#1e4976',
      text: '#dbeafe',
      textMuted: '#93c5fd',
      accent: '#38bdf8',
      accentMuted: '#0ea5e9',
      success: '#4ade80',
      warning: '#fde047',
      error: '#f87171',
    },
    scene: {
      background: '#0c1929',
      fog: '#0c1929',
      gridPrimary: '#1e3a5f',
      gridSecondary: '#2563eb',
      ambientIntensity: 0.5,
      directionalIntensity: 0.9,
    },
    node: {
      selection: '#38bdf8',
      hover: '#7dd3fc',
      healthy: '#4ade80',
      degraded: '#fde047',
      failed: '#f87171',
      utilizationLow: '#4ade80',
      utilizationMedium: '#fde047',
      utilizationHigh: '#f87171',
    },
    edge: {
      default: '#60a5fa',
      active: '#38bdf8',
      error: '#f87171',
      particle: '#bae6fd',
    },
  },
};

export function getTheme(id: ThemeId): AppTheme {
  return themes[id] ?? themes.dark;
}

export function applyThemeToDocument(theme: AppTheme): void {
  const root = document.documentElement;
  root.style.setProperty('--ui-bg', theme.ui.background);
  root.style.setProperty('--ui-surface', theme.ui.surface);
  root.style.setProperty('--ui-surface-raised', theme.ui.surfaceRaised);
  root.style.setProperty('--ui-border', theme.ui.border);
  root.style.setProperty('--ui-text', theme.ui.text);
  root.style.setProperty('--ui-text-muted', theme.ui.textMuted);
  root.style.setProperty('--ui-accent', theme.ui.accent);
}

export const nodeTypeColors: Record<string, string> = {
  client: '#6366f1',
  'web-browser': '#818cf8',
  'mobile-app': '#a78bfa',
  'api-gateway': '#0ea5e9',
  'load-balancer': '#06b6d4',
  cdn: '#14b8a6',
  'web-server': '#22d3ee',
  'application-server': '#38bdf8',
  microservice: '#3b82f6',
  database: '#f59e0b',
  cache: '#ef4444',
  'message-queue': '#ec4899',
  kafka: '#d946ef',
  worker: '#8b5cf6',
  'object-storage': '#64748b',
  'search-engine': '#10b981',
  'auth-service': '#f97316',
  'external-api': '#78716c',
  dns: '#84cc16',
  monitoring: '#22c55e',
  logging: '#eab308',
  ingress: '#0284c7',
  internet: '#94a3b8',
  custom: '#6b7280',
};

export function getNodeColor(type: string, theme: AppTheme): string {
  return nodeTypeColors[type] ?? theme.ui.accent;
}

export function getUtilizationColor(cpu: number, theme: AppTheme): string {
  if (cpu < 40) return theme.node.utilizationLow;
  if (cpu < 75) return theme.node.utilizationMedium;
  return theme.node.utilizationHigh;
}
