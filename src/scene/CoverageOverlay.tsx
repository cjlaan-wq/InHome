import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { HousePreset } from '../content/types';
import { t } from '../i18n';
import type { Coverage, Quality } from '../state/coverage';
import { floorTop } from '../state/homeGeometry';
import { colors } from '../theme';
import { SignalBars } from '../ui/SignalBars';

const tint: Record<Quality, string> = { good: colors.coverageGood, fair: colors.coverageFair, weak: colors.coverageWeak };
const plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

type Props = { house: HousePreset; coverage: Coverage; visibleFloor: number | null; labels: boolean };

/** Wifi-dekking per kamer: zachte kleur op de vloer en een label met naam, streepjes en woord. */
export function CoverageOverlay({ house, coverage, visibleFloor, labels }: Props) {
  // Op een smal scherm alleen de vloerkleur: de kamerlijst met woorden staat in het paneel.
  const roomy = useThree((s) => s.size.width >= 640);
  const materials = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(tint) as Quality[]).map((q) => [
          q,
          new THREE.MeshBasicMaterial({ color: tint[q], transparent: true, opacity: 0.3, depthWrite: false }),
        ]),
      ) as Record<Quality, THREE.MeshBasicMaterial>,
    [],
  );
  const rooms = house.rooms.filter((room) => visibleFloor === null || room.floor <= visibleFloor);

  return (
    <group>
      {rooms.map((room) => {
        const reading = coverage.rooms[room.id];
        const y = floorTop(room.floor) + 0.02;
        return (
          <group key={room.id}>
            <mesh
              geometry={plane}
              material={materials[reading.quality]}
              position={[room.x + room.width / 2, y, room.z + room.depth / 2]}
              scale={[room.width - 0.12, 1, room.depth - 0.12]}
              renderOrder={1}
            />
            {labels && roomy && (
              <Html
                position={[room.x + room.width * 0.5, y + 0.15, room.z + room.depth * 0.5]}
                center
                zIndexRange={[4, 0]}
                style={{ pointerEvents: 'none' }}
              >
                <span className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-surface/90 px-2 py-0.5 text-[11px] text-ink shadow-sm">
                  <span className="font-medium">{room.label}</span>
                  <SignalBars quality={reading.quality} />
                  <span className="text-ink-muted">{t(`quality.${reading.quality}`)}</span>
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
