// Contenttypes voor de netwerkuitleg.
// Code en identifiers zijn Engels; alle teksten voor de gebruiker zijn Nederlands.

export type ConnectionType = 'fiber' | 'dsl';

export type NodeId =
  | 'kpn-core'
  | 'backbone'
  | 'street-cabinet'
  | 'house-connection'
  | 'modem'
  | 'wifi'
  | 'extender'
  | 'devices';

/** Losse apparaten binnen het onderdeel 'devices'. */
export type DeviceId = 'laptop' | 'phone' | 'tv';

export type DevicePart = {
  id: DeviceId;
  label: string;
};

/** Soort kamer: bepaalt het meubilair in de scène. */
export type RoomKind = 'hall' | 'landing' | 'living' | 'kitchen' | 'bedroom' | 'office' | 'attic';

/**
 * Kamer als rechthoek op een verdieping, in scène-eenheden (≈ meters).
 * x loopt van links (0) naar rechts, z van achter (-depth/2) naar voren.
 */
export type Room = {
  id: string;
  /** Naam zoals de klant hem gebruikt, bijv. 'Woonkamer'. */
  label: string;
  /** Hoe je zegt dat iets er staat. Standaard 'in de {label}', bijv. 'op zolder'. */
  inPhrase?: string;
  kind: RoomKind;
  floor: number;
  x: number;
  z: number;
  width: number;
  depth: number;
};

export type HouseId = 'apartment' | 'terraced' | 'detached';

/** Trap van een verdieping naar de volgende: loopt van voren (zFrom) omhoog naar achteren (zTo). */
export type Stairs = { floor: number; x: number; width: number; zFrom: number; zTo: number };

export type HousePreset = {
  id: HouseId;
  label: string;
  description: string;
  width: number;
  depth: number;
  rooms: Room[];
  stairs: Stairs[];
  /** Kamer met de meterkast: hier komt de kabel binnen. Moet tegen de achtermuur liggen. */
  meterRoomId: string;
  /** Waar alles staat als de klant nog niets heeft gekozen. */
  defaults: {
    modemRoomId: string;
    /** Standaardkamer voor het eerste SuperWifi-punt dat de klant toevoegt. */
    extenderRoomId: string;
    deviceRooms: Record<DeviceId, string>;
  };
};

export type NetworkNode = {
  id: NodeId;
  label: string; // kort label in de scène
  title: string; // kop in het paneel
  description: string; // uitleg in eenvoudige taal over wat dit onderdeel doet
  /** Eén korte zin voor de tooltip in de scène. */
  summary: string;
  connectionTypes: ConnectionType[];
  /** Subonderdelen, alleen voor 'devices'. */
  parts?: DevicePart[];
  /** Optioneel onderdeel dat de klant wel of niet heeft (bijv. SuperWifi). */
  optional?: boolean;
  /** Optionele teksten die per verbindingstype afwijken (bijv. FTU vs. wandcontactdoos). */
  variants?: Partial<Record<ConnectionType, Partial<Pick<NetworkNode, 'label' | 'title' | 'description' | 'summary'>>>>;
};

export type NetworkLink = {
  id: string; // bijv. 'street-cabinet__house-connection'
  from: NodeId;
  to: NodeId;
  connectionTypes: ConnectionType[];
};

export type IssueStep = {
  focusNodeId: NodeId; // waar de camera naartoe gaat
  title: string;
  body: string; // eenvoudige taal, max. ~3 korte zinnen
};

export type Fix = {
  title: string;
  steps: string[];
  cta?: { label: string; href: string };
  /** Laat de oplossing live zien in de scène (bijv. een SuperWifi-punt neerzetten). */
  demo?: 'extender';
};

export type VisualEffect = 'blocked' | 'slow' | 'weak-signal' | 'device-only';

export type Issue = {
  id: string;
  title: string; // zoals de klant het zelf zou omschrijven
  symptom: string; // herkenbaar symptoom in één zin
  connectionTypes: ConnectionType[];
  affectedNodes: NodeId[];
  /** Alleen deze apparaten zijn betrokken (bij 'devices' in affectedNodes). Leeg/ontbreekt = alle. */
  affectedParts?: DeviceId[];
  /** Bepaal het betrokken apparaat uit het eigen huis: het apparaat met de zwakste wifi. */
  affectedPartsFrom?: 'weakest-wifi';
  affectedLinks: string[];
  visualEffect: VisualEffect;
  steps: IssueStep[];
  /** Waar de camera naartoe gaat bij de oplossingen. Standaard: het onderdeel van de laatste stap. */
  fixesFocusNodeId?: NodeId;
  fixes: Fix[];
  escalation: { label: string; href: string };
  /** Concepttekst die nog door KPN Service gevalideerd moet worden. */
  draft?: boolean;
};

/** Helper om een link-id consistent op te bouwen. */
export const linkId = (from: NodeId, to: NodeId) => `${from}__${to}`;
