import { useMemo } from 'react';
import { issueStatus, useActiveIssue } from '../state/issueStatus';
import type { Coverage } from '../state/coverage';
import type { ResolvedPath } from './layout';
import type { PacketBehaviour } from './links/Packets';

const flow: PacketBehaviour = { kind: 'flow' };

/** Vertaalt het gekozen probleem naar wat de scène laat zien: wie uitgelicht/gedimd is en hoe pakketjes bewegen. */
export function useIssueScene(coverage: Coverage) {
  const issue = useActiveIssue();

  return useMemo(() => {
    const status = issueStatus(issue, coverage);

    const behaviour = (path: ResolvedPath): PacketBehaviour => {
      if (!issue) return flow;
      const affected = issue.affectedLinks.includes(path.linkId) && status.partAffected(path.deviceId);
      switch (issue.visualEffect) {
        case 'blocked':
          if (affected) return { kind: 'stop', stopAt: 0.5 };
          return status.linkCarries(path.linkId) ? flow : { kind: 'none' };
        case 'slow':
          return affected ? { kind: 'flow', speedFactor: 0.3, problem: true } : flow;
        case 'weak-signal':
          // Het zwakke apparaat, via welke bron dan ook (KPN Box of SuperWifi-punt).
          return path.deviceId && status.affectedParts?.includes(path.deviceId) ? { kind: 'fade' } : flow;
        case 'device-only':
          return affected ? { kind: 'stop', stopAt: 0.85 } : flow;
      }
    };

    return { ...status, behaviour };
  }, [issue, coverage]);
}
