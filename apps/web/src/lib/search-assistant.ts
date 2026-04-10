import { competitionTrackWorkspaces } from "@/lib/site-data";
import { getSubmissionCoachPlan } from "@/lib/submission-coach";
import { getTrackCommercializationPlan } from "@/lib/track-commercialization";
import { getTrackMainnetGatePlan } from "@/lib/track-mainnet-gates";

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
    title: "Open the shortest judge path",
    summary:
      "Use the proof route with the judge context first. From there, continue into V3 proof, trust package, and mainnet blockers without digging through the full site.",
    primaryActionLabel: "Open judge proof path",
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
    title: "Find the best wallet and live dApp path",
    summary:
      "Lead with Solflare for the current product shell. Keep Phantom as a familiar fallback, then continue into the command center or Eitherway-style live dApp route.",
    primaryActionLabel: "Open wallet-first start path",
    primaryActionHref: "/start",
    relatedRoutes: [
      { label: "Eitherway Live dApp Track", href: "/tracks/eitherway-live-dapp" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Command Center", href: "/command-center" },
    ],
    keywords: ["wallet", "solflare", "phantom", "backpack", "kamino", "dflow", "quicknode", "eitherway"],
  },
  {
    title: "Open the competition-ready workspace",
    summary:
      "Go to the competition center when the question is about Frontier, privacy, RPC, consumer, Ranger, or sponsor-specific positioning. Each track keeps live route, judge route, proof route, deck route, and validation steps together.",
    primaryActionLabel: "Open competition center",
    primaryActionHref: "/tracks",
    relatedRoutes: [
      { label: "Privacy Track", href: "/tracks/privacy-track" },
      { label: "RPC Infrastructure", href: "/tracks/rpc-infrastructure" },
      { label: "Consumer Apps", href: "/tracks/consumer-apps" },
    ],
    keywords: ["competition", "hackathon", "frontier", "colosseum", "privacy", "ranger", "consumer", "100xdevs", "solrouter", "ika", "encrypt"],
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
        { label: "Judge route", href: workspace.judgeRoute },
        { label: "Engage", href: "/engage" },
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
        { label: "Judge route", href: workspace.judgeRoute },
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
      `${top.objective} Lead with ${top.liveRoute}, keep judges on ${top.judgeRoute}, and use the proof and deck routes as the submission support bundle.`,
    primaryActionLabel: "Open track workspace",
    primaryActionHref: `/tracks/${top.slug}`,
    relatedRoutes: [
      { label: "Live route", href: top.liveRoute },
      { label: "Judge route", href: top.judgeRoute },
      { label: "Proof route", href: top.proofRoute },
      { label: "Deck route", href: top.deckRoute },
    ],
  };
}

export function getAssistantSuggestion(query: string): AssistantSuggestion {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return fallbackSuggestion;

  const trackAnswer = getTrackAnswer(normalized);
  if (trackAnswer) return trackAnswer;

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
