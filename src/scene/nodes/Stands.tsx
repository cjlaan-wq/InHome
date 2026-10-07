import type { DeviceId } from '../../content/types';
import { deviceBaseHeight, deviceLift, deviceOrder, standHeight } from '../../state/homeGeometry';
import type { Vec3 } from '../layout';
import { materials } from '../materials';
import { Block, Cylinder } from '../primitives';

type Props = {
  modem: Vec3;
  extender?: Vec3;
  devices: Record<DeviceId, Vec3>;
  shownDevices: DeviceId[];
  modemShown: boolean;
};

/** Meubels die met de KPN Box, het SuperWifi-punt en de apparaten mee verhuizen naar een andere kamer. */
export function Stands({ modem, extender, devices, shownDevices, modemShown }: Props) {
  const floorY = (p: Vec3, height: number) => p[1] - height;
  return (
    <group>
      {modemShown && <Cabinet at={modem} floor={floorY(modem, standHeight + 0.27)} size={[0.6, 0.45]} />}
      {extender && <Cabinet at={extender} floor={floorY(extender, standHeight + 0.19)} size={[0.45, 0.4]} />}
      {deviceOrder
        .filter((id) => shownDevices.includes(id))
        .map((id) => {
          const p = devices[id];
          const base = deviceBaseHeight[id];
          const floor = p[1] - base - deviceLift[id];
          if (id === 'tv') return <Block key={id} position={[p[0], floor + base / 2, p[2]]} size={[1.3, base, 0.4]} material={materials.furniture} />;
          const top = id === 'laptop' ? [0.75, 0.5] : [0.45, 0.45];
          return (
            <group key={id}>
              <Block position={[p[0], floor + base - 0.02, p[2]]} size={[top[0], 0.04, top[1]]} material={materials.furniture} />
              <Cylinder position={[p[0], floor + (base - 0.04) / 2, p[2]]} size={[0.08, base - 0.04, 0.08]} material={materials.furniture} />
            </group>
          );
        })}
    </group>
  );
}

function Cabinet({ at, floor, size }: { at: Vec3; floor: number; size: [number, number] }) {
  return <Block position={[at[0], floor + standHeight / 2, at[2]]} size={[size[0], standHeight, size[1]]} material={materials.furniture} />;
}
