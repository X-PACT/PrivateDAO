export type IntelligenceFeatureId =
  | "proposal-analyzer"
  | "treasury-risk-ai"
  | "voting-summary"
  | "rpc-analyzer"
  | "gaming-ai";

export type IntelligenceFeature = {
  id: IntelligenceFeatureId;
  title: string;
  score: string;
  summary: string;
  route: string;
  tryNow: string;
};

export type IntelligenceAnalysis = {
  headline: string;
  summary: string;
  bullets: string[];
  scoreLabel: string;
  scoreValue: number;
};

export const intelligenceFeatures: IntelligenceFeature[] = [
  {
    id: "proposal-analyzer",
    title: "Proposal Analyzer",
    score: "10/10",
    summary:
      "Analyze treasury proposals before voting, highlight abnormal recipients, oversized transfers, and weak operational framing.",
    route: "/intelligence#proposal-analyzer",
    tryNow: "Paste a proposal and treasury action to receive a pre-vote risk readout.",
  },
  {
    id: "treasury-risk-ai",
    title: "Treasury Risk AI",
    score: "9/10",
    summary:
      "Watch payout size, recipient novelty, timing, and execution posture so treasury operations look disciplined instead of fragile.",
    route: "/intelligence#treasury-risk-ai",
    tryNow: "Enter payout conditions and compare them against a normal treasury motion.",
  },
  {
    id: "voting-summary",
    title: "Voting Summary",
    score: "8/10",
    summary:
      "Summarize discussion threads into support, concern, and execution-readiness language for judges and operators.",
    route: "/intelligence#voting-summary",
    tryNow: "Paste governance discussion notes and get a compressed operator summary.",
  },
  {
    id: "rpc-analyzer",
    title: "RPC Analyzer",
    score: "9/10",
    summary:
      "Turn raw latency, failure rate, and retry pressure into a readable RPC health posture for operators and buyers.",
    route: "/intelligence#rpc-analyzer",
    tryNow: "Input request metrics and get runtime health plus buyer-facing interpretation.",
  },
  {
    id: "gaming-ai",
    title: "Gaming AI",
    score: "8/10",
    summary:
      "Review reward changes, clan payouts, and event proposals so game governance does not accidentally damage the economy.",
    route: "/intelligence#gaming-ai",
    tryNow: "Model a game update or reward change before it goes to governance.",
  },
];

function normalizeAddress(value: string) {
  return value.trim();
}

export function analyzeProposalRisk(input: {
  title: string;
  summary: string;
  amount: number;
  recipient: string;
  mint: string;
  timelockHours: number;
  historicalUseCount: number;
}) {
  let score = 2.2;
  const bullets: string[] = [];

  if (input.amount >= 500) {
    score += 3.2;
    bullets.push("Large treasury transfer detected relative to a normal Devnet operating motion.");
  } else if (input.amount >= 150) {
    score += 1.8;
    bullets.push("Transfer size is meaningful enough to justify an explicit treasury review note.");
  }

  const recipient = normalizeAddress(input.recipient);
  if (recipient.length < 32) {
    score += 2.5;
    bullets.push("Recipient formatting looks incomplete or too short for a trusted treasury destination.");
  }

  if (input.historicalUseCount === 0) {
    score += 1.9;
    bullets.push("Recipient has no prior usage history in this governance context.");
  } else if (input.historicalUseCount <= 2) {
    score += 1.0;
    bullets.push("Recipient is lightly used and should carry an explicit rationale before voting.");
  }

  if (input.timelockHours < 12) {
    score += 1.4;
    bullets.push("Timelock is short. Reviewers may want a stronger waiting period before execution.");
  }

  const summaryText = `${input.title} ${input.summary}`.toLowerCase();
  if (summaryText.includes("emergency") || summaryText.includes("urgent")) {
    score += 1.1;
    bullets.push("Emergency language raises the burden for evidence and beneficiary validation.");
  }

  if (summaryText.includes("vendor") || summaryText.includes("contributor")) {
    score -= 0.4;
    bullets.push("Operational payout framing is clearer than a generic transfer proposal.");
  }

  const clamped = Math.max(1, Math.min(10, Number(score.toFixed(1))));
  return {
    headline: `Risk score ${clamped}/10`,
    summary:
      clamped >= 7
        ? "This proposal needs stronger explanation, trust context, and destination validation before users should sign."
        : clamped >= 4
          ? "This proposal is plausible, but the UI should surface the treasury context clearly before voting."
          : "This proposal reads like a routine governed action with manageable treasury risk.",
    bullets:
      bullets.length > 0
        ? bullets
        : ["No abnormal treasury pattern was detected from the current proposal inputs."],
    scoreLabel: clamped >= 7 ? "High risk" : clamped >= 4 ? "Moderate risk" : "Low risk",
    scoreValue: clamped,
  } satisfies IntelligenceAnalysis;
}

