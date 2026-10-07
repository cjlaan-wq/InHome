import { defaultHouseId, getHouse, houses } from '../content';
import type { DeviceId, HouseId } from '../content/types';
import type { HomePlacement } from './homeGeometry';

// 'Jouw huis' blijft bewaard op dit apparaat (localStorage) en staat in de link,
// zodat bijvoorbeeld een servicemedewerker een link naar 'jouw huis' kan sturen.
// Er gaat niets naar een server.

export type HomeState = { houseId: HouseId; placement: HomePlacement; hasExtender: boolean };

const storageKey = 'kpn-netwerk-uitleg:home';
const params = { house: 'huis', modem: 'box', extender: 'superwifi', laptop: 'laptop', tv: 'tv', phone: 'telefoon' } as const;
const deviceParam: Record<DeviceId, string> = { laptop: params.laptop, tv: params.tv, phone: params.phone };

export const defaultHome = (houseId: HouseId = defaultHouseId): HomeState => {
  const house = getHouse(houseId);
  return {
    houseId: house.id,
    placement: { ...house.defaults, deviceRooms: { ...house.defaults.deviceRooms } },
    hasExtender: false,
  };
};

/** Neem alleen kamers over die in dit woningtype bestaan. */
const sanitize = (raw: Partial<{ houseId: string; modem: string; extender: string | null; devices: Partial<Record<DeviceId, string>> }>): HomeState | null => {
  const house = houses.find((h) => h.id === raw.houseId);
  if (!house) return null;
  const valid = (id?: string | null) => (id && house.rooms.some((room) => room.id === id) ? id : undefined);
  const base = defaultHome(house.id);
  return {
    houseId: house.id,
    hasExtender: Boolean(valid(raw.extender)),
    placement: {
      modemRoomId: valid(raw.modem) ?? base.placement.modemRoomId,
      extenderRoomId: valid(raw.extender) ?? base.placement.extenderRoomId,
      deviceRooms: {
        laptop: valid(raw.devices?.laptop) ?? base.placement.deviceRooms.laptop,
        tv: valid(raw.devices?.tv) ?? base.placement.deviceRooms.tv,
        phone: valid(raw.devices?.phone) ?? base.placement.deviceRooms.phone,
      },
    },
  };
};

const fromUrl = (): HomeState | null => {
  const search = new URLSearchParams(window.location.search);
  if (!search.has(params.house)) return null;
  return sanitize({
    houseId: search.get(params.house) ?? undefined,
    modem: search.get(params.modem) ?? undefined,
    extender: search.get(params.extender),
    devices: {
      laptop: search.get(params.laptop) ?? undefined,
      tv: search.get(params.tv) ?? undefined,
      phone: search.get(params.phone) ?? undefined,
    },
  });
};

const fromStorage = (): HomeState | null => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const saved = JSON.parse(raw) as HomeState;
    return sanitize({
      houseId: saved.houseId,
      modem: saved.placement?.modemRoomId,
      extender: saved.hasExtender ? saved.placement?.extenderRoomId : null,
      devices: saved.placement?.deviceRooms,
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
    if (home.hasExtender) url.searchParams.set(params.extender, home.placement.extenderRoomId);
    (Object.keys(deviceParam) as DeviceId[]).forEach((id) =>
      url.searchParams.set(deviceParam[id], home.placement.deviceRooms[id]),
    );
  }
  window.history.replaceState(null, '', url);
};
