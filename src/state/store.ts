import { create } from 'zustand';
import { getIssue, issueStepCount, issueStepFocus } from '../content';
import type { ConnectionType, DeviceId, HouseId, NodeId } from '../content/types';
import type { HomePlacement } from './homeGeometry';
import { defaultHome, loadHome } from './persistHome';

/** explore = verkennen, issue = probleemmodus, home = 'Jouw huis' inrichten. */
export type Mode = 'explore' | 'issue' | 'home';

/** Wat je in je huis kunt neerzetten. */
export type PlaceableId = 'modem' | 'extender' | DeviceId;

const initialHome = loadHome();

export type Hovered = { nodeId: NodeId; partId?: DeviceId };

type AppState = {
  mode: Mode;
  connectionType: ConnectionType;
  /** Heeft de klant een SuperWifi-punt? */
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
  resetHome: () => void;
  setDragging: (item: PlaceableId | null) => void;
  setVisibleFloor: (floor: number | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  mode: 'explore',
  connectionType: 'fiber',
  hasExtender: initialHome.hasExtender,
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
    // Zonder SuperWifi-punt valt de focus erop weg.
    set((s) => ({ hasExtender, focusNodeId: !hasExtender && s.focusNodeId === 'extender' ? null : s.focusNodeId })),
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
  // Ander woningtype: andere kamers, dus alles terug naar de standaardplekken van dat type.
  setHouse: (houseId) =>
    set((s) => ({ houseId, placement: defaultHome(houseId).placement, hasExtender: s.hasExtender, visibleFloor: null })),
  place: (item, roomId) =>
    set((s) => {
      const p = s.placement;
      if (item === 'modem') return p.modemRoomId === roomId ? {} : { placement: { ...p, modemRoomId: roomId } };
      if (item === 'extender')
        return p.extenderRoomId === roomId && s.hasExtender
          ? {}
          : { placement: { ...p, extenderRoomId: roomId }, hasExtender: true };
      if (p.deviceRooms[item] === roomId) return {};
      return { placement: { ...p, deviceRooms: { ...p.deviceRooms, [item]: roomId } } };
    }),
  resetHome: () => set({ ...defaultHome(), visibleFloor: null }),
  setDragging: (dragging) => set({ dragging }),
  setVisibleFloor: (visibleFloor) => set({ visibleFloor }),
}));
