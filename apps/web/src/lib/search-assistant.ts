import { competitionTrackWorkspaces, proposalRegistry } from "@/lib/site-data";
import { getCompetitionLaneLabel } from "@/lib/competition-lane-labels";
import { getSubmissionCoachPlan } from "@/lib/submission-coach";
import { getTrackCommercializationPlan } from "@/lib/track-commercialization";
import { getTrackMainnetGatePlan } from "@/lib/track-mainnet-gates";
import { getTrackNarrativePlan } from "@/lib/track-narratives";
import { getTrackReviewerPacketPublicLabel, getTrackReviewerPacketRoute } from "@/lib/track-reviewer-packets";
import { getTrackTechnicalFit } from "@/lib/technical-eligibility";

export type AssistantSuggestion = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  relatedRoutes: Array<{
    label: string;
    href: string;
  }>;
};

type AssistantIntent = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  relatedRoutes: Array<{
    label: string;
    href: string;
  }>;
  keywords: string[];
};

const assistantIntents: AssistantIntent[] = [
  {
    title: "Start a normal-user PrivateDAO flow",
    summary:
      "Use the onboarding path first, connect a wallet, then continue into the command center instead of jumping into proof or raw documents.",
    primaryActionLabel: "Open start workspace",
    primaryActionHref: "/start",
    relatedRoutes: [
      { label: "Command Center", href: "/command-center" },
      { label: "Services", href: "/services" },
      { label: "Story Video", href: "/story" },
    ],
    keywords: ["start", "begin", "user", "easy", "onboarding", "consumer", "normal", "first run"],
  },
  {
    title: "Open the shortest review path",
    summary:
      "Use the proof route with the judge context first. From there, continue into V3 proof, trust package, and mainnet blockers without digging through the full site.",
    primaryActionLabel: "Open review proof path",
    primaryActionHref: "/proof/?judge=1",
    relatedRoutes: [
      { label: "Trust Package", href: "/documents/trust-package" },
      { label: "Live Proof V3", href: "/documents/live-proof-v3" },
      { label: "Mainnet Blockers", href: "/documents/mainnet-blockers" },
    ],
    keywords: ["judge", "review", "proof", "trust", "packet", "audit", "reviewer", "award"],
  },
  {
    title: "Inspect cryptography and security posture",
    summary:
      "Open the security route when the question is about ZK, REFHE, MagicBlock, Fast RPC, the capability matrix, or the confidence engine.",
    primaryActionLabel: "Open security workspace",
    primaryActionHref: "/security",
    relatedRoutes: [
      { label: "ZK Capability Matrix", href: "/documents/zk-capability-matrix" },
      { label: "Confidence Engine", href: "/documents/cryptographic-confidence-engine" },
      { label: "Diagnostics", href: "/diagnostics" },
    ],
    keywords: ["zk", "security", "encryption", "magicblock", "refhe", "rpc", "fast rpc", "cryptography", "matrix"],
  },
  {
    title: "Open the Security + Intelligence layer",
    summary:
      "Use the intelligence route when the user wants proposal analysis, treasury risk warnings, voting summaries, RPC interpretation, or gaming-governance assistance inside the product.",
    primaryActionLabel: "Open intelligence workspace",
    primaryActionHref: "/intelligence",
    relatedRoutes: [
      { label: "Security", href: "/security" },
      { label: "Services", href: "/services" },
      { label: "Runtime infrastructure lane", href: "/tracks/rpc-infrastructure" },
    ],
    keywords: [
      "proposal analyzer",
      "treasury risk",
      "voting summary",
      "rpc analyzer",
      "gaming ai",
      "intelligence",
      "ai features",
      "ai powered",
    ],
  },
  {
    title: "Review mainnet authority hardening",
    summary:
      "Open the security route and the authority brief when the question is about multisig, upgrade authority, treasury authority, or admin-boundary discipline before Mainnet.",
    primaryActionLabel: "Open authority hardening",
    primaryActionHref: "/documents/authority-hardening-mainnet",
    relatedRoutes: [
      { label: "Security", href: "/security" },
      { label: "Mainnet Blockers", href: "/documents/mainnet-blockers" },
      { label: "Production Custody Ceremony", href: "/documents/production-custody-ceremony" },
    ],
    keywords: ["multisig", "authority", "upgrade authority", "treasury authority", "admin authority", "ceremony", "mainnet hardening"],
  },
  {
    title: "Open custody truth and reviewer packet",
    summary:
      "Use the canonical custody proof and reviewer packet when the question is about multisig evidence, signer roster, authority transfer signatures, or the strict repo-safe ingestion route.",
    primaryActionLabel: "Open custody reviewer packet",
    primaryActionHref: "/documents/custody-proof-reviewer-packet",
    relatedRoutes: [
      { label: "Canonical custody proof", href: "/documents/canonical-custody-proof" },
      { label: "Custody workspace", href: "/custody" },
      { label: "Multisig intake shape", href: "/documents/multisig-setup-intake" },
    ],
    keywords: [
      "custody proof",
      "reviewer packet",
      "authority transfer",
      "multisig intake",
      "signer roster",
      "custody ceremony",
      "canonical custody",
    ],
  },
  {
    title: "Open the monitoring and incident path",
    summary:
      "Use diagnostics and the incident runbook when the question is about RPC failures, wallet errors, repeated tx attempts, alerts, logs, or response discipline.",
    primaryActionLabel: "Open incident readiness runbook",
    primaryActionHref: "/documents/incident-readiness-runbook",
    relatedRoutes: [
      { label: "Diagnostics", href: "/diagnostics" },
      { label: "Proof Center", href: "/proof" },
      { label: "Runtime evidence", href: "/viewer/runtime-evidence.generated" },
    ],
    keywords: ["incident", "runbook", "monitoring", "alerts", "logs", "rpc failures", "wallet errors", "replay", "duplicate calls"],
  },
  {
    title: "Find the best wallet and live dApp path",
    summary:
      "Lead with Solflare for the current product shell. Keep Phantom as a familiar fallback, then continue into the command center or the live app corridor.",
    primaryActionLabel: "Open wallet-first start path",
    primaryActionHref: "/start",
    relatedRoutes: [
      { label: "Live app corridor", href: "/tracks/eitherway-live-dapp" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Command Center", href: "/command-center" },
    ],
    keywords: ["wallet", "solflare", "phantom", "backpack", "kamino", "dflow", "quicknode", "eitherway"],
  },
  {
    title: "Open the competition-ready workspace",
    summary:
      "Go to the competition center when the question is about Frontier packaging, confidential governance, runtime infrastructure, or adjacent reviewer positioning. Each workspace keeps live route, review route, proof route, deck route, and validation steps together.",
    primaryActionLabel: "Open competition center",
    primaryActionHref: "/tracks",
    relatedRoutes: [
      { label: "Confidential governance lane", href: "/tracks/privacy-track" },
      { label: "Runtime infrastructure lane", href: "/tracks/rpc-infrastructure" },
      { label: "Wallet-first product lane", href: "/tracks/consumer-apps" },
    ],
    keywords: ["competition", "hackathon", "frontier", "colosseum", "privacy", "ranger", "consumer", "100xdevs", "solrouter", "ika", "encrypt"],
  },
  {
    title: "Open the strategic opportunity readiness map",
    summary:
      "Use the opportunity map when the question is about startup accelerator grants, regional grants, analytics side opportunities, confidential payout fit, or hardening-first bounty posture around the same product thesis.",
    primaryActionLabel: "Open opportunity readiness",
    primaryActionHref: "/documents/strategic-opportunity-readiness-2026",
    relatedRoutes: [
      { label: "Services", href: "/services" },
      { label: "Diagnostics", href: "/diagnostics" },
      { label: "Canonical custody proof", href: "/documents/canonical-custody-proof" },
    ],
    keywords: [
      "startup accelerator",
      "accelerator grant",
      "poland grant",
      "regional grant",
      "dune data",
      "dune analytics",
      "umbra",
      "adevar",
      "audit bounty",
    ],
  },
  {
    title: "Package the commercial and API surface",
    summary:
      "Use the services route when the question is about pilots, hosted reads, enterprise governance, sales posture, or infrastructure packaging for buyers and partners.",
    primaryActionLabel: "Open services workspace",
    primaryActionHref: "/services",
    relatedRoutes: [
      { label: "Products", href: "/products" },
      { label: "Service Catalog", href: "/documents/service-catalog" },
      { label: "Pricing Model", href: "/documents/pricing-model" },
    ],
    keywords: ["service", "pricing", "pilot", "enterprise", "sales", "customer", "api", "hosted", "commercial", "rpc"],
  },
  {
    title: "Join the PrivateDAO community",
    summary:
      "Use the community route when the goal is to join Discord, subscribe on YouTube, or follow public product updates without going through proof-heavy reviewer pages.",
    primaryActionLabel: "Open community hub",
    primaryActionHref: "/community",
    relatedRoutes: [
      { label: "Discord", href: "https://discord.gg/bC76YEcpDa" },
      { label: "YouTube", href: "https://www.youtube.com/@privatedao" },
      { label: "Story Video", href: "/story" },
    ],
    keywords: ["community", "discord", "join", "server", "youtube", "channel", "social", "telegram", "x"],
  },
  {
    title: "Search the document and viewer layer",
    summary:
      "Use the document library first for curated packets, then the broader viewer if you need raw repository depth or generated operational artifacts.",
    primaryActionLabel: "Open curated documents",
    primaryActionHref: "/documents",
    relatedRoutes: [
      { label: "Viewer", href: "/viewer" },
      { label: "Reviewer Fast Path", href: "/documents/reviewer-fast-path" },
      { label: "Audit Packet", href: "/documents/audit-packet" },
    ],
    keywords: ["document", "docs", "viewer", "readme", "artifact", "generated", "packet"],
  },
];

const fallbackSuggestion: AssistantSuggestion = {
  title: "Start from the product shell",
  summary:
    "If the goal is unclear, begin at onboarding or the command center. That gives the shortest route to a real product flow, wallet action, proof surface, or competition workspace.",
  primaryActionLabel: "Open start workspace",
  primaryActionHref: "/start",
  relatedRoutes: [
    { label: "Command Center", href: "/command-center" },
    { label: "Search", href: "/search" },
    { label: "Tracks", href: "/tracks" },
  ],
};

const competitionAliases: Record<string, string[]> = {
  "colosseum-frontier": ["colosseum", "frontier", "grand champion", "accelerator", "product impact"],
  "privacy-track": ["privacy", "magicblock", "encrypted", "zk", "refhe", "private governance"],
  "eitherway-live-dapp": ["eitherway", "solflare", "kamino", "dflow", "quicknode", "live dapp", "wallet track"],
  "rpc-infrastructure": ["rpc", "quicknode", "infrastructure", "hosted reads", "diagnostics", "api"],
  "consumer-apps": ["consumer", "tokenton", "tokenton26", "ux", "onboarding", "normal users"],
  "ranger-main": ["ranger", "main track", "startup quality", "build a bear"],
  "ranger-drift": ["drift", "treasury", "capital allocation", "side track", "risk"],
  "100xdevs": ["100xdevs", "frontend", "next.js", "developer quality", "shipping discipline"],
  "encrypt-ika": ["encrypt", "ika", "encrypted ops", "confidential operations"],
  "solrouter-encrypted-ai": ["solrouter", "encrypted ai", "assistant", "ai track"],
};

type TreasuryProfile =
  | "pilot-funding"
  | "treasury-top-up"
  | "vendor-payout"
  | "contributor-payout";

function detectTreasuryProfile(query: string): TreasuryProfile | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("pilot funding")) return "pilot-funding";
  if (normalized.includes("vendor payout")) return "vendor-payout";
  if (normalized.includes("contributor payout")) return "contributor-payout";
  if (
    normalized.includes("treasury top-up") ||
    normalized.includes("treasury top up") ||
    normalized.includes("top-up") ||
    normalized.includes("top up")
  ) {
    return "treasury-top-up";
  }
  return null;
}

