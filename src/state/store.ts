import { create } from 'zustand';
import { getHouse, getIssue, issueStepCount, issueStepFocus } from '../content';
import type { ConnectionType, DeviceId, HouseId, NodeId } from '../content/types';
import { maxExtenders, type HomePlacement } from './homeGeometry';
import { defaultHome, defaultPlacement, loadHome } from './persistHome';

/** explore = verkennen, issue = probleemmodus, home = 'Jouw huis' inrichten. */
export type Mode = 'explore' | 'issue' | 'home';

/** Wat je in je huis kunt neerzetten. SuperWifi-punten per nummer: 'extender-0', 'extender-1', … */
export type PlaceableId = 'modem' | DeviceId | `extender-${number}`;

export const extenderItem = (index: number): PlaceableId => `extender-${index}`;
const extenderIndex = (item: PlaceableId) => (item.startsWith('extender-') ? Number(item.slice(9)) : -1);

const initialHome = loadHome();

export type Hovered = { nodeId: NodeId; partId?: DeviceId };

type AppState = {
  mode: Mode;
  connectionType: ConnectionType;
  /** Heeft de klant een of meer SuperWifi-punten? (Afgeleid van placement.extenderRoomIds.) */
  hasExtender: boolean;
  /** Onderdeel waar de camera op gericht is (null = overzicht). */
  focusNodeId: NodeId | null;
  selectedIssueId: string | null;
  activeStep: number;
  /** Onderdeel waar de muis/vinger nu boven is (voor de tooltip). */
  hovered: Hovered | null;
  /** Jouw huis: woningtype en in welke kamer alles staat. */
  houseId: HouseId;
  placement: HomePlacement;
  /** Wat er nu in 3D versleept wordt. */
  dragging: PlaceableId | null;
  /** Verdiepingen hierboven zijn verborgen, om in de kamers eronder te kijken (null = alles). */
  visibleFloor: number | null;

  setConnectionType: (type: ConnectionType) => void;
  setHasExtender: (value: boolean) => void;
  focusNode: (id: NodeId | null) => void;
  setHovered: (hovered: Hovered | null) => void;
  selectIssue: (id: string) => void;
  setStep: (index: number) => void;
  backToExplore: () => void;
  openHome: () => void;
  setHouse: (id: HouseId) => void;
  place: (item: PlaceableId, roomId: string) => void;
  /** Extra SuperWifi-punt neerzetten (standaard in de voorgestelde kamer). */
  addExtender: (roomId?: string) => void;
  removeExtender: (index: number) => void;
  resetHome: () => void;
  setDragging: (item: PlaceableId | null) => void;
  setVisibleFloor: (floor: number | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  mode: 'explore',
  connectionType: 'fiber',
  hasExtender: initialHome.placement.extenderRoomIds.length > 0,
  focusNodeId: null,
  selectedIssueId: null,
  activeStep: 0,
  hovered: null,
  houseId: initialHome.houseId,
  placement: initialHome.placement,
  dragging: null,
  visibleFloor: null,

  setConnectionType: (connectionType) =>
    set((s) => {
      // Geldt het gekozen probleem niet voor dit verbindingstype? Dan terug naar verkennen.
      const issue = getIssue(s.selectedIssueId);
      if (s.mode === 'issue' && issue?.connectionTypes.includes(connectionType)) return { connectionType };
      return { connectionType, mode: 'explore', selectedIssueId: null, activeStep: 0 };
    }),
  setHasExtender: (hasExtender) =>
    set((s) => {
      const extenderRoomIds = hasExtender
        ? s.placement.extenderRoomIds.length
          ? s.placement.extenderRoomIds
          : [getHouse(s.houseId).defaults.extenderRoomId]
        : [];
      return {
        placement: { ...s.placement, extenderRoomIds },
        hasExtender,
        // Zonder SuperWifi-punt valt de focus erop weg.
        focusNodeId: !hasExtender && s.focusNodeId === 'extender' ? null : s.focusNodeId,
      };
    }),
  focusNode: (focusNodeId) => set({ focusNodeId }),
  setHovered: (hovered) => set({ hovered }),
  selectIssue: (selectedIssueId) => {
    const issue = getIssue(selectedIssueId);
    if (!issue) return;
    set({ mode: 'issue', selectedIssueId, activeStep: 0, focusNodeId: issueStepFocus(issue, 0), hovered: null });
  },
  setStep: (step) =>
    set((s) => {
      const issue = getIssue(s.selectedIssueId);
      if (!issue) return {};
      const activeStep = Math.max(0, Math.min(issueStepCount(issue) - 1, step));
      return { activeStep, focusNodeId: issueStepFocus(issue, activeStep) };
    }),
  backToExplore: () =>
    set({ mode: 'explore', selectedIssueId: null, activeStep: 0, focusNodeId: null, dragging: null, visibleFloor: null }),
  openHome: () => set({ mode: 'home', selectedIssueId: null, activeStep: 0, focusNodeId: null, hovered: null }),
  // Ander woningtype: andere kamers. Had je SuperWifi, dan krijg je er één op de standaardplek.
  setHouse: (houseId) =>
    set((s) => {
      const placement = defaultPlacement(houseId);
      if (s.hasExtender) placement.extenderRoomIds = [getHouse(houseId).defaults.extenderRoomId];
      return { houseId, placement, visibleFloor: null };
    }),
  place: (item, roomId) =>
    set((s) => {
      const p = s.placement;
      if (item === 'modem') return p.modemRoomId === roomId ? {} : { placement: { ...p, modemRoomId: roomId } };
      const index = extenderIndex(item);
      if (index >= 0) {
        if (p.extenderRoomIds[index] === roomId) return {};
        const extenderRoomIds = [...p.extenderRoomIds];
        extenderRoomIds[index] = roomId;
        return { placement: { ...p, extenderRoomIds }, hasExtender: true };
      }
      const device = item as DeviceId;
      if (p.deviceRooms[device] === roomId) return {};
      return { placement: { ...p, deviceRooms: { ...p.deviceRooms, [device]: roomId } } };
    }),
  addExtender: (roomId) =>
    set((s) => {
      const ids = s.placement.extenderRoomIds;
      if (ids.length >= maxExtenders) return {};
      const room = roomId ?? getHouse(s.houseId).defaults.extenderRoomId;
      return { placement: { ...s.placement, extenderRoomIds: [...ids, room] }, hasExtender: true };
    }),
  removeExtender: (index) =>
    set((s) => {
      const extenderRoomIds = s.placement.extenderRoomIds.filter((_, i) => i !== index);
      return {
        placement: { ...s.placement, extenderRoomIds },
        hasExtender: extenderRoomIds.length > 0,
        dragging: null,
        focusNodeId: extenderRoomIds.length === 0 && s.focusNodeId === 'extender' ? null : s.focusNodeId,
      };
    }),
  resetHome: () => set({ ...defaultHome(), hasExtender: false, visibleFloor: null }),
  setDragging: (dragging) => set({ dragging }),
  setVisibleFloor: (visibleFloor) => set({ visibleFloor }),
}));
