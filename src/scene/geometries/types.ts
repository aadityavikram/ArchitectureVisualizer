export type NodeGeometryProps = {
  color: string;
  selected: boolean;
  hovered: boolean;
  status: 'healthy' | 'degraded' | 'failed';
  utilizationColor?: string;
};
