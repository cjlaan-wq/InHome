import { getIssue, links } from '../content';
import type { DeviceId, Issue, NodeId } from '../content/types';
import type { Coverage } from './coverage';
import { useAppStore } from './store';

/** Hoe een onderdeel in beeld is: gewoon, betrokken bij het probleem, of naar de achtergrond. */
export type Status = 'normal' | 'affected' | 'dimmed';

/** Stroomafwaartse volgorde van verbindingen = volgorde in links.ts (van KPN naar je apparaten). */
export const linkIndex = (linkId: string) => links.findIndex((link) => link.id === linkId);

/**
 * Betrokken apparaten. Bij 'weakest-wifi' komt dat uit jouw huis: het apparaat met de
 * zwakste wifi – tenzij dat inmiddels goed is (bijv. dankzij een SuperWifi-punt).
 * undefined = alle apparaten.
 */
export const affectedParts = (issue: Issue | undefined, coverage: Coverage): DeviceId[] | undefined => {
  if (issue?.affectedPartsFrom === 'weakest-wifi') {
    const weakest = coverage.weakestDevice;
    return coverage.devices[weakest].quality === 'good' ? [] : [weakest];
  }
  if (issue?.affectedPartsFrom === 'wifi-only')
    return (issue.affectedParts ?? []).filter((id) => coverage.devices[id].servedBy !== 'cable');
  return issue?.affectedParts;
};

/**
 * Status van onderdelen, apparaten en verbindingen voor het gekozen probleem.
 * Los van three.js, zodat zowel de 3D-scène als de 2D-fallback dit gebruiken.
 */
export function issueStatus(issue: Issue | undefined, coverage: Coverage) {
  const parts = affectedParts(issue, coverage);
  const partAffected = (part?: DeviceId) => parts === undefined || part === undefined || parts.includes(part);
  // Waar het netwerk 'breekt': alles stroomafwaarts daarvan krijgt niets meer.
  const breakIndex =
    issue?.visualEffect === 'blocked'
      ? Math.min(...issue.affectedLinks.map(linkIndex).filter((i) => i >= 0))
      : Infinity;

  return {
    issue,
    partAffected,
    breakIndex,
    contextStatus: (issue ? 'dimmed' : 'normal') as Status,
    nodeStatus: (id: NodeId): Status => (!issue ? 'normal' : issue.affectedNodes.includes(id) ? 'affected' : 'dimmed'),
    affectedParts: parts,
    partStatus: (part: DeviceId): Status => {
      if (!issue) return 'normal';
      return issue.affectedNodes.includes('devices') && partAffected(part) ? 'affected' : 'dimmed';
    },
    linkStatus: (linkId: string): Status =>
      !issue ? 'normal' : issue.affectedLinks.includes(linkId) ? 'affected' : 'dimmed',
    /** Komt er via deze verbinding nog iets aan? (Niet stroomafwaarts van een breuk.) */
    linkCarries: (linkId: string) => linkIndex(linkId) <= breakIndex,
  };
}

export type IssueStatus = ReturnType<typeof issueStatus>;

/** Het gekozen probleem (alleen in probleemmodus). */
export const useActiveIssue = () =>
  useAppStore((s) => (s.mode === 'issue' ? getIssue(s.selectedIssueId) : undefined));
