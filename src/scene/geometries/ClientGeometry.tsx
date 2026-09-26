import { useRef } from 'react';
import type { Mesh } from 'three';
import type { NodeGeometryProps } from './types';

export function ClientGeometry({ color, selected, hovered, status }: NodeGeometryProps) {
  const ref = useRef<Mesh>(null);
  const emissive = selected ? '#4488ff' : hovered ? '#3366cc' : '#000000';
  const intensity = selected ? 0.4 : hovered ? 0.2 : 0;
  const scale = status === 'failed' ? 0.85 : 1;

  return (
    <group scale={scale}>
      <mesh ref={ref} castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.4, 0.08, 1]} />
        <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.55, -0.05]}>
        <boxGeometry args={[1.2, 0.7, 0.06]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={intensity}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}
