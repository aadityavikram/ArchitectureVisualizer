import { useArchitectureStore, useProject, useSelection } from '@/store/architectureStore';
import { protocolOptions } from '@/utils/architectureHelpers';
import type { ThemeId } from '@/types/architecture';
import { themes } from '@/themes';
import { isArchitectureValid } from '@/utils/validation';
import { AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { ArchitectureResourcesPanel } from '@/panels/ArchitectureResourcesPanel';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-2 block">
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-ui-text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded border border-surface-border bg-surface-overlay px-2 py-1 text-xs text-white outline-none focus:border-accent';

export function Inspector() {
  const project = useProject();
  const selection = useSelection();
  const updateNode = useArchitectureStore((s) => s.updateNode);
  const updateEdge = useArchitectureStore((s) => s.updateEdge);
  const simulateNodeFailure = useArchitectureStore((s) => s.simulateNodeFailure);
  const traceRequest = useArchitectureStore((s) => s.traceRequest);
  const validationIssues = useArchitectureStore((s) => s.validationIssues);
  const setTheme = useArchitectureStore((s) => s.setTheme);
  const updateSettings = useArchitectureStore((s) => s.updateSettings);
  const selectNode = useArchitectureStore((s) => s.selectNode);

  const selectedNode = project.nodes.find((n) => n.id === selection.nodeIds[0]);
  const selectedEdge = project.edges.find((e) => e.id === selection.edgeIds[0]);
  const nodeById = new Map(project.nodes.map((n) => [n.id, n]));

  const valid = isArchitectureValid(validationIssues);

  return (
    <aside className="flex h-full w-80 flex-col border-l border-surface-border bg-surface" aria-label="Inspector">
      <div className="border-b border-surface-border p-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ui-text-muted">Inspector</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {!selectedNode && !selectedEdge && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-white">{project.metadata.name}</h3>
              <p className="mt-1 text-xs text-ui-text-muted">{project.metadata.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-surface-overlay p-2">
                <div className="text-ui-text-muted">Nodes</div>
                <div className="text-lg font-semibold text-white">{project.nodes.length}</div>
              </div>
              <div className="rounded bg-surface-overlay p-2">
                <div className="text-ui-text-muted">Connections</div>
                <div className="text-lg font-semibold text-white">{project.edges.length}</div>
              </div>
              <div className="rounded bg-surface-overlay p-2">
                <div className="text-ui-text-muted">Groups</div>
                <div className="text-lg font-semibold text-white">{project.groups.length}</div>
              </div>
            </div>
            <Field label="Theme">
              <select
                className={inputClass}
                value={project.settings.themeId}
                onChange={(e) => setTheme(e.target.value as ThemeId)}
              >
                {Object.values(themes).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="space-y-1">
              {(['showLabels', 'showMetrics', 'showGrid', 'snapToGrid'] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={project.settings[key]}
                    onChange={(e) => updateSettings({ [key]: e.target.checked })}
                  />
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
              ))}
            </div>
            <div className="rounded border border-surface-border p-2">
              <div className="flex items-center gap-2 text-xs font-medium text-white">
                {valid ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                {valid ? 'Architecture valid' : `${validationIssues.length} issue(s) detected`}
              </div>
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                {validationIssues.map((issue) => (
                  <li key={issue.id}>
                    <button
                      type="button"
                      className="text-left text-[11px] text-ui-text-muted hover:text-accent"
                      onClick={() => issue.nodeId && selectNode(issue.nodeId)}
                    >
                      {issue.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {selectedNode && (
          <div className="space-y-3">
            <h3 className="font-medium text-white">{selectedNode.name}</h3>
            <Field label="Name">
              <input
                className={inputClass}
                value={selectedNode.name}
                onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
              />
            </Field>
            <Field label="Type">
              <input className={inputClass} value={selectedNode.type} readOnly />
            </Field>
            <Field label="ID">
              <input className={inputClass} value={selectedNode.id} readOnly />
            </Field>
            {(['x', 'y', 'z'] as const).map((axis) => (
              <Field key={axis} label={`Position ${axis.toUpperCase()}`}>
                <input
                  type="number"
                  className={inputClass}
                  value={selectedNode.position[axis]}
                  onChange={(e) =>
                    updateNode(selectedNode.id, {
                      position: { ...selectedNode.position, [axis]: parseFloat(e.target.value) || 0 },
                    })
                  }
                />
              </Field>
            ))}
            <div className="border-t border-surface-border pt-2">
              <div className="mb-2 text-[10px] font-semibold uppercase text-ui-text-muted">Configuration</div>
              <Field label="Host">
                <input
                  className={inputClass}
                  value={selectedNode.metadata.host ?? ''}
                  onChange={(e) => updateNode(selectedNode.id, { metadata: { host: e.target.value } })}
                />
              </Field>
              <Field label="Port">
                <input
                  type="number"
                  className={inputClass}
                  value={selectedNode.metadata.port ?? ''}
                  onChange={(e) => updateNode(selectedNode.id, { metadata: { port: parseInt(e.target.value, 10) } })}
                />
              </Field>
              <Field label="Replicas">
                <input
                  type="number"
                  className={inputClass}
                  value={selectedNode.metadata.replicas ?? 1}
                  onChange={(e) => updateNode(selectedNode.id, { metadata: { replicas: parseInt(e.target.value, 10) } })}
                />
              </Field>
            </div>
            <div className="border-t border-surface-border pt-2">
              <div className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase text-ui-text-muted">
                <Activity className="h-3 w-3" /> Performance
              </div>
              {(['cpu', 'memory', 'requestsPerSec', 'latencyMs'] as const).map((key) => (
                <Field key={key} label={key}>
                  <input
                    type="number"
                    className={inputClass}
                    value={selectedNode.metadata[key] ?? 0}
                    onChange={(e) =>
                      updateNode(selectedNode.id, { metadata: { [key]: parseFloat(e.target.value) || 0 } })
                    }
                  />
                </Field>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                className="rounded bg-red-900/40 px-2 py-1.5 text-xs text-red-200 hover:bg-red-900/60"
                onClick={() => simulateNodeFailure(selectedNode.id)}
              >
                Simulate Failure
              </button>
              <button
                type="button"
                className="rounded bg-accent/20 px-2 py-1.5 text-xs text-accent-glow hover:bg-accent/30"
                onClick={() => traceRequest(selectedNode.id)}
              >
                Trace Request
              </button>
            </div>
          </div>
        )}

        {selectedEdge && !selectedNode && (
          <div className="space-y-3">
            <h3 className="font-medium text-white">Connection</h3>
            <Field label="Source">
              <input className={inputClass} readOnly value={nodeById.get(selectedEdge.sourceId)?.name ?? selectedEdge.sourceId} />
            </Field>
            <Field label="Target">
              <input className={inputClass} readOnly value={nodeById.get(selectedEdge.targetId)?.name ?? selectedEdge.targetId} />
            </Field>
            <Field label="Protocol">
              <select
                className={inputClass}
                value={selectedEdge.protocol}
                onChange={(e) => updateEdge(selectedEdge.id, { protocol: e.target.value as typeof selectedEdge.protocol })}
              >
                {protocolOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Latency (ms)">
              <input
                type="number"
                className={inputClass}
                value={selectedEdge.metadata.latencyMs ?? 0}
                onChange={(e) =>
                  updateEdge(selectedEdge.id, { metadata: { latencyMs: parseFloat(e.target.value) || 0 } })
                }
              />
            </Field>
            <Field label="Throughput (Mbps)">
              <input
                type="number"
                className={inputClass}
                value={selectedEdge.metadata.throughputMbps ?? 0}
                onChange={(e) =>
                  updateEdge(selectedEdge.id, { metadata: { throughputMbps: parseFloat(e.target.value) || 0 } })
                }
              />
            </Field>
          </div>
        )}
      </div>
      <ArchitectureResourcesPanel />
    </aside>
  );
}