function getProfileTrackSuggestion(query: string): AssistantSuggestion | null {
  const normalized = query.trim().toLowerCase();
  const profile = detectTreasuryProfile(normalized);
  const workspace = findCompetitionWorkspace(normalized);

  if (!profile || !workspace) return null;

  if (profile === "pilot-funding") {
    return {
      title: `Pilot funding route for ${getCompetitionLaneLabel(workspace.slug)}`,
      summary:
        "Go straight into the profile-aware track. The first three surfaces are ordered for pilot funding: submission path first, then coach and alignment, then trust and proof.",
      primaryActionLabel: "Open profile-aware track",
      primaryActionHref: `/tracks/${workspace.slug}?profile=pilot-funding`,
      relatedRoutes: [
        { label: "1. Track workspace", href: `/tracks/${workspace.slug}?profile=pilot-funding` },
        { label: "2. Engage", href: "/engage?profile=pilot-funding" },
        { label: "3. Proof", href: workspace.proofRoute },
      ],
    };
  }

  if (profile === "treasury-top-up") {
    return {
      title: `Treasury top-up route for ${getCompetitionLaneLabel(workspace.slug)}`,
      summary:
        "Go straight into the profile-aware track. The first three surfaces are ordered for treasury capitalization: commercialization first, then investment case and mainnet gates, then supporting metrics.",
      primaryActionLabel: "Open profile-aware track",
      primaryActionHref: `/tracks/${workspace.slug}?profile=treasury-top-up`,
      relatedRoutes: [
        { label: "1. Track workspace", href: `/tracks/${workspace.slug}?profile=treasury-top-up` },
        { label: "2. Engage", href: "/engage?profile=treasury-top-up" },
        { label: "3. Services", href: "/services" },
      ],
    };
  }

  if (profile === "vendor-payout") {
    return {
      title: `Vendor payout route for ${getCompetitionLaneLabel(workspace.slug)}`,
      summary:
        "Go straight into the profile-aware track. The first three surfaces are ordered for governed vendor execution: submission path first, then metrics and diagnostics, then custody and trust.",
      primaryActionLabel: "Open profile-aware track",
      primaryActionHref: `/tracks/${workspace.slug}?profile=vendor-payout`,
      relatedRoutes: [
        { label: "1. Track workspace", href: `/tracks/${workspace.slug}?profile=vendor-payout` },
        { label: "2. Command Center", href: "/command-center" },
        { label: "3. Diagnostics", href: "/diagnostics" },
      ],
    };
  }

  return {
    title: `Contributor payout route for ${getCompetitionLaneLabel(workspace.slug)}`,
    summary:
      "Go straight into the profile-aware track. The first three surfaces are ordered for governed contributor funding: submission path first, then metrics, then custody and trust before broader commercial reading.",
    primaryActionLabel: "Open profile-aware track",
    primaryActionHref: `/tracks/${workspace.slug}?profile=contributor-payout`,
    relatedRoutes: [
      { label: "1. Track workspace", href: `/tracks/${workspace.slug}?profile=contributor-payout` },
      { label: "2. Command Center", href: "/command-center" },
      { label: "3. Security", href: "/security" },
    ],
  };
}

