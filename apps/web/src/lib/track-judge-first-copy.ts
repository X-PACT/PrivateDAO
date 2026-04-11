import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { getSubmissionCoachPlan } from "@/lib/submission-coach";
import { getTrackSpecificProofContext } from "@/lib/track-proof-closure";

export type TrackJudgeFirstCopy = {
  whatWorksNow: string[];
  externallyProven: Array<{
    label: string;
    href: string;
    summary: string;
  }>;
  exactBlocker: string;
  exactBlockerSummary: string;
  pendingSummary: string;
  bestDemoRoute: string;
  bestDemoSummary: string;
  openingSequence: string[];
  voiceoverScript: string;
};

function getProfileAwareDemoRoute(workspace: CompetitionTrackWorkspace, commercialProfile?: string) {
  if (commercialProfile === "pilot-funding") return workspace.liveRoute;
  if (commercialProfile === "treasury-top-up") return "/services";
  if (commercialProfile === "vendor-payout" || commercialProfile === "contributor-payout") return "/command-center";

  return getSubmissionCoachPlan(workspace).finalDemoOrder[0] ?? workspace.liveRoute;
}

function getProfileAwareDemoSummary(workspace: CompetitionTrackWorkspace, commercialProfile: string | undefined, bestDemoRoute: string) {
  if (commercialProfile === "pilot-funding") {
    return `Lead with ${bestDemoRoute}, keep the buyer route visible, then attach proof and custody truth to the same pilot story.`;
  }
  if (commercialProfile === "treasury-top-up") {
    return `Lead with ${bestDemoRoute}, frame the track as governed runway and visible reliability, then keep mainnet gates explicit.`;
  }
  if (commercialProfile === "vendor-payout" || commercialProfile === "contributor-payout") {
    return `Lead with ${bestDemoRoute}, show governed execution and diagnostics first, then attach custody truth and exact blockers.`;
  }

  return `Lead with ${bestDemoRoute}, then keep proof, custody truth, and the blocker in the same judge flow instead of splitting the story across routes.`;
}

export function getTrackJudgeFirstCopy(
  workspace: CompetitionTrackWorkspace,
  commercialProfile?: string,
): TrackJudgeFirstCopy {
  const proofContext = getTrackSpecificProofContext(workspace);
  const whatWorksNow = workspace.deliverables.slice(0, 3);
  const bestDemoRoute = getProfileAwareDemoRoute(workspace, commercialProfile);
  const bestDemoSummary = getProfileAwareDemoSummary(workspace, commercialProfile, bestDemoRoute);

  const openingSequence = [
    `What works now: ${whatWorksNow.join(" ")}`,
    `What is externally proven: ${proofContext.externallyProven.map((item) => `${item.label} via ${item.href}`).join(" and ")}.`,
    `Exact blocker: ${proofContext.exactBlocker}. ${proofContext.exactBlockerSummary}`,
    `Best demo route: open ${bestDemoRoute} first. ${bestDemoSummary}`,
  ];

  return {
    whatWorksNow,
    externallyProven: proofContext.externallyProven,
    exactBlocker: proofContext.exactBlocker,
    exactBlockerSummary: proofContext.exactBlockerSummary,
    pendingSummary: proofContext.pendingSummary,
    bestDemoRoute,
    bestDemoSummary,
    openingSequence,
    voiceoverScript: openingSequence.join(" "),
  };
}
