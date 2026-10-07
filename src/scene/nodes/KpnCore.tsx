import { materials } from '../materials';
import { Block, Cylinder } from '../primitives';
import type { Vec3 } from '../layout';

/** Het kernnetwerk van KPN: een klein datacentercomplex met een zendmast. */
export function KpnCore({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Block position={[0, 1.6, 0]} size={[4, 3.2, 3]} material={materials.building} />
      <Block position={[0, 3.25, 0]} size={[4.1, 0.1, 3.1]} material={materials.buildingShade} />
      {/* Groene band als KPN-accent */}
      <Block position={[0, 2.7, 1.51]} size={[4, 0.18, 0.02]} material={materials.accent} />
      <Block position={[2.9, 1.1, 0.4]} size={[1.8, 2.2, 2.2]} material={materials.building} />
      {/* Serverrekken zichtbaar door 'ramen' */}
      {[-1.3, -0.45, 0.4, 1.25].map((x) => (
        <Block key={x} position={[x, 1.3, 1.51]} size={[0.6, 1.6, 0.02]} material={materials.screen} />
      ))}
      {[-1.3, -0.45, 0.4, 1.25].map((x) => (
        <Block key={`led-${x}`} position={[x, 1.85, 1.53]} size={[0.4, 0.05, 0.02]} material={materials.led} />
      ))}
      <Cylinder position={[-1.3, 4.4, -0.8]} size={[0.12, 2.3, 0.12]} material={materials.buildingShade} />
      <Cylinder position={[-1.3, 5.6, -0.8]} size={[0.22, 0.22, 0.22]} material={materials.accent} />
    </group>
  );
}