function getStrategicOpportunitySuggestion(query: string): AssistantSuggestion | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const opportunityRules = [
    {
      keywords: ["startup accelerator", "accelerator grant", "startup grant"],
      title: "Open the startup capital corridor",
      summary:
        "Start from the strategic opportunity map, then move into services and the custody reviewer packet. This is the shortest evidence-bound route for accelerator and funding reviewers.",
      primaryActionHref: "/documents/strategic-opportunity-readiness-2026",
      relatedRoutes: [
        { label: "1. Strategic opportunity map", href: "/documents/strategic-opportunity-readiness-2026" },
        { label: "2. Services", href: "/services" },
        { label: "3. Custody reviewer packet", href: "/documents/custody-proof-reviewer-packet" },
      ],
    },
    {
      keywords: ["poland grant", "regional grant", "poland grants"],
      title: "Open the regional grant corridor",
      summary:
        "Start from the strategic opportunity map, then use awards, the Frontier primary workspace, and the launch trust packet as the regional proof chain.",
      primaryActionHref: "/documents/strategic-opportunity-readiness-2026",
      relatedRoutes: [
        { label: "1. Strategic opportunity map", href: "/documents/strategic-opportunity-readiness-2026" },
        { label: "2. Awards", href: "/awards" },
        { label: "3. Launch trust packet", href: "/documents/launch-trust-packet" },
      ],
    },
    {
      keywords: ["dune data", "dune analytics", "data sidetrack", "data side track"],
      title: "Open the data and telemetry corridor",
      summary:
        "Start from the strategic opportunity map, then continue into diagnostics, analytics, and frontier integrations for the clearest runtime-data story.",
      primaryActionHref: "/documents/strategic-opportunity-readiness-2026",
      relatedRoutes: [
        { label: "1. Strategic opportunity map", href: "/documents/strategic-opportunity-readiness-2026" },
        { label: "2. Diagnostics", href: "/diagnostics" },
        { label: "3. Analytics", href: "/analytics" },
      ],
    },
    {
      keywords: ["umbra", "confidential payout", "private payout"],
      title: "Open the confidential payout corridor",
      summary:
        "Start from the strategic opportunity map, then continue into security, services, and custody for the reviewer-safe payout path.",
      primaryActionHref: "/documents/strategic-opportunity-readiness-2026",
      relatedRoutes: [
        { label: "1. Strategic opportunity map", href: "/documents/strategic-opportunity-readiness-2026" },
        { label: "2. Security", href: "/security" },
        { label: "3. Custody", href: "/custody" },
      ],
    },
    {
      keywords: ["adevar", "audit bounty", "hardening bounty", "security bounty"],
      title: "Open the audit and hardening corridor",
      summary:
        "Start from the strategic opportunity map, then continue into canonical custody proof, authority hardening, and incident readiness as the strict hardening bundle.",
      primaryActionHref: "/documents/strategic-opportunity-readiness-2026",
      relatedRoutes: [
        { label: "1. Strategic opportunity map", href: "/documents/strategic-opportunity-readiness-2026" },
        { label: "2. Canonical custody proof", href: "/documents/canonical-custody-proof" },
        { label: "3. Authority hardening", href: "/documents/authority-hardening-mainnet" },
      ],
    },
  ];

  const match = opportunityRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  if (!match) return null;

  return {
    title: match.title,
    summary: match.summary,
    primaryActionLabel: "Open opportunity readiness",
    primaryActionHref: match.primaryActionHref,
    relatedRoutes: match.relatedRoutes,
  };
}

