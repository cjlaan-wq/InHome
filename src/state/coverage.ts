import type { DeviceId, HousePreset, Room } from '../content/types';
import {
  deviceOrder,
  extenderSpots,
  maxExtenders,
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
  extenderMax: 90,
  extenderBonus: 35,
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
  /** Welk SuperWifi-punt (index), als servedBy 'extender' is. */
  extenderIndex?: number;
  walls: number;
  floors: number;
};

export type Coverage = {
  rooms: Record<string, Reading>;
  devices: Record<DeviceId, Reading & { roomId: string }>;
  weakestDevice: DeviceId;
  /** Van welke bron elk SuperWifi-punt zijn signaal krijgt: -1 = KPN Box, anders index van een ander punt. */
  extenderFeeds: number[];
  /** Kamer waar de KPN Box (veel) beter zou staan, als die er is. */
  betterModemRoomId?: string;
  /** Beste kamer voor een (extra) SuperWifi-punt, als er nog een bij kan. */
  bestExtenderRoomId?: string;
};

const quality = (score: number): Quality =>
  score >= coverageModel.good ? 'good' : score >= coverageModel.fair ? 'fair' : 'weak';

/**
 * Aantal muren tussen twee punten: tel kamerwissels langs de lijn ertussen (plattegrond).
 * De overgang naar een andere verdieping telt als vloer, niet ook nog als muur.
 */
const wallsBetween = (house: HousePreset, a: Point3, aFloor: number, b: Point3, bFloor: number) => {
  let walls = 0;
  let previous: string | undefined;
  let previousFloor = aFloor;
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const floor = t < 0.5 ? aFloor : bFloor;
    if (floor !== previousFloor) previous = undefined;
    previousFloor = floor;
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

type Emitter = { at: Point3; floor: number; base: number; source: Source; extenderIndex?: number };

/**
 * Dekking per kamer en per apparaat. SuperWifi-punten werken als mesh: elk punt krijgt zijn
 * signaal van de beste bron die er al is (KPN Box of een ander punt); het best ontvangen punt eerst.
 */
const measure = (house: HousePreset, placement: HomePlacement) => {
  const modemRoom = roomById(house, placement.modemRoomId);
  const emitters: Emitter[] = [{ at: modemSpot(modemRoom), floor: modemRoom.floor, base: 100, source: 'modem' }];
  const spots = extenderSpots(house, placement);
  const pending = placement.extenderRoomIds.map((roomId, index) => ({ room: roomById(house, roomId), index }));
  const extenderFeeds: number[] = placement.extenderRoomIds.map(() => -1);

  while (pending.length > 0) {
    // Welk nog niet aangesloten punt ontvangt het sterkst, en van wie?
    let best = { pendingIndex: 0, score: -1, feed: -1 };
    pending.forEach((ext, pendingIndex) => {
      emitters.forEach((emitter) => {
        const { score } = signal(house, emitter.at, emitter.floor, ext.room, emitter.base);
        if (score > best.score) best = { pendingIndex, score, feed: emitter.extenderIndex ?? -1 };
      });
    });
    const [ext] = pending.splice(best.pendingIndex, 1);
    extenderFeeds[ext.index] = best.feed;
    emitters.push({
      at: spots[ext.index],
      floor: ext.room.floor,
      base: Math.min(coverageModel.extenderMax, best.score + coverageModel.extenderBonus),
      source: 'extender',
      extenderIndex: ext.index,
    });
  }

  const rooms: Record<string, Reading> = {};
  for (const room of house.rooms) {
    let reading: Reading | undefined;
    for (const emitter of emitters) {
      const s = signal(house, emitter.at, emitter.floor, room, emitter.base);
      if (!reading || s.score > reading.score)
        reading = { ...s, quality: quality(s.score), servedBy: emitter.source, extenderIndex: emitter.extenderIndex };
    }
    rooms[room.id] = reading!;
  }

  const devices = Object.fromEntries(
    deviceOrder.map((id) => [id, { ...rooms[placement.deviceRooms[id]], roomId: placement.deviceRooms[id] }]),
  ) as Coverage['devices'];
  const weakestDevice = deviceOrder.reduce((a, b) => (devices[b].score < devices[a].score ? b : a));
  return { rooms, devices, weakestDevice, extenderFeeds };
};

/** Score van een opstelling: eerst het zwakste apparaat, daarna het gemiddelde. */
const rank = (devices: Coverage['devices']) => {
  const scores = deviceOrder.map((id) => devices[id].score);
  return Math.min(...scores) * 1000 + scores.reduce((a, b) => a + b, 0);
};

export function computeCoverage(house: HousePreset, placement: HomePlacement): Coverage {
  const current = measure(house, placement);
  const currentMin = current.devices[current.weakestDevice].score;

  // Advies 1: zou de KPN Box ergens anders (zonder SuperWifi) duidelijk beter staan?
  const withoutExtenders = { ...placement, extenderRoomIds: [] };
  let betterModemRoomId: string | undefined;
  let bestModemRank = rank(measure(house, withoutExtenders).devices);
  for (const room of house.rooms) {
    const option = measure(house, { ...withoutExtenders, modemRoomId: room.id });
    const optionMin = option.devices[option.weakestDevice].score;
    if (rank(option.devices) > bestModemRank && optionMin >= currentMin + 10) {
      bestModemRank = rank(option.devices);
      betterModemRoomId = room.id;
    }
  }

  // Advies 2: waar helpt een (extra) SuperWifi-punt het meest, bovenop wat er al staat?
  let bestExtenderRoomId: string | undefined;
  if (placement.extenderRoomIds.length < maxExtenders) {
    let bestExtRank = rank(current.devices);
    for (const room of house.rooms) {
      if (room.id === placement.modemRoomId || placement.extenderRoomIds.includes(room.id)) continue;
      const option = measure(house, { ...placement, extenderRoomIds: [...placement.extenderRoomIds, room.id] });
      if (rank(option.devices) > bestExtRank) {
        bestExtRank = rank(option.devices);
        bestExtenderRoomId = room.id;
      }
    }
  }

  return { ...current, betterModemRoomId, bestExtenderRoomId };
}
