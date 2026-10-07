import { useCursor } from '@react-three/drei';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import type { NodeId } from '../content/types';
import { useAppStore, type PlaceableId } from '../state/store';
import type { Hotspot } from './layout';
import { geometries } from './materials';

/** Wat je in 'Jouw huis' kunt verslepen. */
const placeable = (spot: Hotspot): PlaceableId | null =>
  spot.partId ?? (spot.nodeId === 'modem' || spot.nodeId === 'extender' ? spot.nodeId : null);

/** Meer beweging dan dit (px) tussen indrukken en loslaten is slepen, geen klik. */
const dragThreshold = 6;

/**
 * Onzichtbare klikzones: hoveren toont de tooltip, klikken zet de camera op het onderdeel.
 * In 'Jouw huis' kun je de KPN Box, het SuperWifi-punt en apparaten ermee oppakken en verslepen.
 */
export function Hotspots({ hotspots, activeNodeIds }: { hotspots: Hotspot[]; activeNodeIds: NodeId[] }) {
  const hovered = useAppStore((s) => s.hovered);
  const setHovered = useAppStore((s) => s.setHovered);
  const focusNode = useAppStore((s) => s.focusNode);
  const homeMode = useAppStore((s) => s.mode === 'home');
  const dragging = useAppStore((s) => s.dragging);
  const setDragging = useAppStore((s) => s.setDragging);
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;
  useCursor(hovered !== null || dragging !== null, dragging ? 'grabbing' : homeMode ? 'grab' : 'pointer');

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
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              const item = placeable(spot);
              if (!homeMode || !item) return;
              e.stopPropagation();
              // Camera stil houden tijdens het slepen.
              if (controls) controls.enabled = false;
              setDragging(item);
            }}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              if (!homeMode && e.delta <= dragThreshold) focusNode(spot.nodeId);
            }}
          />
        ))}
    </>
  );
}
