# Story Log

Story Log is a React and Three.js MVP for corporate troubleshooting and observability. It turns an integration flow into an interactive tabletop architectural model with simulated request movement, retry behavior, and discreet error context.

## How to run

```bash
npm install
npm run dev
```

For a production compile check:

```bash
npm run build
```

## Main technologies

- React with Vite and TypeScript for the app shell.
- Three.js with React Three Fiber for the 3D scene.
- `@react-three/drei` for camera controls, rounded geometry helpers, labels, environment lighting, and HTML overlays.
- GSAP for polished UI and scene micro-animations.
- Zustand for simulation state management.

## Project architecture

- `src/ui/` contains the corporate side panel and selected-system detail panel.
- `src/scene/` contains the tabletop model, buildings, flow routes, moving request particles, and error callout.
- `src/simulation/` defines the systems, flow topology, and route curves.
- `src/store/` contains the Zustand simulation store.
- `src/types/` centralizes simulation and system types.
- `src/utils/` contains shared visual mapping helpers.

The scene is deliberately modeled as a presentation-table architecture model rather than a game environment. Each system is a rounded miniature building with subtle material differences, restrained colors, soft shadows, and professional labels.

## Simulation behavior

The app supports three scenarios:

- **Success**: muted blue request particles travel from Salesforce through Experience API, Process API, System API, and Database.
- **Retry**: amber particles follow a route that detours through the JMS Queue and returns to the Process API before continuing.
- **Error**: a request terminates at Process API, the building receives a discreet highlight, and an error card shows the error type, correlation ID, and timestamp.

The side panel controls start, pause, and scenario selection. OrbitControls provide rotation, zoom, and pan for inspecting the model.

## How to extend the simulation

1. Add or update systems in `src/simulation/systems.ts`.
2. Adjust flow sequences in `mainFlow` or `retryFlow`.
3. Add new mode names to `SimulationMode` in `src/types/simulation.ts`.
4. Extend `getSimulationCurve` in `src/simulation/paths.ts`.
5. Add new UI controls in `src/ui/ControlPanel.tsx`.

For real observability use cases, the next step would be replacing static topology data with imported event streams and generated route segments.

## Future evolution ideas

- Import real logs from JSON.
- Filter incidents and particles by `CorrelationId`.
- Add timeline playback with scrubbing and pause-on-error.
- Visualize multiple simultaneous requests.
- Support augmented reality projection for meeting rooms.
- Add production observability scenarios such as latency heatmaps, SLA breach overlays, queue depth, dependency health, and incident replay.
