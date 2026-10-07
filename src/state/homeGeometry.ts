import type { DeviceId, HousePreset, Room } from '../content/types';

// Pure geometrie van het eigen huis (geen three.js): waar staat wat, in scène-eenheden.
// Gebruikt door de 3D-scène, het dekkingsmodel en het paneel.

export type Point3 = [number, number, number];

export const floorHeight = 2.6;
export const slab = 0.15;
export const floorPitch = floorHeight + slab;

/** Bovenkant van de vloer van een verdieping. */
export const floorTop = (floor: number) => 0.05 + floor * floorPitch;

export const deviceOrder: DeviceId[] = ['laptop', 'tv', 'phone'];

/** Welke plek in de kamer een item krijgt (fracties van breedte/diepte), vóór in de kamer. */
const deviceSlots: [number, number][] = [
  [0.3, 0.64],
  [0.68, 0.8],
  [0.36, 0.88],
];

export type HomePlacement = {
  modemRoomId: string;
  extenderRoomId: string;
  deviceRooms: Record<DeviceId, string>;
};

export const roomById = (house: HousePreset, id: string): Room =>
  house.rooms.find((room) => room.id === id) ?? house.rooms[0];

export const roomCenter = (room: Room): Point3 => [
  room.x + room.width / 2,
  floorTop(room.floor) + 1,
  room.z + room.depth / 2,
];

/** Kamer op een verdieping waar punt (x, z) in ligt. */
export const roomAt = (house: HousePreset, floor: number, x: number, z: number) =>
  house.rooms.find(
    (room) => room.floor === floor && x >= room.x && x <= room.x + room.width && z >= room.z && z <= room.z + room.depth,
  );

/** Hoogte van het kastje waar de KPN Box en het SuperWifi-punt op staan. */
export const standHeight = 0.8;

/** KPN Box: achterin links in de kamer, op een kastje. */
export const modemSpot = (room: Room): Point3 => [room.x + 0.85, floorTop(room.floor) + standHeight + 0.27, room.z + 0.45];

/** SuperWifi-punt: links in de kamer, vóór de plek van de KPN Box (zodat ze nooit botsen). */
export const extenderSpot = (room: Room): Point3 => [
  room.x + 0.45,
  floorTop(room.floor) + standHeight + 0.19,
  room.z + Math.min(room.depth - 0.4, 1.3),
];

/** Glasvezelkastje/wandcontactdoos: tegen de achtermuur van de meterkast-kamer. */
export const connectionSpot = (house: HousePreset): Point3 => {
  const room = roomById(house, house.meterRoomId);
  return [room.x + 0.32, floorTop(room.floor) + 0.85, -house.depth / 2 + 0.22];
};

/** Ligt dit punt onder een hogere verdieping? Dan kijkt de camera er van voren (lager) naar. */
export const isCovered = (house: HousePreset, floor: number, x: number, z: number) =>
  house.rooms.some(
    (room) => room.floor > floor && x >= room.x && x <= room.x + room.width && z >= room.z && z <= room.z + room.depth,
  );

/** Hoogte van het meubel waar een apparaat op staat/hangt, boven de vloer. */
export const deviceBaseHeight: Record<DeviceId, number> = { laptop: 0.75, tv: 0.5, phone: 0.5 };
/** Hoeveel hoger dan het meubel het midden van het apparaat zit. */
export const deviceLift: Record<DeviceId, number> = { laptop: 0.03, tv: 0.45, phone: 0.02 };

/** Plekken van alle apparaten: per kamer krijgen apparaten om de beurt een vrije plek. */
export const deviceSpots = (house: HousePreset, placement: HomePlacement): Record<DeviceId, Point3> => {
  const used = new Map<string, number>();
  const spots = {} as Record<DeviceId, Point3>;
  for (const id of deviceOrder) {
    const room = roomById(house, placement.deviceRooms[id]);
    const slot = used.get(room.id) ?? 0;
    used.set(room.id, slot + 1);
    const [fx, fz] = deviceSlots[slot % deviceSlots.length];
    spots[id] = [
      room.x + room.width * fx,
      floorTop(room.floor) + deviceBaseHeight[id] + deviceLift[id],
      room.z + room.depth * fz,
    ];
  }
  return spots;
};

/** Ruwe afmeting van het huis, voor de camera. */
export const houseSize = (house: HousePreset) => {
  const floors = Math.max(...house.rooms.map((room) => room.floor)) + 1;
  return { width: house.width, depth: house.depth, height: floors * floorPitch, floors };
};
