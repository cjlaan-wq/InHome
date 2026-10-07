import type { DeviceId, HousePreset, Room } from '../content/types';
import {
  deviceOrder,
  extenderSpot,
  modemSpot,
  roomAt,
  roomById,
  roomCenter,
  type HomePlacement,
  type Point3,
} from './homeGeometry';

// CONCEPT – valideren met KPN
// Eenvoudig, indicatief dekkingsmodel: geen meting. De signaalsterkte (0–100) neemt af
// met afstand, muren en vloeren tussen de bron (KPN Box of SuperWifi-punt) en de kamer.
// Alle getallen staan hieronder bij elkaar, zodat ze makkelijk bij te stellen zijn.
export const coverageModel = {
  perMeter: 5,
  perWall: 10,
  perFloor: 30,
  /** Een SuperWifi-punt zendt nooit sterker uit dan dit, en ook niet sterker dan wat het zelf ontvangt + bonus. */
  extenderMax: 85,
  extenderBonus: 25,
  /** Grenzen tussen goed / redelijk / zwak. */
  good: 60,
  fair: 35,
} as const;

export type Quality = 'good' | 'fair' | 'weak';
export type Source = 'modem' | 'extender';

export type Reading = {
  score: number;
  quality: Quality;
  servedBy: Source;
  walls: number;
  floors: number;
};

export type Coverage = {
  rooms: Record<string, Reading>;
  devices: Record<DeviceId, Reading & { roomId: string }>;
  weakestDevice: DeviceId;
  /** Kamer waar de KPN Box (veel) beter zou staan, als die er is. */
  betterModemRoomId?: string;
  /** Beste kamer voor een SuperWifi-punt. */
  bestExtenderRoomId?: string;
};

const quality = (score: number): Quality =>
  score >= coverageModel.good ? 'good' : score >= coverageModel.fair ? 'fair' : 'weak';

/** Aantal muren tussen twee punten: tel kamerwissels langs de lijn ertussen (plattegrond). */
const wallsBetween = (house: HousePreset, a: Point3, aFloor: number, b: Point3, bFloor: number) => {
  let walls = 0;
  let previous: string | undefined;
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const floor = t < 0.5 ? aFloor : bFloor;
    const room = roomAt(house, floor, a[0] + (b[0] - a[0]) * t, a[2] + (b[2] - a[2]) * t);
    if (!room) continue;
    if (previous && room.id !== previous) walls++;
    previous = room.id;
  }
  return walls;
};

const signal = (house: HousePreset, from: Point3, fromFloor: number, room: Room, base: number) => {
  const to = roomCenter(room);
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const walls = wallsBetween(house, from, fromFloor, to, room.floor);
  const floors = Math.abs(room.floor - fromFloor);
  const score =
    base - coverageModel.perMeter * distance - coverageModel.perWall * walls - coverageModel.perFloor * floors;
  return { score: Math.max(0, Math.min(100, Math.round(score))), walls, floors };
};

/** Dekking per kamer en per apparaat, met of zonder SuperWifi-punt. */
const measure = (house: HousePreset, placement: HomePlacement, hasExtender: boolean) => {
  const modemRoom = roomById(house, placement.modemRoomId);
  const modemAt = modemSpot(modemRoom);
  const extRoom = roomById(house, placement.extenderRoomId);
  const extAt = extenderSpot(extRoom);
  const extBase = Math.min(
    coverageModel.extenderMax,
    signal(house, modemAt, modemRoom.floor, extRoom, 100).score + coverageModel.extenderBonus,
  );

  const rooms: Record<string, Reading> = {};
  for (const room of house.rooms) {
    const fromModem = signal(house, modemAt, modemRoom.floor, room, 100);
    const fromExt = hasExtender ? signal(house, extAt, extRoom.floor, room, extBase) : undefined;
    const best = fromExt && fromExt.score > fromModem.score ? { ...fromExt, servedBy: 'extender' as const } : { ...fromModem, servedBy: 'modem' as const };
    rooms[room.id] = { ...best, quality: quality(best.score) };
  }

  const devices = Object.fromEntries(
    deviceOrder.map((id) => [id, { ...rooms[placement.deviceRooms[id]], roomId: placement.deviceRooms[id] }]),
  ) as Coverage['devices'];
  const weakestDevice = deviceOrder.reduce((a, b) => (devices[b].score < devices[a].score ? b : a));
  return { rooms, devices, weakestDevice };
};

/** Score van een opstelling: eerst het zwakste apparaat, daarna het gemiddelde. */
const rank = (devices: Coverage['devices']) => {
  const scores = deviceOrder.map((id) => devices[id].score);
  return Math.min(...scores) * 1000 + scores.reduce((a, b) => a + b, 0);
};

export function computeCoverage(house: HousePreset, placement: HomePlacement, hasExtender: boolean): Coverage {
  const current = measure(house, placement, hasExtender);
  const currentMin = current.devices[current.weakestDevice].score;

  // Advies: probeer elke kamer voor de KPN Box (zonder SuperWifi) en elke kamer voor een SuperWifi-punt.
  let betterModemRoomId: string | undefined;
  let bestModemRank = rank(measure(house, placement, false).devices);
  for (const room of house.rooms) {
    const option = measure(house, { ...placement, modemRoomId: room.id }, false);
    const optionMin = option.devices[option.weakestDevice].score;
    if (rank(option.devices) > bestModemRank && optionMin >= currentMin + 10) {
      bestModemRank = rank(option.devices);
      betterModemRoomId = room.id;
    }
  }

  let bestExtenderRoomId: string | undefined;
  let bestExtRank = -Infinity;
  for (const room of house.rooms) {
    if (room.id === placement.modemRoomId) continue;
    const option = measure(house, { ...placement, extenderRoomId: room.id }, true);
    if (rank(option.devices) > bestExtRank) {
      bestExtRank = rank(option.devices);
      bestExtenderRoomId = room.id;
    }
  }

  return { ...current, betterModemRoomId, bestExtenderRoomId };
}
