import { useMemo } from 'react';
import { issueStatus, useActiveIssue } from '../state/issueStatus';
import { useAppStore } from '../state/store';
import type { ResolvedPath } from './layout';
import type { PacketBehaviour } from './links/Packets';

const flow: PacketBehaviour = { kind: 'flow' };

/** Vertaalt het gekozen probleem naar wat de scène laat zien: wie uitgelicht/gedimd is en hoe pakketjes bewegen. */
export function useIssueScene() {
  const issue = useActiveIssue();
  const hasExtender = useAppStore((s) => s.hasExtender);

  return useMemo(() => {
    const status = issueStatus(issue, hasExtender);

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
          return affected ? { kind: 'fade' } : flow;
        case 'device-only':
          return affected ? { kind: 'stop', stopAt: 0.85 } : flow;
      }
    };

    return { ...status, behaviour };
  }, [issue, hasExtender]);
}