function getTreasuryProfileSuggestion(query: string): AssistantSuggestion | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized.includes("pilot funding")) {
    return {
      title: "Open the pilot funding bundle",
      summary:
        "Start with Engage to qualify the buyer path, then open the Colosseum track where the first three surfaces are ordered for pilot funding: submission path, coach and alignment, then trust and proof.",
      primaryActionLabel: "Open pilot funding path",
      primaryActionHref: "/engage?profile=pilot-funding",
      relatedRoutes: [
        { label: "1. Engage", href: "/engage?profile=pilot-funding" },
        { label: "2. Frontier primary workspace", href: "/tracks/colosseum-frontier?profile=pilot-funding" },
        { label: "3. Proof and trust", href: "/documents/frontier-competition-readiness-2026" },
      ],
    };
  }

  if (normalized.includes("vendor payout")) {
    return {
      title: "Open the vendor payout bundle",
      summary:
        "Start from the vendor payout lane, then use the live dApp track with execution-first ordering: submission path first, then metrics and diagnostics, then custody and trust.",
      primaryActionLabel: "Open vendor payout path",
      primaryActionHref: "/engage?profile=vendor-payout",
      relatedRoutes: [
        { label: "1. Engage", href: "/engage?profile=vendor-payout" },
        { label: "2. Live app corridor", href: "/tracks/eitherway-live-dapp?profile=vendor-payout" },
        { label: "3. Command and diagnostics", href: "/command-center" },
      ],
    };
  }

  if (normalized.includes("contributor payout")) {
    return {
      title: "Open the contributor payout bundle",
      summary:
        "Start from the contributor payout lane, then use the consumer track with execution-first ordering: submission path first, then metrics, then custody and trust before broad commercial reading.",
      primaryActionLabel: "Open contributor payout path",
      primaryActionHref: "/engage?profile=contributor-payout",
      relatedRoutes: [
        { label: "1. Engage", href: "/engage?profile=contributor-payout" },
        { label: "2. Wallet-first product workspace", href: "/tracks/consumer-apps?profile=contributor-payout" },
        { label: "3. Command and trust", href: "/command-center" },
      ],
    };
  }

  if (normalized.includes("treasury top-up") || normalized.includes("treasury top up") || normalized.includes("top-up") || normalized.includes("top up")) {
    return {
      title: "Open the treasury top-up bundle",
      summary:
        "Start with treasury capitalization in Engage, then open the RPC track where services, commercialization, and mainnet gates are intentionally raised before deeper proof reading.",
      primaryActionLabel: "Open treasury top-up path",
      primaryActionHref: "/engage?profile=treasury-top-up",
      relatedRoutes: [
        { label: "1. Engage", href: "/engage?profile=treasury-top-up" },
        { label: "2. Runtime infrastructure workspace", href: "/tracks/rpc-infrastructure?profile=treasury-top-up" },
        { label: "3. Services and trust", href: "/services" },
      ],
    };
  }

  return null;
}

