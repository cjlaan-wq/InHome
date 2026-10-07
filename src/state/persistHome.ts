import { defaultHouseId, getHouse, houses } from '../content';
import type { DeviceId, HouseId, WallType } from '../content/types';
import { maxExtenders, type HomePlacement } from './homeGeometry';

// 'Jouw huis' blijft bewaard op dit apparaat (localStorage) en staat in de link,
// zodat bijvoorbeeld een servicemedewerker een link naar 'jouw huis' kan sturen.
// Er gaat niets naar een server.

export type HomeState = { houseId: HouseId; placement: HomePlacement };

const storageKey = 'kpn-netwerk-uitleg:home';
const params = {
  house: 'huis',
  modem: 'box',
  extenders: 'superwifi',
  wiredExtenders: 'superwifikabel',
  wired: 'kabel',
  walls: 'muren',
  laptop: 'laptop',
  tv: 'tv',
  phone: 'telefoon',
  camera: 'camera',
} as const;
const deviceParam: Record<DeviceId, string> = { laptop: params.laptop, tv: params.tv, phone: params.phone, camera: params.camera };
const devices = Object.keys(deviceParam) as DeviceId[];
/** In de link: Nederlandse woorden voor het muurtype. */
const wallParam: Record<WallType, string> = { light: 'licht', brick: 'baksteen', concrete: 'beton' };

export const defaultPlacement = (houseId: HouseId): HomePlacement => {
  const { defaults } = getHouse(houseId);
  return {
    modemRoomId: defaults.modemRoomId,
    extenderRoomIds: [],
    wiredExtenders: [],
    deviceRooms: { ...defaults.deviceRooms },
    wiredDevices: [],
    wallType: 'brick',
  };
};

export const defaultHome = (houseId: HouseId = defaultHouseId): HomeState => ({
  houseId: getHouse(houseId).id,
  placement: defaultPlacement(houseId),
});

type Raw = Partial<{
  houseId: string;
  modem: string;
  extenders: string[];
  wiredExtenders: boolean[];
  devices: Partial<Record<DeviceId, string>>;
  wired: string[];
  wallType: string;
}>;

/** Neem alleen kamers over die in dit woningtype bestaan. */
const sanitize = (raw: Raw): HomeState | null => {
  const house = houses.find((h) => h.id === raw.houseId);
  if (!house) return null;
  const valid = (id?: string | null) => (id && house.rooms.some((room) => room.id === id) ? id : undefined);
  const base = defaultPlacement(house.id);
  const extenders = (raw.extenders ?? []).map((id, i) => ({ id, wired: raw.wiredExtenders?.[i] ?? false }));
  const keptExtenders = extenders.filter((ext) => valid(ext.id)).slice(0, maxExtenders);
  const wallType = (['light', 'brick', 'concrete'] as WallType[]).includes(raw.wallType as WallType)
    ? (raw.wallType as WallType)
    : base.wallType;
  return {
    houseId: house.id,
    placement: {
      modemRoomId: valid(raw.modem) ?? base.modemRoomId,
      extenderRoomIds: keptExtenders.map((ext) => ext.id),
      wiredExtenders: keptExtenders.map((ext) => ext.wired),
      deviceRooms: Object.fromEntries(
        devices.map((id) => [id, valid(raw.devices?.[id]) ?? base.deviceRooms[id]]),
      ) as Record<DeviceId, string>,
      wiredDevices: devices.filter((id) => raw.wired?.includes(id)),
      wallType,
    },
  };
};

const fromUrl = (): HomeState | null => {
  const search = new URLSearchParams(window.location.search);
  if (!search.has(params.house)) return null;
  return sanitize({
    houseId: search.get(params.house) ?? undefined,
    modem: search.get(params.modem) ?? undefined,
    extenders: search.get(params.extenders)?.split(',').filter(Boolean),
    wiredExtenders: search.get(params.wiredExtenders)?.split(',').map((v) => v === '1'),
    devices: Object.fromEntries(devices.map((id) => [id, search.get(deviceParam[id]) ?? undefined])),
    wired: search.get(params.wired)?.split(','),
    wallType: (Object.keys(wallParam) as WallType[]).find((key) => wallParam[key] === search.get(params.walls)),
  });
};

type Saved = HomeState & {
  // Oudere opslag (één SuperWifi-punt): nog steeds leesbaar.
  hasExtender?: boolean;
  placement: HomePlacement & { extenderRoomId?: string };
};

const fromStorage = (): HomeState | null => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    const legacy = saved.hasExtender && saved.placement?.extenderRoomId ? [saved.placement.extenderRoomId] : [];
    return sanitize({
      houseId: saved.houseId,
      modem: saved.placement?.modemRoomId,
      extenders: saved.placement?.extenderRoomIds ?? legacy,
      wiredExtenders: saved.placement?.wiredExtenders,
      devices: saved.placement?.deviceRooms,
      wired: saved.placement?.wiredDevices,
      wallType: saved.placement?.wallType,
    });
  } catch {
    return null;
  }
};

/** Begintoestand: eerst de link, dan wat op dit apparaat bewaard is, anders het voorbeeldhuis. */
export const loadHome = (): HomeState => fromUrl() ?? fromStorage() ?? defaultHome();

const isDefault = (home: HomeState) => JSON.stringify(home) === JSON.stringify(defaultHome());

/** Bewaar op dit apparaat en zet het huis in de link (alleen als het afwijkt van het voorbeeldhuis). */
export const saveHome = (home: HomeState) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(home));
  } catch {
    // Opslag niet beschikbaar (privévenster): de link werkt nog steeds.
  }
  const url = new URL(window.location.href);
  Object.values(params).forEach((key) => url.searchParams.delete(key));
  if (!isDefault(home)) {
    url.searchParams.set(params.house, home.houseId);
    url.searchParams.set(params.modem, home.placement.modemRoomId);
    const p = home.placement;
    if (p.extenderRoomIds.length) {
      url.searchParams.set(params.extenders, p.extenderRoomIds.join(','));
      if (p.wiredExtenders.some(Boolean))
        url.searchParams.set(params.wiredExtenders, p.wiredExtenders.map((w) => (w ? '1' : '0')).join(','));
    }
    devices.forEach((id) => url.searchParams.set(deviceParam[id], p.deviceRooms[id]));
    if (p.wiredDevices.length) url.searchParams.set(params.wired, p.wiredDevices.join(','));
    if (p.wallType !== 'brick') url.searchParams.set(params.walls, wallParam[p.wallType]);
  }
  window.history.replaceState(null, '', url);
};