export function analyzeTreasuryRisk(input: {
  amount: number;
  normalAmount: number;
  repeatedAttempts: number;
  newRecipient: boolean;
  executionDelayHours: number;
}) {
  const ratio =
    input.normalAmount > 0 ? Number((input.amount / input.normalAmount).toFixed(2)) : input.amount;
  let score = 1.8;
  const bullets: string[] = [];

  if (ratio >= 4) {
    score += 3.1;
    bullets.push(`Amount exceeds the normal treasury motion by ${ratio}x.`);
  } else if (ratio >= 2) {
    score += 1.8;
    bullets.push(`Amount is materially above the normal treasury motion at ${ratio}x.`);
  }

  if (input.repeatedAttempts >= 3) {
    score += 2.4;
    bullets.push("Repeated request attempts suggest pressure on operators or a failing path.");
  } else if (input.repeatedAttempts > 0) {
    score += 1.0;
    bullets.push("This request has already been attempted before and should be checked against logs.");
  }

  if (input.newRecipient) {
    score += 1.6;
    bullets.push("Recipient is new to the treasury path and should be validated before execution.");
  }

  if (input.executionDelayHours < 24) {
    score += 1.1;
    bullets.push("Execution delay is short for a treasury-sensitive motion.");
  }

  const clamped = Math.max(1, Math.min(10, Number(score.toFixed(1))));
  return {
    headline: `Treasury risk ${clamped}/10`,
    summary:
      clamped >= 7
        ? "This payout should carry stronger diagnostics, proof, and signer review before it reaches execution."
        : clamped >= 4
          ? "Treasury conditions are acceptable but still deserve explicit operational notes and route visibility."
          : "Treasury conditions look stable for a standard governed payout flow.",
    bullets:
      bullets.length > 0
        ? bullets
        : ["No treasury anomaly exceeded the current monitoring thresholds."],
    scoreLabel: clamped >= 7 ? "Watch closely" : clamped >= 4 ? "Review recommended" : "Operationally normal",
    scoreValue: clamped,
  } satisfies IntelligenceAnalysis;
}

export function summarizeVotingDiscussion(input: { discussion: string }) {
  const text = input.discussion.trim();
  const normalized = text.toLowerCase();
  const supportHits = ["support", "approve", "pass", "ship", "yes"].reduce(
    (sum, term) => sum + normalized.split(term).length - 1,
    0,
  );
  const concernHits = ["risk", "concern", "delay", "unknown", "block", "issue"].reduce(
    (sum, term) => sum + normalized.split(term).length - 1,
    0,
  );
  const executionHits = ["timelock", "execute", "treasury", "recipient", "proof"].reduce(
    (sum, term) => sum + normalized.split(term).length - 1,
    0,
  );

  const score = Math.max(1, Math.min(10, 5 + supportHits - concernHits * 0.6));
  const sentiment =
    supportHits > concernHits ? "Discussion leans supportive." : concernHits > supportHits ? "Discussion leans cautious." : "Discussion is balanced.";

  return {
    headline: "Voting summary",
    summary: `${sentiment} ${executionHits > 0 ? "Execution and treasury details are already part of the conversation." : "Execution details should be made more explicit before final voting."}`,
    bullets: [
      `Support signals detected: ${supportHits}`,
      `Concern signals detected: ${concernHits}`,
      `Execution-safety references detected: ${executionHits}`,
    ],
    scoreLabel: supportHits >= concernHits ? "Readable for voters" : "Needs cleaner framing",
    scoreValue: Number(score.toFixed(1)),
  } satisfies IntelligenceAnalysis;
}

