import { useArchitectureStore } from '@/store/architectureStore';

export function StatusBar() {
  const project = useArchitectureStore((s) => s.project);
  const simulation = useArchitectureStore((s) => s.simulation);
  const fps = useArchitectureStore((s) => s.fps);
  const ui = useArchitectureStore((s) => s.ui);
  const setUI = useArchitectureStore((s) => s.setUI);
  const setSimulation = useArchitectureStore((s) => s.setSimulation);

  if (ui.presentationMode) return null;

  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-surface-border bg-surface-raised px-3 font-mono text-[11px] text-gray-400">
      <span>
        Nodes: <span className="text-white">{project.nodes.length}</span>
      </span>
      <span>
        Connections: <span className="text-white">{project.edges.length}</span>
      </span>
      <span>
        Groups: <span className="text-white">{project.groups.length}</span>
      </span>
      <span>
        Simulation:{' '}
        <span className={simulation.active ? 'text-green-400' : 'text-gray-500'}>
          {simulation.active ? 'ON' : 'OFF'}
        </span>
      </span>
      <span>
        FPS: <span className="text-white">{fps}</span>
      </span>
      <label className="ml-auto flex items-center gap-2">
        <input
          type="checkbox"
          checked={ui.metricsMode}
          onChange={(e) => setUI({ metricsMode: e.target.checked })}
        />
        Metrics mode
      </label>
      <label className="flex items-center gap-2">
        Traffic:
        <select
          className="rounded border border-surface-border bg-surface-overlay px-1 text-[10px] text-white"
          value={simulation.trafficType}
          onChange={(e) =>
            setSimulation({ trafficType: e.target.value as typeof simulation.trafficType })
          }
        >
          <option value="request">Request</option>
          <option value="response">Response</option>
          <option value="error">Error</option>
          <option value="replication">Replication</option>
          <option value="event">Event</option>
        </select>
      </label>
    </footer>
  );
}
