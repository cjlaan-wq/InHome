import type { DeviceId, HousePreset, Room, WallType } from '../content/types';
import {
  deviceOrder,
  extenderSpots,
  isOutside,
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
  /** De voorgevel (naar tuin of balkon) houdt meer tegen dan een binnenmuur. */
  perOuterWall: 18,
  perFloor: 30,
  /** Muren en vloeren van beton houden veel meer tegen dan hout of gips. */
  wallFactor: { light: 0.6, brick: 1, concrete: 1.6 } satisfies Record<WallType, number>,
  floorFactor: { light: 0.75, brick: 1, concrete: 1.25 } satisfies Record<WallType, number>,
  /** Een SuperWifi-punt zendt nooit sterker uit dan dit, en ook niet sterker dan wat het zelf ontvangt + bonus. */
  extenderMax: 90,
  extenderBonus: 35,
  /** Grenzen tussen goed / redelijk / zwak. */
  good: 60,
  fair: 35,
} as const;

export type Quality = 'good' | 'fair' | 'weak';
/** Waar het signaal vandaan komt; 'cable' = met een netwerkkabel aan de KPN Box. */
export type Source = 'modem' | 'extender' | 'cable';

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
  /** Van welke bron elk SuperWifi-punt zijn signaal krijgt: -1 = KPN Box (wifi), -2 = kabel, anders index van een ander punt. */
  extenderFeeds: number[];
  /** Kamer waar de KPN Box (veel) beter zou staan, als die er is. */
  betterModemRoomId?: string;
  /** Beste kamer voor een (extra) SuperWifi-punt, als er nog een bij kan. */
  bestExtenderRoomId?: string;
};

const quality = (score: number): Quality =>
  score >= coverageModel.good ? 'good' : score >= coverageModel.fair ? 'fair' : 'weak';

/**
 * Muren tussen twee punten: tel kamerwissels langs de lijn ertussen (plattegrond).
 * Een wissel van of naar tuin/balkon is de voorgevel. De overgang naar een andere
 * verdieping telt als vloer, niet ook nog als muur.
 */
const wallsBetween = (house: HousePreset, a: Point3, aFloor: number, b: Point3, bFloor: number) => {
  let inner = 0;
  let outer = 0;
  let previous: Room | undefined;
  let previousFloor = aFloor;
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const floor = t < 0.5 ? aFloor : bFloor;
    if (floor !== previousFloor) previous = undefined;
    previousFloor = floor;
    const room = roomAt(house, floor, a[0] + (b[0] - a[0]) * t, a[2] + (b[2] - a[2]) * t);
    if (!room) continue;
    if (previous && room.id !== previous.id) {
      if (isOutside(room) !== isOutside(previous)) outer++;
      else inner++;
    }
    previous = room;
  }
  return { inner, outer };
};

const signal = (house: HousePreset, wallType: WallType, from: Point3, fromFloor: number, room: Room, base: number) => {
  const to = roomCenter(room);
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const { inner, outer } = wallsBetween(house, from, fromFloor, to, room.floor);
  const floors = Math.abs(room.floor - fromFloor);
  const m = coverageModel;
  const score =
    base -
    m.perMeter * distance -
    m.wallFactor[wallType] * (m.perWall * inner + m.perOuterWall * outer) -
    m.floorFactor[wallType] * m.perFloor * floors;
  return { score: Math.max(0, Math.min(100, Math.round(score))), walls: inner + outer, floors };
};

type Emitter = { at: Point3; floor: number; base: number; source: Source; extenderIndex?: number };

const cableReading: Reading = { score: 100, quality: 'good', servedBy: 'cable', walls: 0, floors: 0 };

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
  const wall = placement.wallType;

  // SuperWifi-punten met een kabel: vol signaal, ongeacht muren en vloeren.
  for (let p = pending.length - 1; p >= 0; p--) {
    const ext = pending[p];
    if (!placement.wiredExtenders[ext.index]) continue;
    pending.splice(p, 1);
    extenderFeeds[ext.index] = -2;
    emitters.push({ at: spots[ext.index], floor: ext.room.floor, base: coverageModel.extenderMax, source: 'extender', extenderIndex: ext.index });
  }

  while (pending.length > 0) {
    // Welk nog niet aangesloten punt ontvangt het sterkst, en van wie?
    let best = { pendingIndex: 0, score: -1, feed: -1 };
    pending.forEach((ext, pendingIndex) => {
      emitters.forEach((emitter) => {
        const { score } = signal(house, wall, emitter.at, emitter.floor, ext.room, emitter.base);
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
      const s = signal(house, wall, emitter.at, emitter.floor, room, emitter.base);
      if (!reading || s.score > reading.score)
        reading = { ...s, quality: quality(s.score), servedBy: emitter.source, extenderIndex: emitter.extenderIndex };
    }
    rooms[room.id] = reading!;
  }

  // Apparaten met een netwerkkabel: altijd goed, de wifi in die kamer doet er niet toe.
  const devices = Object.fromEntries(
    deviceOrder.map((id) => {
      const roomId = placement.deviceRooms[id];
      return [id, { ...(placement.wiredDevices.includes(id) ? cableReading : rooms[roomId]), roomId }];
    }),
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
  const withoutExtenders = { ...placement, extenderRoomIds: [], wiredExtenders: [] };
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
      const option = measure(house, {
        ...placement,
        extenderRoomIds: [...placement.extenderRoomIds, room.id],
        wiredExtenders: [...placement.wiredExtenders, false],
      });
      if (rank(option.devices) > bestExtRank) {
        bestExtRank = rank(option.devices);
        bestExtenderRoomId = room.id;
      }
    }
  }

  return { ...current, betterModemRoomId, bestExtenderRoomId };
}
