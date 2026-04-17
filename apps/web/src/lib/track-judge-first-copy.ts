import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { getSubmissionCoachPlan } from "@/lib/submission-coach";
import { getTrackSpecificProofContext } from "@/lib/track-proof-closure";

export type TrackJudgeFirstCopy = {
  whatWorksNow: string[];
  paymentsReadiness: string;
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
  if (commercialProfile === "vendor-payout" || commercialProfile === "contributor-payout") return "/govern";

  return getSubmissionCoachPlan(workspace).finalDemoOrder[0] ?? workspace.liveRoute;
}

function getProfileAwareDemoSummary(workspace: CompetitionTrackWorkspace, commercialProfile: string | undefined, bestDemoRoute: string) {
  if (commercialProfile === "pilot-funding") {
    return `Lead with ${bestDemoRoute}, keep the buyer route visible, then attach proof and custody truth to the same pilot story.`;
  }
  if (commercialProfile === "treasury-top-up") {
    return `Lead with ${bestDemoRoute}, frame the product lane as governed runway and visible reliability, then keep mainnet gates explicit.`;
  }
  if (commercialProfile === "vendor-payout" || commercialProfile === "contributor-payout") {
    return `Lead with ${bestDemoRoute}, show governed execution and diagnostics first, then attach custody truth and exact blockers.`;
  }

  return `Lead with ${bestDemoRoute}, then keep proof, custody truth, and the blocker in the same judge flow instead of splitting the product story across routes.`;
}

export function getTrackJudgeFirstCopy(
  workspace: CompetitionTrackWorkspace,
  commercialProfile?: string,
): TrackJudgeFirstCopy {
  const proofContext = getTrackSpecificProofContext(workspace);
  const treasuryProof = {
    label: "Treasury reviewer packet",
    href: "/documents/treasury-reviewer-packet",
    summary:
      "Generated treasury packet that makes sender discipline, reference-linked rails, payments fit, and the exact treasury blocker reviewer-visible.",
  };
  const telemetryProof = {
    label: "Reviewer telemetry packet",
    href: "/documents/reviewer-telemetry-packet",
    summary:
      "Generated telemetry truth packet that binds runtime evidence, integration evidence, read-node snapshot, and devnet service metrics into one reviewer-safe route.",
  };
  const externallyProven = [...proofContext.externallyProven, treasuryProof, telemetryProof];
  const whatWorksNow = workspace.deliverables.slice(0, 3);
  const bestDemoRoute = getProfileAwareDemoRoute(workspace, commercialProfile);
  const paymentsReadiness =
    commercialProfile === "treasury-top-up"
      ? "Treasury capitalization route is live on public Devnet rails, but production-safe custody still depends on authority-transfer evidence."
      : commercialProfile === "vendor-payout" || commercialProfile === "contributor-payout"
        ? "Governed payout framing is live, with rails, trust links, and diagnostics visible before any real-funds claim."
        : "Treasury rails, reviewer-safe packet, and custody truth are already live as part of the startup-grade payments story.";
  const bestDemoSummary = `${getProfileAwareDemoSummary(
    workspace,
    commercialProfile,
    bestDemoRoute,
  )} Close the route by opening /documents/treasury-reviewer-packet and /documents/reviewer-telemetry-packet so payments readiness and the data corridor stay inside the same proof story.`;

  const openingSequence = [
    `What works now: ${whatWorksNow.join(" ")}`,
    `What is externally proven: ${externallyProven.map((item) => `${item.label} via ${item.href}`).join(" and ")}.`,
    `Exact blocker: ${proofContext.exactBlocker}. ${proofContext.exactBlockerSummary}`,
    `Best product route: open ${bestDemoRoute} first. ${bestDemoSummary}`,
  ];

  return {
    whatWorksNow,
    paymentsReadiness,
    externallyProven,
    exactBlocker: proofContext.exactBlocker,
    exactBlockerSummary: proofContext.exactBlockerSummary,
    pendingSummary: proofContext.pendingSummary,
    bestDemoRoute,
    bestDemoSummary,
    openingSequence,
    voiceoverScript: openingSequence.join(" "),
  };
}
