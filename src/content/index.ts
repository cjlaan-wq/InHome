import type { ConnectionType } from './types';
import { nodes } from './nodes';
import { links } from './links';
import { issues } from './issues';

export * from './types';
export { nodes, links, issues };

const appliesTo = (type: ConnectionType) => (item: { connectionTypes: ConnectionType[] }) =>
  item.connectionTypes.includes(type);

/** Onderdelen voor een verbindingstype, met eventuele type-specifieke teksten toegepast. */
export const getNodes = (type: ConnectionType) =>
  nodes.filter(appliesTo(type)).map((node) => ({ ...node, ...node.variants?.[type] }));

/** Optionele onderdelen (SuperWifi) en hun verbindingen tellen alleen mee als de klant ze heeft. */
export const getActiveNodes = (type: ConnectionType, hasExtender: boolean) =>
  getNodes(type).filter((node) => !node.optional || hasExtender);

export const getLinks = (type: ConnectionType, hasExtender = true) =>
  links.filter(appliesTo(type)).filter((link) => hasExtender || (link.from !== 'extender' && link.to !== 'extender'));

export const getIssues = (type: ConnectionType) => issues.filter(appliesTo(type));
