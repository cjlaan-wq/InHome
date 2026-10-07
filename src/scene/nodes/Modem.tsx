import { RoundedBox } from '@react-three/drei';
import { materials } from '../materials';
import { Block } from '../primitives';
import type { Vec3 } from '../layout';

/** KPN Box: staand wit kastje met statuslampjes. */
export function Modem({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.18, 0.5, 0.38]} radius={0.05} smoothness={3} material={materials.building} />
      {[0.12, 0.04, -0.04].map((y) => (
        <Block key={y} position={[0.092, y, 0.1]} size={[0.01, 0.03, 0.03]} material={materials.led} />
      ))}
    </group>
  );
}
