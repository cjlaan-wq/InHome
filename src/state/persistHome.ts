import { defaultHouseId, getHouse, houses } from '../content';
import type { DeviceId, HouseId } from '../content/types';
import { maxExtenders, type HomePlacement } from './homeGeometry';

// 'Jouw huis' blijft bewaard op dit apparaat (localStorage) en staat in de link,
// zodat bijvoorbeeld een servicemedewerker een link naar 'jouw huis' kan sturen.
// Er gaat niets naar een server.

export type HomeState = { houseId: HouseId; placement: HomePlacement };

const storageKey = 'kpn-netwerk-uitleg:home';
const params = { house: 'huis', modem: 'box', extenders: 'superwifi', laptop: 'laptop', tv: 'tv', phone: 'telefoon' } as const;
const deviceParam: Record<DeviceId, string> = { laptop: params.laptop, tv: params.tv, phone: params.phone };

export const defaultPlacement = (houseId: HouseId): HomePlacement => {
  const { defaults } = getHouse(houseId);
  return { modemRoomId: defaults.modemRoomId, extenderRoomIds: [], deviceRooms: { ...defaults.deviceRooms } };
};

export const defaultHome = (houseId: HouseId = defaultHouseId): HomeState => ({
  houseId: getHouse(houseId).id,
  placement: defaultPlacement(houseId),
});

type Raw = Partial<{ houseId: string; modem: string; extenders: string[]; devices: Partial<Record<DeviceId, string>> }>;

/** Neem alleen kamers over die in dit woningtype bestaan. */
const sanitize = (raw: Raw): HomeState | null => {
  const house = houses.find((h) => h.id === raw.houseId);
  if (!house) return null;
  const valid = (id?: string | null) => (id && house.rooms.some((room) => room.id === id) ? id : undefined);
  const base = defaultPlacement(house.id);
  return {
    houseId: house.id,
    placement: {
      modemRoomId: valid(raw.modem) ?? base.modemRoomId,
      extenderRoomIds: (raw.extenders ?? []).filter((id) => valid(id)).slice(0, maxExtenders),
      deviceRooms: {
        laptop: valid(raw.devices?.laptop) ?? base.deviceRooms.laptop,
        tv: valid(raw.devices?.tv) ?? base.deviceRooms.tv,
        phone: valid(raw.devices?.phone) ?? base.deviceRooms.phone,
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
    extenders: search.get(params.extenders)?.split(',').filter(Boolean),
    devices: {
      laptop: search.get(params.laptop) ?? undefined,
      tv: search.get(params.tv) ?? undefined,
      phone: search.get(params.phone) ?? undefined,
    },
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
    if (home.placement.extenderRoomIds.length)
      url.searchParams.set(params.extenders, home.placement.extenderRoomIds.join(','));
    (Object.keys(deviceParam) as DeviceId[]).forEach((id) =>
      url.searchParams.set(deviceParam[id], home.placement.deviceRooms[id]),
    );
  }
  window.history.replaceState(null, '', url);
};
