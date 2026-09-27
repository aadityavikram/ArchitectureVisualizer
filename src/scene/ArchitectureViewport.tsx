import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, GizmoHelper, GizmoViewport, TransformControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { Group } from 'three';
import { ArchitectureNodeMesh } from '@/scene/NodeRenderer';
import { EdgeRendererList } from '@/scene/EdgeRenderer';
import { GroupRenderer } from '@/scene/GroupRenderer';
import { useArchitectureStore, useProject, useSelection, useSimulation } from '@/store/architectureStore';
import { getTheme } from '@/themes';
import { useResponsiveLayout } from '@/hooks/useMediaQuery';
import type { ArchitectureNode } from '@/types/architecture';

const DESKTOP_CAMERA: [number, number, number] = [12, 10, 12];
const MOBILE_CAMERA: [number, number, number] = [28, 22, 28];

function frameCameraToNodes(
  camera: THREE.Camera,
  controls: OrbitControlsImpl | null,
  nodes: ArchitectureNode[],
  distanceScale: number,
) {
  const target = new THREE.Vector3(0, 0, 0);
  if (nodes.length === 0) {
    const [x, y, z] = MOBILE_CAMERA;
    camera.position.set(x, y, z);
    controls?.target.copy(target);
    controls?.update();
    return;
  }

  const box = new THREE.Box3();
  for (const n of nodes) {
    box.expandByPoint(new THREE.Vector3(n.position.x, n.position.y, n.position.z));
  }
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 10);
  const dist = maxDim * distanceScale + 10;
  camera.position.set(center.x + dist * 0.65, center.y + dist * 0.55, center.z + dist * 0.65);
  controls?.target.copy(center);
  controls?.update();
}