function findCompetitionWorkspace(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const scored = competitionTrackWorkspaces
    .map((workspace) => {
      const aliasTerms = competitionAliases[workspace.slug] ?? [];
      const rawTerms = [
        workspace.slug,
        workspace.title,
        workspace.sponsor,
        workspace.primaryCorridor,
        ...workspace.skillsNeeded,
        ...aliasTerms,
      ]
        .join(" ")
        .toLowerCase()
        .split(/[^a-z0-9.+#-]+/g)
        .filter(Boolean);

      const uniqueTerms = [...new Set(rawTerms)];
      const score = uniqueTerms.reduce(
        (sum, term) => (normalized.includes(term) ? sum + 1 : sum),
        0,
      );
      return { workspace, score };
    })
    .sort((left, right) => right.score - left.score);

  const top = scored[0];
  if (!top || top.score === 0) return null;
  return top.workspace;
}

function getTrackAnswer(query: string): AssistantSuggestion | null {
  const normalized = query.trim().toLowerCase();
  const workspace = findCompetitionWorkspace(normalized);
  if (!workspace) return null;

  if (
    normalized.includes("blocking") ||
    normalized.includes("mainnet") ||
    normalized.includes("blocker")
  ) {
    const gates = getTrackMainnetGatePlan(workspace);
    return {
      title: `Mainnet blockers for ${workspace.title}`,
      summary:
        `${gates.beforeMainnet[0]} ${gates.beforeMainnet[1] ?? ""}`.trim(),
      primaryActionLabel: "Open track workspace",
      primaryActionHref: `/tracks/${workspace.slug}`,
      relatedRoutes: [
        { label: "Mainnet blockers", href: "/documents/mainnet-blockers" },
        { label: "Review route", href: workspace.judgeRoute },
        { label: "Engage", href: "/engage" },
      ],
    };
  }

  if (
    normalized.includes("latency") ||
    normalized.includes("success rate") ||
    normalized.includes("wallet coverage") ||
    normalized.includes("proof completion") ||
    normalized.includes("execute health") ||
    normalized.includes("reveal health")
  ) {
    return {
      title: `Devnet metrics for ${workspace.title}`,
      summary:
        "Open the track workspace to see measured Devnet metrics for success rate, latency, wallet coverage, proof completion, and reveal or execute health in one panel.",
      primaryActionLabel: "Open track workspace",
      primaryActionHref: `/tracks/${workspace.slug}`,
      relatedRoutes: [
        { label: "Diagnostics", href: "/diagnostics" },
        { label: "Services", href: "/services" },
        { label: "Runtime evidence", href: "/viewer/runtime-evidence.generated" },
      ],
    };
  }

  if (
    normalized.includes("program id") ||
    normalized.includes("token") ||
    normalized.includes("wallet matrix") ||
    normalized.includes("runtime evidence") ||
    normalized.includes("technical evidence")
  ) {
    const technical = getTrackTechnicalFit(workspace.slug);
    return {
      title: `Technical evidence for ${workspace.title}`,
      summary:
        `${technical.coreIdentity[0]?.label}: ${technical.coreIdentity[0]?.value}. ${technical.sponsorUsage[0]}`,
      primaryActionLabel: "Open track workspace",
      primaryActionHref: `/tracks/${workspace.slug}`,
      relatedRoutes: [
        { label: technical.evidenceRoutes[0]?.label ?? "Proof route", href: technical.evidenceRoutes[0]?.href ?? workspace.proofRoute },
        { label: technical.evidenceRoutes[1]?.label ?? "Wallet matrix", href: technical.evidenceRoutes[1]?.href ?? "/viewer/wallet-compatibility-matrix.generated" },
        { label: "Trust package", href: "/documents/trust-package" },
      ],
    };
  }

  if (
    normalized.includes("why us") ||
    normalized.includes("sponsor should care") ||
    normalized.includes("future problem") ||
    normalized.includes("problem and solution") ||
    normalized.includes("investor")
  ) {
    const narrative = getTrackNarrativePlan(workspace);
    return {
      title: `Strategic case for ${workspace.title}`,
      summary: `${narrative.whySponsorShouldCareNow} ${narrative.futureProblemSolution}`.trim(),
      primaryActionLabel: "Open track workspace",
      primaryActionHref: `/tracks/${workspace.slug}`,
      relatedRoutes: [
        { label: "Engage", href: "/engage" },
        { label: "Proof", href: workspace.proofRoute },
        { label: "Review", href: workspace.judgeRoute },
      ],
    };
  }

  if (
    normalized.includes("paid") ||
    normalized.includes("customer") ||
    normalized.includes("commercial") ||
    normalized.includes("sell") ||
    normalized.includes("pricing") ||
    normalized.includes("motion")
  ) {
    const commercialization = getTrackCommercializationPlan(workspace);
    return {
      title: `Fastest paid motion for ${workspace.title}`,
      summary: commercialization.firstPaidMotion,
      primaryActionLabel: "Open engage route",
      primaryActionHref: "/engage",
      relatedRoutes: [
        { label: "Track workspace", href: `/tracks/${workspace.slug}` },
        { label: "Services", href: "/services" },
        { label: commercialization.routes[0]?.label ?? "Pilot program", href: commercialization.routes[0]?.href ?? "/documents/pilot-program" },
      ],
    };
  }

  if (
    normalized.includes("readiness") ||
    normalized.includes("score") ||
    normalized.includes("gap") ||
    normalized.includes("improvement") ||
    normalized.includes("demo order")
  ) {
    const coach = getSubmissionCoachPlan(workspace);
    return {
      title: `Submission coach for ${workspace.title}`,
      summary:
        `Readiness ${coach.readinessScore} (${coach.readinessBand}). Weakest gap: ${coach.weakestGap}`,
      primaryActionLabel: "Open track workspace",
      primaryActionHref: `/tracks/${workspace.slug}`,
      relatedRoutes: [
        { label: "Live route", href: workspace.liveRoute },
        { label: "Review route", href: workspace.judgeRoute },
        { label: "Proof route", href: workspace.proofRoute },
      ],
    };
  }

  return null;
}

function getCompetitionSuggestion(query: string): AssistantSuggestion | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  const top = findCompetitionWorkspace(normalized);
  if (!top) return null;

  return {
    title: `Open ${top.title}`,
    summary:
      `${top.objective} Lead with ${top.liveRoute}, keep reviewers on ${top.judgeRoute}, and use the proof and deck routes as the submission support bundle.`,
    primaryActionLabel: "Open track workspace",
    primaryActionHref: `/tracks/${top.slug}`,
    relatedRoutes: [
      { label: "Live route", href: top.liveRoute },
      { label: "Review route", href: top.judgeRoute },
      { label: "Proof route", href: top.proofRoute },
      { label: "Deck route", href: top.deckRoute },
    ],
  };
}

function getProposalSuggestion(query: string): AssistantSuggestion | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const scored = proposalRegistry
    .map((proposal) => {
      const searchable = [
        proposal.id,
        proposal.title,
        proposal.type,
        proposal.status,
        proposal.execution.proposalAccount,
        proposal.execution.recipient ?? "",
        proposal.execution.recipientLabel,
        proposal.execution.executionTarget,
        proposal.execution.mintAddress ?? "",
        proposal.execution.mintSymbol ?? "",
        proposal.summary,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      if (searchable.includes(normalized)) score += 6;
      for (const token of normalized.split(/\s+/).filter(Boolean)) {
        if (searchable.includes(token)) score += 1;
      }

      return { proposal, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  const top = scored[0];
  if (!top) return null;

  const proposal = top.proposal;
  return {
    title: `Open live indexed proposal ${proposal.id}`,
    summary:
      `${proposal.title} is being routed from the unified indexed proposal registry. Open the command center with this proposal preselected, then review the analyzer and treasury risk surfaces on the real execution context.`,
    primaryActionLabel: "Open command center with proposal",
    primaryActionHref: `/command-center?proposal=${encodeURIComponent(proposal.id)}`,
    relatedRoutes: [
      { label: "1. Command Center", href: `/command-center?proposal=${encodeURIComponent(proposal.id)}` },
      { label: "2. Dashboard", href: "/dashboard" },
      { label: "3. Evidence route", href: proposal.execution.txContext.evidenceRoute },
    ],
  };
}

function getCustodyTruthSuggestion(query: string): AssistantSuggestion | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const custodyTerms = [
    "custody proof",
    "reviewer packet",
    "authority transfer",
    "multisig intake",
    "signer roster",
    "custody ceremony",
    "canonical custody",
  ];

  if (!custodyTerms.some((term) => normalized.includes(term))) {
    return null;
  }

  return {
    title: "Open custody truth and reviewer packet",
    summary:
      "Start from the reviewer packet, then open the canonical custody proof, then the strict custody workspace. This is the fastest route for multisig truth, authority transfer status, and exact pending ceremony evidence.",
    primaryActionLabel: "Open reviewer packet",
    primaryActionHref: "/documents/custody-proof-reviewer-packet",
    relatedRoutes: [
      { label: "1. Reviewer packet", href: "/documents/custody-proof-reviewer-packet" },
      { label: "2. Canonical custody proof", href: "/documents/canonical-custody-proof" },
      { label: "3. Custody workspace", href: "/custody" },
    ],
  };
}

function getTrackReviewerPacketSuggestion(query: string): AssistantSuggestion | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const packetRules = [
    {
      keywords: ["privacy reviewer packet", "privacy packet", "privacy judge packet"],
      title: `Open the ${getTrackReviewerPacketPublicLabel("privacy-track")}`,
      route: getTrackReviewerPacketRoute("privacy-track"),
      trackRoute: "/tracks/privacy-track",
      proofRoute: "/documents/live-proof-v3",
    },
    {
      keywords: ["rpc reviewer packet", "rpc packet", "infrastructure reviewer packet", "infrastructure packet"],
      title: `Open the ${getTrackReviewerPacketPublicLabel("rpc-infrastructure")}`,
      route: getTrackReviewerPacketRoute("rpc-infrastructure"),
      trackRoute: "/tracks/rpc-infrastructure",
      proofRoute: "/documents/frontier-integrations",
    },
    {
      keywords: ["colosseum packet", "colosseum reviewer packet", "frontier packet", "frontier reviewer packet"],
      title: `Open the ${getTrackReviewerPacketPublicLabel("colosseum-frontier")}`,
      route: getTrackReviewerPacketRoute("colosseum-frontier"),
      trackRoute: "/tracks/colosseum-frontier",
      proofRoute: "/documents/frontier-competition-readiness-2026",
    },
  ];

  const match = packetRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  if (!match) return null;

  return {
    title: match.title,
    summary:
      "Open the track-specific reviewer packet first. It already bundles the judge-first opening, proof closure, exact blocker, best demo route, and the shortest reviewer links for that track.",
    primaryActionLabel: "Open track reviewer packet",
    primaryActionHref: match.route,
    relatedRoutes: [
      { label: "1. Track reviewer packet", href: match.route },
      { label: "2. Track workspace", href: match.trackRoute },
      { label: "3. Track proof route", href: match.proofRoute },
    ],
  };
}

export function getAssistantSuggestion(query: string): AssistantSuggestion {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return fallbackSuggestion;

  const trackReviewerPacketSuggestion = getTrackReviewerPacketSuggestion(normalized);
  if (trackReviewerPacketSuggestion) return trackReviewerPacketSuggestion;

  const profileTrackSuggestion = getProfileTrackSuggestion(normalized);
  if (profileTrackSuggestion) return profileTrackSuggestion;

  const treasuryProfileSuggestion = getTreasuryProfileSuggestion(normalized);
  if (treasuryProfileSuggestion) return treasuryProfileSuggestion;

  const custodyTruthSuggestion = getCustodyTruthSuggestion(normalized);
  if (custodyTruthSuggestion) return custodyTruthSuggestion;

  const strategicOpportunitySuggestion = getStrategicOpportunitySuggestion(normalized);
  if (strategicOpportunitySuggestion) return strategicOpportunitySuggestion;

  const trackAnswer = getTrackAnswer(normalized);
  if (trackAnswer) return trackAnswer;

  const proposalSuggestion = getProposalSuggestion(normalized);
  if (proposalSuggestion) return proposalSuggestion;

  const competitionSuggestion = getCompetitionSuggestion(normalized);
  if (competitionSuggestion) return competitionSuggestion;

  const scored = assistantIntents
    .map((intent) => ({
      intent,
      score: intent.keywords.reduce((sum, keyword) => (normalized.includes(keyword) ? sum + 1 : sum), 0),
    }))
    .sort((left, right) => right.score - left.score);

  const top = scored[0];
  if (!top || top.score === 0) return fallbackSuggestion;

  return {
    title: top.intent.title,
    summary: top.intent.summary,
    primaryActionLabel: top.intent.primaryActionLabel,
    primaryActionHref: top.intent.primaryActionHref,
    relatedRoutes: top.intent.relatedRoutes,
  };
}
