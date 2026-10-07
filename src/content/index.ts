import type { ConnectionType, Issue, NodeId } from './types';
import { nodes } from './nodes';
import { links } from './links';
import { issues } from './issues';

export * from './types';
export { nodes, links, issues };
export { houses, getHouse, defaultHouseId } from './houses';
export { issueCategories } from './categories';

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

export const getIssue = (id: string | null) => issues.find((issue) => issue.id === id);

/** Aantal stappen in de probleemmodus: de uitlegstappen plus één stap met de oplossingen. */
export const issueStepCount = (issue: Issue) => issue.steps.length + 1;

/** Onderdeel waar de camera bij een stap naartoe gaat. */
export const issueStepFocus = (issue: Issue, step: number): NodeId =>
  step < issue.steps.length
    ? issue.steps[step].focusNodeId
    : (issue.fixesFocusNodeId ?? issue.steps[issue.steps.length - 1].focusNodeId);

/** Vult {naam} in een contenttekst in met waarden uit het eigen huis (bijv. {weakRoom}). */
export const fillTemplate = (text: string, vars: Record<string, string>) =>
  text.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match);