export function analyzeRpcHealth(input: {
  latencyMs: number;
  successRatePct: number;
  errorRatePct: number;
  retryPressurePct: number;
}) {
  let score = 9.6;
  const bullets: string[] = [];

  if (input.latencyMs > 450) {
    score -= 2.6;
    bullets.push("Latency is high enough to weaken buyer confidence for time-sensitive product actions.");
  } else if (input.latencyMs > 220) {
    score -= 1.2;
    bullets.push("Latency is acceptable, but not yet strong enough for an infrastructure-grade claim.");
  }

  if (input.successRatePct < 97) {
    score -= 2.4;
    bullets.push("Success rate is below a strong operator-facing threshold.");
  } else if (input.successRatePct < 99) {
    score -= 1.0;
    bullets.push("Success rate is good, but still leaves room for reliability tightening.");
  }

  if (input.errorRatePct > 2.5) {
    score -= 1.9;
    bullets.push("Error rate is elevated and should be reflected in diagnostics and incident watch.");
  }

  if (input.retryPressurePct > 12) {
    score -= 1.4;
    bullets.push("Retry pressure suggests unstable request handling or endpoint saturation.");
  }

  const clamped = Math.max(1, Math.min(10, Number(score.toFixed(1))));
  return {
    headline: `RPC score ${clamped}/10`,
    summary:
      clamped >= 8.5
        ? "This reads like a credible RPC surface for a buyer-facing infrastructure story."
        : clamped >= 6.5
          ? "This is usable, but the commercial story should stay disciplined until the metrics improve."
          : "This RPC posture needs more runtime work before it should be sold as infrastructure.",
    bullets:
      bullets.length > 0
        ? bullets
        : ["Latency, reliability, and retry pressure all read clean for the current operating target."],
    scoreLabel: clamped >= 8.5 ? "Commercially credible" : clamped >= 6.5 ? "Usable with caution" : "Needs hardening",
    scoreValue: clamped,
  } satisfies IntelligenceAnalysis;
}

export function analyzeGamingGovernance(input: {
  proposal: string;
  rewardChangePct: number;
  payoutCount: number;
  clanCount: number;
}) {
  let score = 7.8;
  const bullets: string[] = [];

  if (Math.abs(input.rewardChangePct) > 20) {
    score -= 1.8;
    bullets.push("Reward change is large enough to risk economy shock for players and guilds.");
  } else if (Math.abs(input.rewardChangePct) > 10) {
    score -= 0.8;
    bullets.push("Reward change is moderate and should be paired with a clear player-impact note.");
  }

  if (input.payoutCount > 100) {
    score -= 1.1;
    bullets.push("Large payout fan-out suggests stronger diagnostics and treasury rehearsal are needed.");
  }

  if (input.clanCount >= 5) {
    score += 0.6;
    bullets.push("Clan distribution supports a stronger governance narrative for game communities.");
  }

  const normalized = input.proposal.toLowerCase();
  if (normalized.includes("weapon") || normalized.includes("event") || normalized.includes("tournament")) {
    score += 0.5;
    bullets.push("Proposal maps cleanly to a game governance event users can understand.");
  }

  const clamped = Math.max(1, Math.min(10, Number(score.toFixed(1))));
  return {
    headline: `Gaming governance score ${clamped}/10`,
    summary:
      clamped >= 8
        ? "This game governance motion is product-legible and commercially attractive for a studio demo."
        : clamped >= 6
          ? "This gaming motion is viable, but economy communication should improve before rollout."
          : "This gaming motion risks confusing players or destabilizing rewards without more guardrails.",
    bullets:
      bullets.length > 0
        ? bullets
        : ["No major economy shock or governance readability issue was detected from the current game motion."],
    scoreLabel: clamped >= 8 ? "Strong demo candidate" : clamped >= 6 ? "Needs economy framing" : "High economy risk",
    scoreValue: clamped,
  } satisfies IntelligenceAnalysis;
}
