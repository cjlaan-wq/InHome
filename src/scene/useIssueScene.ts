import { useMemo } from 'react';
import { getIssue } from '../content';
import type { DeviceId, NodeId } from '../content/types';
import { useAppStore } from '../state/store';
import type { Status } from './Highlight';
import { linkOrder, type ResolvedPath } from './layout';
import type { PacketBehaviour } from './links/Packets';

const flow: PacketBehaviour = { kind: 'flow' };

/** Vertaalt het gekozen probleem naar wat de scène laat zien: wie uitgelicht/gedimd is en hoe pakketjes bewegen. */
export function useIssueScene() {
  const mode = useAppStore((s) => s.mode);
  const selectedIssueId = useAppStore((s) => s.selectedIssueId);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const issue = mode === 'issue' ? getIssue(selectedIssueId) : undefined;

  return useMemo(() => {
    const nodeStatus = (id: NodeId): Status =>
      !issue ? 'normal' : issue.affectedNodes.includes(id) ? 'affected' : 'dimmed';

    const partAffected = (part?: DeviceId) =>
      !issue?.affectedParts?.length || part === undefined || issue.affectedParts.includes(part);

    // Zwak signaal + SuperWifi-punt: het apparaat krijgt nu via het punt een goed signaal.
    const solvedByExtender = issue?.visualEffect === 'weak-signal' && hasExtender;

    const partStatus = (part: DeviceId): Status => {
      if (!issue) return 'normal';
      if (solvedByExtender) return 'normal';
      return issue.affectedNodes.includes('devices') && partAffected(part) ? 'affected' : 'dimmed';
    };

    const linkStatus = (linkId: string): Status =>
      !issue ? 'normal' : issue.affectedLinks.includes(linkId) ? 'affected' : 'dimmed';

    // Waar het netwerk 'breekt': alles stroomafwaarts daarvan krijgt geen pakketjes meer.
    const breakIndex = issue
      ? Math.min(...issue.affectedLinks.map((id) => linkOrder.indexOf(id)).filter((i) => i >= 0))
      : Infinity;

    const behaviour = (path: ResolvedPath): PacketBehaviour => {
      if (!issue) return flow;
      const affected = issue.affectedLinks.includes(path.linkId) && partAffected(path.deviceId);
      switch (issue.visualEffect) {
        case 'blocked':
          if (affected) return { kind: 'stop', stopAt: 0.5 };
          return linkOrder.indexOf(path.linkId) > breakIndex ? { kind: 'none' } : flow;
        case 'slow':
          return affected ? { kind: 'flow', speedFactor: 0.3, problem: true } : flow;
        case 'weak-signal':
          return affected ? { kind: 'fade' } : flow;
        case 'device-only':
          return affected ? { kind: 'stop', stopAt: 0.85 } : flow;
      }
    };

    return { issue, nodeStatus, partStatus, linkStatus, behaviour, contextStatus: (issue ? 'dimmed' : 'normal') as Status };
  }, [issue, hasExtender]);
}
