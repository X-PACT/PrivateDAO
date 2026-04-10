import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { getTrackTechnicalFit } from "@/lib/technical-eligibility";

export type SubmissionCoachPlan = {
  readinessScore: number;
  readinessBand: "High" | "Strong" | "Medium";
  weakestGap: string;
  nextFastestImprovement: string;
  finalDemoOrder: string[];
};

function scoreTrack(workspace: CompetitionTrackWorkspace) {
  let score = 58;

  score += Math.min(workspace.deliverables.length * 3, 12);
  score += Math.min(workspace.validationSteps.length * 2, 10);
  score += Math.min(workspace.sponsorFit.length * 2, 8);

  if (workspace.devnetStatus.toLowerCase().includes("live on devnet")) score += 8;
  if (workspace.liveRoute && workspace.judgeRoute && workspace.proofRoute) score += 6;
  if (workspace.recommendedWallet.toLowerCase().includes("solflare")) score += 3;
  if (workspace.videoRoute === "/story") score += 3;

  return Math.min(score, 96);
}

function inferWeakestGap(workspace: CompetitionTrackWorkspace) {
  if (workspace.slug === "colosseum-frontier") {
    return "The fastest way to lose edge here is to demo features separately instead of keeping the startup-quality product chain tight from `/start` through `/services`.";
  }
  if (workspace.slug === "privacy-track") {
    return "Privacy can still be misread as abstract if the demo jumps into cryptography before showing a human-readable confidential workflow.";
  }
  if (workspace.slug === "eitherway-live-dapp") {
    return "This track weakens if the wallet demo stops at connect instead of continuing into a meaningful proposal or treasury action.";
  }
  if (workspace.slug === "rpc-infrastructure") {
    return "RPC strength gets diluted if diagnostics and hosted-read value are shown as internal plumbing instead of visible buyer and judge value.";
  }
  if (workspace.slug === "consumer-apps") {
    return "Consumer positioning still suffers if reviewer-heavy proof surfaces appear before the guided product path and story route.";
  }
  if (workspace.slug === "ranger-main") {
    return "The main risk is fragmentation: if trust, product, and proof are not shown as one company-grade system, the submission can read like stacked demos.";
  }
  if (workspace.slug === "ranger-drift") {
    return "This track loses credibility immediately if it is framed like a trading bot instead of bounded treasury governance and risk discipline.";
  }
  if (workspace.slug === "100xdevs") {
    return "Frontend quality will be undercounted if the submission does not explicitly show route architecture, reusable shell design, and deployment discipline.";
  }
  if (workspace.slug === "encrypt-ika") {
    return "Encrypted-ops fit weakens when REFHE and ZK are explained before the user workflow they actually improve.";
  }
  if (workspace.slug === "solrouter-encrypted-ai") {
    return "This track breaks on overclaiming; the reasoning layer must stay visibly deterministic and tightly coupled to execution routes.";
  }

  return workspace.requirements[0] ?? "Keep the submission route coherent and evidence-led.";
}

function inferNextFastestImprovement(workspace: CompetitionTrackWorkspace) {
  const fit = getTrackTechnicalFit(workspace.slug);

  if (workspace.slug === "colosseum-frontier") {
    return "Record one ultra-clean end-to-end run of `/start` → `/command-center` → `/proof/?judge=1` → `/services` and mirror those screenshots into the deck.";
  }
  if (workspace.slug === "privacy-track") {
    return "Lead the first 45 seconds from a confidential use case, then branch into `/security` and the V3 packet instead of starting with terminology.";
  }
  if (workspace.slug === "eitherway-live-dapp") {
    return "Use Solflare as the single default demo wallet and rehearse one uninterrupted wallet-to-action flow through `/command-center`.";
  }
  if (workspace.slug === "rpc-infrastructure") {
    return "Tighten the runtime narrative around `/diagnostics`, `/documents/frontier-integrations`, and the hosted service docs so RPC value is unmistakable.";
  }
  if (workspace.slug === "consumer-apps") {
    return "Trim the first-run demo to `/start`, `/story`, and one simple wallet action so the consumer route feels obvious in under a minute.";
  }
  if (workspace.slug === "ranger-main") {
    return "Use the route architecture and the trust package as proof of startup coherence, then keep all README, video, and deck claims synchronized.";
  }
  if (workspace.slug === "ranger-drift") {
    return "Show one treasury-policy decision through analytics and the confidence engine, then stop before drifting into generic DeFi claims.";
  }
  if (workspace.slug === "100xdevs") {
    return "Capture the multi-page shell, search/assistant routing, and track workspaces as direct proof of frontend and product engineering quality.";
  }
  if (workspace.slug === "encrypt-ika") {
    return "Keep one encrypted-operations storyline centered on payroll or bonus approvals, backed by the security route and integrations packet.";
  }
  if (workspace.slug === "solrouter-encrypted-ai") {
    return "Show the deterministic assistant and confidence engine routing into the exact track and proof surfaces instead of describing speculative AI behavior.";
  }

  return `Tighten the evidence chain around ${fit.evidenceRoutes[0]?.href ?? workspace.proofRoute} and keep the live route first in the demo.`;
}

function inferFinalDemoOrder(workspace: CompetitionTrackWorkspace) {
  if (workspace.slug === "colosseum-frontier") {
    return ["/start", "/command-center", "/proof/?judge=1", "/services", "/story"];
  }
  if (workspace.slug === "privacy-track") {
    return ["/story", "/security", "/documents/zk-capability-matrix", "/proof/?judge=1", "/documents/live-proof-v3"];
  }
  if (workspace.slug === "eitherway-live-dapp") {
    return ["/start", "/command-center", "/dashboard", "/proof/?judge=1", "/story"];
  }
  if (workspace.slug === "rpc-infrastructure") {
    return ["/services", "/diagnostics", "/documents/frontier-integrations", "/documents/service-catalog", "/story"];
  }
  if (workspace.slug === "consumer-apps") {
    return ["/story", "/start", "/command-center", "/assistant", "/proof/?judge=1"];
  }
  if (workspace.slug === "ranger-main") {
    return ["/story", "/tracks", "/dashboard", "/documents/trust-package", "/services"];
  }
  if (workspace.slug === "ranger-drift") {
    return ["/analytics", "/security", "/documents/cryptographic-confidence-engine", "/documents/trust-package", "/story"];
  }
  if (workspace.slug === "100xdevs") {
    return ["/dashboard", "/developers", "/search", "/assistant", "/tracks"];
  }
  if (workspace.slug === "encrypt-ika") {
    return ["/story", "/security", "/viewer/refhe-security-model", "/documents/frontier-integrations", "/proof/?judge=1"];
  }
  if (workspace.slug === "solrouter-encrypted-ai") {
    return ["/assistant", "/search", "/security", "/documents/cryptographic-confidence-engine", "/tracks/solrouter-encrypted-ai"];
  }

  return [workspace.liveRoute, workspace.judgeRoute, workspace.proofRoute, workspace.deckRoute, workspace.videoRoute];
}

export function getSubmissionCoachPlan(workspace: CompetitionTrackWorkspace): SubmissionCoachPlan {
  const readinessScore = scoreTrack(workspace);
  const readinessBand = readinessScore >= 86 ? "High" : readinessScore >= 74 ? "Strong" : "Medium";

  return {
    readinessScore,
    readinessBand,
    weakestGap: inferWeakestGap(workspace),
    nextFastestImprovement: inferNextFastestImprovement(workspace),
    finalDemoOrder: inferFinalDemoOrder(workspace),
  };
}
