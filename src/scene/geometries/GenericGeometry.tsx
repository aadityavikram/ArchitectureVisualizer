import type { NodeGeometryProps } from './types';

export function GenericGeometry({ color, selected, hovered, status, utilizationColor }: NodeGeometryProps) {
  const emissive = selected ? '#4488ff' : hovered ? '#3366cc' : utilizationColor ?? '#000000';
  const intensity = selected ? 0.35 : hovered ? 0.15 : utilizationColor ? 0.2 : 0;

  return (
    <mesh castShadow receiveShadow scale={status === 'failed' ? 0.85 : 1}>
      <dodecahedronGeometry args={[0.65, 0]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} metalness={0.35} roughness={0.5} flatShading />
    </mesh>
  );
}
