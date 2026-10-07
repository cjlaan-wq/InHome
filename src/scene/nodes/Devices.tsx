import type { DeviceId } from '../../content/types';
import type { Vec3 } from '../layout';
import { materials } from '../materials';
import { Block, Cylinder } from '../primitives';
import { Highlight, type Status } from '../Highlight';

function Laptop({ position }: { position: Vec3 }) {
  return (
    <group position={position} rotation-y={-0.4}>
      <Block position={[0, 0.015, 0]} size={[0.5, 0.03, 0.34]} material={materials.device} />
      <group position={[0, 0.03, -0.17]} rotation-x={-0.25}>
        <Block position={[0, 0.17, 0]} size={[0.5, 0.34, 0.02]} material={materials.device} />
        <Block position={[0, 0.17, 0.011]} size={[0.44, 0.28, 0.005]} material={materials.screen} />
      </group>
    </group>
  );
}

function Phone({ position }: { position: Vec3 }) {
  return (
    <group position={position} rotation-y={0.5}>
      <Block size={[0.14, 0.02, 0.28]} material={materials.device} />
      <Block position={[0, 0.011, 0]} size={[0.12, 0.005, 0.24]} material={materials.screen} />
    </group>
  );
}

function Tv({ position }: { position: Vec3 }) {
  return (
    // Op een tv-meubel, scherm naar voren (naar de camera).
    <group position={position}>
      <Block size={[1.2, 0.7, 0.05]} material={materials.device} />
      <Block position={[0, 0, 0.026]} size={[1.12, 0.62, 0.005]} material={materials.screen} />
      <Block position={[0, -0.4, 0]} size={[0.3, 0.1, 0.2]} material={materials.device} />
      {/* Decoder op het meubel */}
      <Block position={[0.42, -0.42, 0.08]} size={[0.26, 0.05, 0.18]} material={materials.device} />
      <Block position={[0.5, -0.42, 0.171]} size={[0.03, 0.02, 0.005]} material={materials.led} />
    </group>
  );
}

/** Tuincamera / slimme deurbel: kastje met lens, bovenop een paal (de paal staat in Stands). */
function Camera({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Block size={[0.18, 0.16, 0.2]} material={materials.building} />
      <Cylinder position={[0, 0, 0.11]} rotation-x={Math.PI / 2} size={[0.1, 0.04, 0.1]} material={materials.device} />
      <Block position={[0.06, 0.05, 0.101]} size={[0.02, 0.02, 0.005]} material={materials.led} />
    </group>
  );
}

const components: Record<DeviceId, (props: { position: Vec3 }) => React.JSX.Element> = {
  laptop: Laptop,
  phone: Phone,
  tv: Tv,
  camera: Camera,
};

/** Apparaten: elk apparaat is een eigen subonderdeel, zodat het los uitgelicht kan worden. */
type Props = {
  positions: Record<DeviceId, Vec3>;
  shown: DeviceId[];
  statusOf: (id: DeviceId) => Status;
};

export function Devices({ positions, shown, statusOf }: Props) {
  return (
    <>
      {shown.map((id) => {
        const Device = components[id];
        return (
          <Highlight key={id} status={statusOf(id)}>
            <Device position={positions[id]} />
          </Highlight>
        );
      })}
    </>
  );
}