function SceneContent() {
  const project = useProject();
  const selection = useSelection();
  const simulation = useSimulation();
  const ui = useArchitectureStore((s) => s.ui);
  const moveNode = useArchitectureStore((s) => s.moveNode);
  const updateNode = useArchitectureStore((s) => s.updateNode);
  const clearSelection = useArchitectureStore((s) => s.clearSelection);
  const setFps = useArchitectureStore((s) => s.setFps);
  const theme = getTheme(project.settings.themeId as 'dark');
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const selectedNodeId = selection.nodeIds.length === 1 ? selection.nodeIds[0] : null;
  const selectedNode = project.nodes.find((n) => n.id === selectedNodeId);
  const transformRef = useRef<Group>(null);
  const { isMobile, isTablet } = useResponsiveLayout();
  const mobileCameraFramed = useRef(false);

  const { camera } = useThree();

  useFrame((_, delta) => {
    setFps(Math.round(1 / Math.max(delta, 0.001)));
  });

  useEffect(() => {
    if (!isTablet) {
      mobileCameraFramed.current = false;
      return;
    }
    if (project.nodes.length === 0) return;
    if (mobileCameraFramed.current) return;
    mobileCameraFramed.current = true;
    frameCameraToNodes(camera, controlsRef.current, project.nodes, 2.75);
  }, [isTablet, camera, project.nodes]);

  useEffect(() => {
    const onFocus = () => {
      if (selection.nodeIds.length === 0) return;
      const nodes = project.nodes.filter((n) => selection.nodeIds.includes(n.id));
      if (nodes.length === 0) return;
      const box = new THREE.Box3();
      for (const n of nodes) {
        box.expandByPoint(new THREE.Vector3(n.position.x, n.position.y, n.position.z));
      }
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const dist = Math.max(size.x, size.y, size.z) * 2 + 5;
      camera.position.set(center.x + dist * 0.6, center.y + dist * 0.5, center.z + dist * 0.6);
      controlsRef.current?.target.copy(center);
      controlsRef.current?.update();
    };

    const onView = (e: Event) => {
      const detail = (e as CustomEvent<{ view: string }>).detail;
      const target = new THREE.Vector3(0, 0, 0);
      const d = 15;
      switch (detail.view) {
        case 'top':
          camera.position.set(0, d, 0.01);
          break;
        case 'front':
          camera.position.set(0, 5, d);
          break;
        case 'side':
          camera.position.set(d, 5, 0);
          break;
        case 'iso':
          camera.position.set(d, d * 0.8, d);
          break;
        case 'reset': {
          const [x, y, z] = isTablet ? MOBILE_CAMERA : DESKTOP_CAMERA;
          camera.position.set(x, y, z);
          break;
        }
      }
      controlsRef.current?.target.copy(target);
      controlsRef.current?.update();
    };

    window.addEventListener('architecture:focus-selection', onFocus);
    window.addEventListener('architecture:camera-view', onView);
    return () => {
      window.removeEventListener('architecture:focus-selection', onFocus);
      window.removeEventListener('architecture:camera-view', onView);
    };
  }, [camera, project.nodes, selection.nodeIds, isTablet]);

  return (
    <>
      <color attach="background" args={[theme.scene.background]} />
      <fog attach="fog" args={[theme.scene.fog, 30, 80]} />
      <ambientLight intensity={theme.scene.ambientIntensity} />
      <directionalLight
        castShadow
        intensity={theme.scene.directionalIntensity}
        position={[10, 20, 10]}
        shadow-mapSize={[2048, 2048]}
      />
      {project.settings.showGrid && (
        <Grid
          infiniteGrid
          cellSize={project.settings.gridSize}
          sectionSize={project.settings.gridSize * 5}
          cellColor={theme.scene.gridSecondary}
          sectionColor={theme.scene.gridPrimary}
          fadeDistance={50}
          fadeStrength={1}
        />
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0f1419" transparent opacity={0.6} />
      </mesh>

      {project.groups.map((g) => (
        <GroupRenderer key={g.id} group={g} />
      ))}

      <EdgeRendererList
        edges={project.edges}
        nodes={project.nodes}
        selection={selection.edgeIds}
        simulation={simulation}
      />

      {project.nodes.map((node) => (
        <ArchitectureNodeMesh
          key={node.id}
          node={node}
          selected={selection.nodeIds.includes(node.id)}
          showLabel={project.settings.showLabels}
          showMetrics={project.settings.showMetrics}
          metricsMode={ui.metricsMode}
        />
      ))}

      {selectedNode && !ui.connectionMode && (
        <TransformControls
          mode={ui.transformMode}
          position={[selectedNode.position.x, selectedNode.position.y, selectedNode.position.z]}
          onMouseDown={() => useArchitectureStore.getState().pushHistory()}
          onMouseUp={() => {
            const obj = transformRef.current;
            if (!obj) return;
            if (ui.transformMode === 'translate') {
              moveNode(selectedNode.id, { x: obj.position.x, y: obj.position.y, z: obj.position.z });
            } else if (ui.transformMode === 'rotate') {
              updateNode(selectedNode.id, {
                rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
              });
            } else {
              updateNode(selectedNode.id, {
                scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
              });
            }
          }}
        >
          <group ref={transformRef}>
            <mesh visible={false}>
              <boxGeometry args={[1.2, 1.2, 1.2]} />
            </mesh>
          </group>
        </TransformControls>
      )}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={60}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />

      {!isMobile && (
        <GizmoHelper alignment="bottom-right" margin={[72, 72]}>
          <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
        </GizmoHelper>
      )}

      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          clearSelection();
        }}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
      >
        <planeGeometry args={[200, 200]} />
      </mesh>
    </>
  );
}

type ViewportProps = {
  onDrop?: (type: string, position: { x: number; y: number; z: number }) => void;
};

export function ArchitectureViewport({ onDrop }: ViewportProps) {
  const planeRef = useRef<HTMLDivElement>(null);
  const { isTablet } = useResponsiveLayout();
  const cameraPosition = isTablet ? MOBILE_CAMERA : DESKTOP_CAMERA;
  const cameraFov = isTablet ? 58 : 50;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/arch-node-type');
    if (!type || !onDrop) return;
    const rect = planeRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const nz = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    onDrop(type, { x: nx, y: 0, z: nz });
  };

  return (
    <div
      ref={planeRef}
      className="relative h-full w-full touch-none overflow-hidden bg-[var(--ui-bg)]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="application"
      aria-label="3D architecture viewport"
    >
      <Canvas
        shadows
        camera={{ position: cameraPosition, fov: cameraFov }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Environment preset="night" />
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
