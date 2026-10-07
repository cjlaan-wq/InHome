import { useMemo } from 'react';
import { getHouse, nodes } from '../content';
import type { DeviceId } from '../content/types';
import { t } from '../i18n';
import { computeCoverage, type Quality, type Reading } from './coverage';
import { roomById } from './homeGeometry';
import { useAppStore } from './store';

const deviceLabels = Object.fromEntries(
  (nodes.find((node) => node.id === 'devices')?.parts ?? []).map((part) => [part.id, part.label]),
) as Record<DeviceId, string>;

const countWord = (n: number) => (n >= 2 && n <= 4 ? t(`number.${n}` as 'number.2') : String(n));

/** 'een muur en een vloer', 'twee muren', 'alleen de afstand'. */
export const describeObstacles = (reading: Pick<Reading, 'walls' | 'floors'>) => {
  const parts = [
    reading.walls === 1 ? t('obstacle.wall1') : reading.walls > 1 ? t('obstacle.walls', { count: countWord(reading.walls) }) : '',
    reading.floors === 1 ? t('obstacle.floor1') : reading.floors > 1 ? t('obstacle.floors', { count: countWord(reading.floors) }) : '',
  ].filter(Boolean);
  if (parts.length === 0) return t('obstacle.none');
  return parts.length === 1 ? parts[0] : t('obstacle.and', { a: parts[0], b: parts[1] });
};

export const qualityWord = (quality: Quality) => t(`quality.${quality}`);

/** Jouw huis: het woningtype, waar alles staat, de wifi-dekking en teksten voor de content. */
export function useHome() {
  const houseId = useAppStore((s) => s.houseId);
  const placement = useAppStore((s) => s.placement);
  const hasExtender = useAppStore((s) => s.hasExtender);

  return useMemo(() => {
    const house = getHouse(houseId);
    const coverage = computeCoverage(house, placement);
    const roomLabel = (id: string) => roomById(house, id).label;
    const lower = (text: string) => text.toLowerCase();
    /** 'in de woonkamer', 'op zolder'. */
    const roomIn = (id: string) => {
      const room = roomById(house, id);
      return room.inPhrase ?? `in de ${lower(room.label)}`;
    };
    const weak = coverage.devices[coverage.weakestDevice];

    /** Waarden voor {placeholders} in de content (zie issues.ts). */
    const templateVars: Record<string, string> = {
      weakDevice: lower(deviceLabels[coverage.weakestDevice]),
      weakRoomIn: roomIn(weak.roomId),
      weakObstacles: describeObstacles(weak),
      modemRoomIn: roomIn(placement.modemRoomId),
      adviceModemRoom: lower(roomLabel(coverage.betterModemRoomId ?? placement.modemRoomId)),
      adviceExtenderRoomIn: roomIn(
        coverage.bestExtenderRoomId ?? placement.extenderRoomIds[0] ?? house.defaults.extenderRoomId,
      ),
    };

    return {
      house,
      placement,
      hasExtender,
      coverage,
      roomLabel,
      roomIn,
      deviceLabel: (id: DeviceId) => deviceLabels[id],
      /** 'in de woonkamer' / 'op zolder' voor waar een apparaat staat. */
      deviceRoomIn: (id: DeviceId) => roomIn(placement.deviceRooms[id]),
      templateVars,
    };
  }, [houseId, placement, hasExtender]);
}

export type Home = ReturnType<typeof useHome>;
