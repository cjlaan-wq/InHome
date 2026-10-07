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

export const getLinks = (type: ConnectionType) => links.filter(appliesTo(type));

export const getIssues = (type: ConnectionType) => issues.filter(appliesTo(type));
