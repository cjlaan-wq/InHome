import { RoundedBox } from '@react-three/drei';
import { materials } from '../materials';
import { Block } from '../primitives';
import type { Vec3 } from '../layout';

/** SuperWifi-punt: compact wit kastje met groen lampje. */
export function Extender({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.3, 0.38, 0.3]} radius={0.08} smoothness={3} material={materials.building} />
      <Block position={[0, 0.06, 0.152]} size={[0.06, 0.06, 0.01]} material={materials.led} />
    </group>
  );
}
