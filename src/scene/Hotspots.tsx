import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { NodeId } from '../content/types';
import { useAppStore } from '../state/store';
import { hotspots } from './layout';
import { geometries } from './materials';

/** Meer beweging dan dit (px) tussen indrukken en loslaten is slepen, geen klik. */
const dragThreshold = 6;

/** Onzichtbare klikzones: hoveren toont de tooltip, klikken zet de camera op het onderdeel. */
export function Hotspots({ activeNodeIds }: { activeNodeIds: NodeId[] }) {
  const hovered = useAppStore((s) => s.hovered);
  const setHovered = useAppStore((s) => s.setHovered);
  const focusNode = useAppStore((s) => s.focusNode);
  useCursor(hovered !== null);

  return (
    <>
      {hotspots
        .filter((spot) => activeNodeIds.includes(spot.nodeId))
        .map((spot) => (
          <mesh
            key={spot.partId ?? spot.nodeId}
            geometry={geometries.box}
            position={spot.center}
            scale={spot.size}
            visible={false}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              setHovered({ nodeId: spot.nodeId, partId: spot.partId });
            }}
            onPointerOut={() => setHovered(null)}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              if (e.delta <= dragThreshold) focusNode(spot.nodeId);
            }}
          />
        ))}
    </>
  );
}
