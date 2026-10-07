import type { DeviceId } from '../../content/types';
import { devicePositions, type Vec3 } from '../layout';
import { materials } from '../materials';
import { Block } from '../primitives';
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
    // Hangt aan de binnenmuur, scherm naar de woonkamer (+x).
    <group position={position} rotation-y={Math.PI / 2}>
      <Block size={[1.6, 0.92, 0.06]} material={materials.device} />
      <Block position={[0, 0, 0.031]} size={[1.5, 0.82, 0.005]} material={materials.screen} />
      {/* Decoder op het meubel eronder */}
      <Block position={[0.5, -0.62, 0.25]} size={[0.3, 0.06, 0.22]} material={materials.device} />
      <Block position={[0.6, -0.62, 0.361]} size={[0.03, 0.02, 0.005]} material={materials.led} />
    </group>
  );
}

const components: Record<DeviceId, (props: { position: Vec3 }) => React.JSX.Element> = {
  laptop: Laptop,
  phone: Phone,
  tv: Tv,
};

/** Apparaten: elk apparaat is een eigen subonderdeel, zodat het los uitgelicht kan worden. */
export function Devices({ statusOf }: { statusOf: (id: DeviceId) => Status }) {
  return (
    <>
      {(Object.keys(devicePositions) as DeviceId[]).map((id) => {
        const Device = components[id];
        return (
          <Highlight key={id} status={statusOf(id)}>
            <Device position={devicePositions[id]} />
          </Highlight>
        );
      })}
    </>
  );
}
