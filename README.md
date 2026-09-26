# 3D System Architecture Visualizer

Interactive 3D editor for designing, exploring, and explaining distributed system architectures.

## Run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Build & lint

```bash
npm run build
npm run lint
```

## Features

- **3D architecture canvas** — Orbit controls, grid, lighting, orientation gizmo
- **Component library** — Drag-and-drop clients, gateways, databases, Kafka, workers, and more
- **Selection & transforms** — Translate, rotate, scale with inspector edits
- **Connections** — Connect mode, Bezier edges, animated simulation particles
- **Groups** — VPC / cluster-style transparent bounds (demo + templates)
- **Templates** — Simple web, scalable web, microservices, event-driven, Kubernetes
- **Simulation** — Traffic particles, trace request, failure simulation
- **Persistence** — localStorage save/load, JSON import/export
- **Export** — JSON, PNG, SVG, Markdown, Mermaid
- **Auto layout** — Hierarchical, force-directed, grid, radial
- **Validation** — Disconnected nodes, overload hints, dependency cycles
- **Command palette** — `Ctrl/Cmd+K`
- **Themes** — Dark, Light, Cyber, Blueprint
- **Presentation mode** — UI-minimal walkthrough view

## Project structure

```
src/
  components/     Command palette, minimap, toasts
  data/           Component library, templates, demo architecture
  exporters/      JSON-adjacent exports (Mermaid, SVG, Markdown)
  hooks/          Global keyboard shortcuts
  panels/         Library, inspector, status bar
  persistence/    localStorage project storage
  scene/          R3F viewport, nodes, edges, groups, geometries
  simulation/     Traffic / failure logic (separate from rendering)
  store/          Zustand architecture store + undo/redo
  themes/         Centralized UI/scene colors
  toolbar/        Top menu bar
  types/          Serializable architecture model
  utils/          Layout, validation, helpers
```

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+K` | Command palette |
| `Ctrl/Cmd+S` | Save project |
| `Ctrl/Cmd+Z` | Undo |
| `Ctrl/Cmd+Shift+Z` / `Ctrl/Cmd+Y` | Redo |
| `Ctrl/Cmd+D` | Duplicate selection |
| `Ctrl/Cmd+A` | Select all nodes |
| `Delete` | Delete selection |
| `Escape` | Clear selection / close palette |
| `F` | Focus selection |
| `1` / `2` / `3` / `0` | Top / front / side / isometric camera |

## Architectural decisions

- **Serializable state only** in Zustand — no Three.js objects in persisted projects
- **Registry-based node meshes** — `componentRegistry.ts` maps types to geometry components
- **History snapshots** — Undo/redo stores cloned `ArchitectureProject` + selection ( capped at 50 )
- **Rendering vs simulation** — Particles rendered in `EdgeRenderer`; rules in `simulation/engine.ts`

## Known limitations

- Transform gizmo applies to a proxy object; complex multi-select transform is not supported
- PNG export captures the WebGL canvas only (no UI chrome)
- Very large graphs (1000+ nodes) will need instancing and label LOD tuning
- Context menu and presentation slides are minimal (camera slide capture is basic)

## Recommended next steps

- Instanced rendering for repeated node types at scale
- Edge creation drag handles (port snapping)
- Collaborative editing / cloud persistence
- Import from Terraform, Kubernetes YAML, or CloudFormation
