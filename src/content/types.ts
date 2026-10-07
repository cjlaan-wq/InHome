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
  /** Kamer waar het apparaat staat, voor uitleg over bereik. */
  room: string;
};

export type NetworkNode = {
  id: NodeId;
  label: string; // kort label in de scène
  title: string; // kop in het paneel
  description: string; // uitleg in eenvoudige taal over wat dit onderdeel doet
  connectionTypes: ConnectionType[];
  /** Subonderdelen, alleen voor 'devices'. */
  parts?: DevicePart[];
  /** Optioneel onderdeel dat de klant wel of niet heeft (bijv. SuperWifi). */
  optional?: boolean;
  /** Optionele teksten die per verbindingstype afwijken (bijv. FTU vs. wandcontactdoos). */
  variants?: Partial<Record<ConnectionType, Partial<Pick<NetworkNode, 'label' | 'title' | 'description'>>>>;
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
};

export type VisualEffect = 'blocked' | 'slow' | 'weak-signal' | 'device-only';

export type Issue = {
  id: string;
  title: string; // zoals de klant het zelf zou omschrijven
  symptom: string; // herkenbaar symptoom in één zin
  connectionTypes: ConnectionType[];
  affectedNodes: NodeId[];
  affectedLinks: string[];
  visualEffect: VisualEffect;
  steps: IssueStep[];
  fixes: Fix[];
  escalation: { label: string; href: string };
};

/** Helper om een link-id consistent op te bouwen. */
export const linkId = (from: NodeId, to: NodeId) => `${from}__${to}`;
