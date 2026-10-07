import { materials } from '../materials';
import { Block } from '../primitives';
import type { Vec3 } from '../layout';

/** Wijkkast: grijsgroene straatkast met deuren. */
export function StreetCabinet({ position }: { position: Vec3 }) {
  return (
    <group position={position} rotation-y={-0.35}>
      <Block position={[0, 0.06, 0]} size={[1.5, 0.12, 0.8]} material={materials.buildingShade} />
      <Block position={[0, 0.72, 0]} size={[1.3, 1.2, 0.6]} material={materials.cabinet} />
      <Block position={[0, 1.36, 0]} size={[1.4, 0.08, 0.7]} material={materials.cabinet} />
      {/* Deurnaad en grepen */}
      <Block position={[0, 0.72, 0.305]} size={[0.02, 1.05, 0.01]} material={materials.device} />
      <Block position={[-0.12, 0.8, 0.31]} size={[0.04, 0.16, 0.02]} material={materials.device} />
      <Block position={[0.12, 0.8, 0.31]} size={[0.04, 0.16, 0.02]} material={materials.device} />
      <Block position={[0.45, 1.15, 0.31]} size={[0.14, 0.04, 0.01]} material={materials.led} />
    </group>
  );
}
