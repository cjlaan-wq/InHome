import { useEffect } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { HousePreset } from '../content/types';
import { floorTop } from '../state/homeGeometry';
import { useAppStore } from '../state/store';

const plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

/**
 * Slepen in 'Jouw huis': onzichtbare vloervlakken per kamer. Zodra je iets versleept,
 * springt het naar de kamer onder je vinger of muis – en de wifi-dekking rekent live mee.
 */
export function RoomDrag({ house, visibleFloor }: { house: HousePreset; visibleFloor: number | null }) {
  const dragging = useAppStore((s) => s.dragging);
  const place = useAppStore((s) => s.place);
  const setDragging = useAppStore((s) => s.setDragging);
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;

  // Loslaten (waar dan ook): slepen stopt, de camera is weer vrij.
  useEffect(() => {
    if (!dragging) return;
    const stop = () => {
      setDragging(null);
      if (controls) controls.enabled = true;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [dragging, setDragging, controls]);

  const rooms = house.rooms.filter((room) => visibleFloor === null || room.floor <= visibleFloor);
  return (
    <group>
      {rooms.map((room) => (
        <mesh
          key={room.id}
          geometry={plane}
          visible={false}
          position={[room.x + room.width / 2, floorTop(room.floor) + 0.03, room.z + room.depth / 2]}
          scale={[room.width, 1, room.depth]}
          onPointerMove={(e: ThreeEvent<PointerEvent>) => {
            if (!dragging) return;
            e.stopPropagation();
            place(dragging, room.id);
          }}
        />
      ))}
    </group>
  );
}
