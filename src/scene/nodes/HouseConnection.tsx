import type { ConnectionType } from '../../content/types';
import { materials } from '../materials';
import { Block, Cylinder } from '../primitives';
import type { Vec3 } from '../layout';

/** Glasvezel: FTU-kastje aan de achtermuur. DSL: platte wandcontactdoos. Voorkant wijst naar binnen (+z). */
export function HouseConnection({ position, type }: { position: Vec3; type: ConnectionType }) {
  return (
    <group position={position} rotation-y={-Math.PI / 2}>
      {type === 'fiber' ? (
        <>
          <Block size={[0.12, 0.42, 0.3]} material={materials.building} />
          <Block position={[0.065, 0.12, 0]} size={[0.01, 0.06, 0.18]} material={materials.accent} />
          <Block position={[0.065, -0.06, 0.06]} size={[0.01, 0.05, 0.05]} material={materials.led} />
        </>
      ) : (
        <>
          <Block size={[0.05, 0.24, 0.24]} material={materials.building} />
          <Cylinder position={[0.03, 0, 0]} rotation-z={Math.PI / 2} size={[0.12, 0.02, 0.12]} material={materials.buildingShade} />
        </>
      )}
    </group>
  );
}
