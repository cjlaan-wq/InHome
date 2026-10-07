import { getIssue, links } from '../content';
import type { DeviceId, Issue, NodeId } from '../content/types';
import { useAppStore } from './store';

/** Hoe een onderdeel in beeld is: gewoon, betrokken bij het probleem, of naar de achtergrond. */
export type Status = 'normal' | 'affected' | 'dimmed';

/** Stroomafwaartse volgorde van verbindingen = volgorde in links.ts (van KPN naar je apparaten). */
export const linkIndex = (linkId: string) => links.findIndex((link) => link.id === linkId);

/**
 * Status van onderdelen, apparaten en verbindingen voor het gekozen probleem.
 * Los van three.js, zodat zowel de 3D-scène als de 2D-fallback dit gebruiken.
 */
export function issueStatus(issue: Issue | undefined, hasExtender: boolean) {
  const partAffected = (part?: DeviceId) =>
    !issue?.affectedParts?.length || part === undefined || issue.affectedParts.includes(part);
  // Zwak signaal + SuperWifi-punt: het apparaat krijgt nu via het punt een goed signaal.
  const solvedByExtender = issue?.visualEffect === 'weak-signal' && hasExtender;
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
    partStatus: (part: DeviceId): Status => {
      if (!issue || solvedByExtender) return 'normal';
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
