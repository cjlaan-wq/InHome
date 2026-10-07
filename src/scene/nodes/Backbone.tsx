import { materials } from '../materials';
import { Block, Cylinder } from '../primitives';
import type { Vec3 } from '../layout';

/** Verdeelpunt in het glasvezelnetwerk: een putdeksel waar kabels samenkomen. */
export function Backbone({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Cylinder position={[0, 0.06, 0]} size={[1.6, 0.12, 1.6]} material={materials.buildingShade} />
      <Cylinder position={[0, 0.13, 0]} size={[1.1, 0.04, 1.1]} material={materials.roof} />
      <Block position={[0, 0.16, 0]} size={[0.5, 0.02, 0.08]} material={materials.accent} />
      {/* Paaltje dat het tracé markeert */}
      <Cylinder position={[0.95, 0.45, 0.3]} size={[0.12, 0.9, 0.12]} material={materials.building} />
      <Cylinder position={[0.95, 0.85, 0.3]} size={[0.14, 0.14, 0.14]} material={materials.accent} />
    </group>
  );
}
