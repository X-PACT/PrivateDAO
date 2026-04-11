import { competitionTrackWorkspaces } from "@/lib/site-data";
import { proposalRegistry } from "@/lib/site-data";
import { getCompetitionLaneLabel } from "@/lib/competition-lane-labels";
import { getTrackReviewerPacketPublicLabel, getTrackReviewerPacketPublicSummary, getTrackReviewerPacketRoute } from "@/lib/track-reviewer-packets";

export type SiteSearchItem = {
  title: string;
  href: string;
  category: "Route" | "Track" | "Document" | "Proof" | "Service" | "Proposal";
  summary: string;
  matchKind?: "profile-aware" | "track-aware" | "profile + track";
};

type ProfileAwareSearchRule = {
  keywords: string[];
  leadItems: SiteSearchItem[];
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

export const siteSearchItems: SiteSearchItem[] = [
  {
    title: "Start",
    href: "/start",
    category: "Route",
    summary: "Guided onboarding, wallet-first flow, and easiest entry for normal users.",
  },
  {
    title: "Story Video",
    href: "/story",
    category: "Route",
    summary: "Hosted product reel for judges, users, and sponsors.",
  },
  {
    title: "Community",
    href: "/community",
    category: "Route",
    summary: "Join Discord, follow product updates, open pilot interest, and route into support or operator paths.",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    category: "Route",
    summary: "Governance dashboard with proposal cards, treasury data, and execution visibility.",
  },
  {
    title: "Command Center",
    href: "/command-center",
    category: "Route",
    summary: "Create, vote, execute, and track proposal confidence in one workspace.",
  },
  {
    title: "Proof Center",
    href: "/proof",
    category: "Proof",
    summary: "Baseline proof, V3 proof, runtime evidence, and reviewer entrypoints.",
  },
  {
    title: "Security",
    href: "/security",
    category: "Proof",
    summary: "ZK matrix, confidence engine, policy composer, and hardening surfaces.",
  },
  {
    title: "Intelligence",
    href: "/intelligence",
    category: "Route",
    summary: "Proposal Analyzer, Treasury Risk AI, Voting Summary, RPC Analyzer, and Gaming AI in one operational layer.",
  },
  {
    title: "Diagnostics",
    href: "/diagnostics",
    category: "Route",
    summary: "Runtime health, readiness, reviewer bundle, and devnet operational evidence.",
  },
  {
    title: "Services",
    href: "/services",
    category: "Service",
    summary: "Pilot, API, RPC, enterprise governance, and hosted operational packages.",
  },
  {
    title: "Tracks",
    href: "/tracks",
    category: "Track",
    summary: "Submission corridor center across Frontier, runtime infrastructure, confidential governance, grants, and adjacent reviewer opportunities.",
  },
  {
    title: "Frontier Primary Workspace",
    href: "/tracks/colosseum-frontier",
    category: "Track",
    summary: "Primary first-place startup-quality submission chain for the Frontier Hackathon.",
  },
  {
    title: "Assistant",
    href: "/assistant",
    category: "Route",
    summary: "Internal product guide for finding the best route, proof packet, or submission path fast.",
  },
  {
    title: "Documents",
    href: "/documents",
    category: "Document",
    summary: "Curated reviewer and trust document library inside the product.",
  },
  {
    title: "Custody",
    href: "/custody",
    category: "Route",
    summary: "Strict custody evidence ingestion workspace for multisig, timelock, signer roster, and authority-transfer proof.",
  },
  {
    title: "Canonical Custody Proof",
    href: "/documents/canonical-custody-proof",
    category: "Document",
    summary: "Repo-backed custody truth packet with exact pending items, observed readouts, and explorer-linked closure points.",
  },
  {
    title: "Custody Proof Reviewer Packet",
    href: "/documents/custody-proof-reviewer-packet",
    category: "Document",
    summary: "Reviewer-facing custody packet that condenses what is proven now, what is still pending, and the strict ingestion route.",
  },
  {
    title: "Treasury Reviewer Packet",
    href: "/documents/treasury-reviewer-packet",
    category: "Document",
    summary: "Generated treasury-facing reviewer packet with strict sender checklist, reference-linked rails, reviewer truth links, payments fit, and exact blocker visibility.",
  },
  {
    title: "Reviewer Telemetry Packet",
    href: "/documents/reviewer-telemetry-packet",
    category: "Document",
    summary: "Reviewer-safe packet for telemetry, hosted reads, runtime evidence, and infrastructure-facing product value.",
  },
  {
    title: "Strategic Opportunity Readiness",
    href: "/documents/strategic-opportunity-readiness-2026",
    category: "Document",
    summary: "Opportunity map for startup accelerator, regional grants, data and telemetry, confidential payout, and hardening-first corridors around the Frontier cycle.",
  },
  {
    title: "Ecosystem Focus Alignment",
    href: "/documents/ecosystem-focus-alignment",
    category: "Document",
    summary: "Reviewer-safe mapping from the live product into decentralisation, censorship resistance, DAO tooling, education, developer tooling, payments, and selective cause-driven fit.",
  },
  {
    title: "Multisig Setup Intake",
    href: "/documents/multisig-setup-intake",
    category: "Document",
    summary: "Canonical intake shape for signer keys, multisig address, timelock, and authority-transfer evidence.",
  },
  {
    title: "Confidential Governance Workspace",
    href: "/tracks/privacy-track",
    category: "Track",
    summary: "Confidential-governance submission bundle and validation steps.",
  },
  {
    title: "Live App Workspace",
    href: "/tracks/eitherway-live-dapp",
    category: "Track",
    summary: "Wallet-first live app corridor for buyer-facing demos and polished product flow.",
  },
  {
    title: "Runtime Infrastructure Workspace",
    href: "/tracks/rpc-infrastructure",
    category: "Track",
    summary: "Hosted read path, diagnostics, runtime evidence, and Fast RPC packaging.",
  },
  {
    title: "Wallet-First Product Workspace",
    href: "/tracks/consumer-apps",
    category: "Track",
    summary: "Best path for normal users, onboarding, clarity, and consumer-grade UX.",
  },
  {
    title: "Frontend Execution Workspace",
    href: "/tracks/100xdevs",
    category: "Track",
    summary: "Frontend excellence, route architecture, deployment discipline, and polished shell.",
  },
  {
    title: "Cryptographic Confidence Engine",
    href: "/documents/cryptographic-confidence-engine",
    category: "Document",
    summary: "Deterministic scoring for ZK, REFHE, MagicBlock, Fast RPC, and governance posture.",
  },
  {
    title: "Proposal Analyzer",
    href: "/intelligence#proposal-analyzer",
    category: "Service",
    summary: "Pre-vote proposal risk analysis for amount size, recipient novelty, timelock strength, and treasury framing.",
  },
  {
    title: "Treasury Risk AI",
    href: "/intelligence#treasury-risk-ai",
    category: "Service",
    summary: "Treasury anomaly review for large payouts, repeated attempts, short execution delays, and new recipients.",
  },
  {
    title: "Voting Summary",
    href: "/intelligence#voting-summary",
    category: "Service",
    summary: "Compress governance discussion into support, concern, and execution-safety signals.",
  },
  {
    title: "RPC Analyzer",
    href: "/intelligence#rpc-analyzer",
    category: "Service",
    summary: "Turn latency, success rate, error rate, and retry pressure into a readable RPC health posture.",
  },
  {
    title: "Gaming AI",
    href: "/intelligence#gaming-ai",
    category: "Service",
    summary: "Evaluate reward changes, payout fan-out, and clan impact before game-governance rollout.",
  },
  {
    title: "ZK Capability Matrix",
    href: "/documents/zk-capability-matrix",
    category: "Document",
    summary: "What the ZK stack proves today, how it is verified, and what is not claimed.",
  },
  {
    title: "Live Proof V3",
    href: "/documents/live-proof-v3",
    category: "Proof",
    summary: "Dedicated additive hardening proof for Governance V3 and Settlement V3.",
  },
  {
    title: "Trust Package",
    href: "/documents/trust-package",
    category: "Document",
    summary: "High-signal trust packet for buyers, judges, and operators.",
  },
  {
    title: "Authority Hardening for Mainnet",
    href: "/documents/authority-hardening-mainnet",
    category: "Document",
    summary: "Multisig, upgrade authority, treasury authority, and admin-boundary discipline before Mainnet.",
  },
  {
    title: "Incident Readiness Runbook",
    href: "/documents/incident-readiness-runbook",
    category: "Document",
    summary: "Monitoring, alerts, logs, and operator response loop for RPC, wallet, and governance failures.",
  },
];

const profileAwareSearchRules: ProfileAwareSearchRule[] = [
  {
    keywords: ["pilot funding"],
    leadItems: [
      {
        title: "Pilot Funding Bundle",
        href: "/tracks/colosseum-frontier?profile=pilot-funding",
        category: "Track",
        summary:
          "Start with the Colosseum pilot route. Inside the track, the first surfaces are ordered for pilot funding: submission path, coach and alignment, then trust and proof.",
      },
      {
        title: "Pilot Funding Intake",
        href: "/engage?profile=pilot-funding",
        category: "Route",
        summary:
          "Open the buyer path with pilot funding preselected, then continue into the live track route with proof and trust already aligned.",
      },
    ],
  },
  {
    keywords: ["treasury top-up", "treasury top up", "top-up", "top up"],
    leadItems: [
      {
        title: "Treasury Top-up Bundle",
        href: "/tracks/rpc-infrastructure?profile=treasury-top-up",
        category: "Track",
        summary:
          "Start with the RPC track. Services, commercialization, and mainnet gates are intentionally raised before deeper proof reading for treasury capitalization.",
      },
      {
        title: "Treasury Top-up Intake",
        href: "/engage?profile=treasury-top-up",
        category: "Route",
        summary:
          "Open the treasury capitalization path with treasury top-up preselected, then continue into services and trust without a generic payments detour.",
      },
    ],
  },
  {
    keywords: ["vendor payout"],
    leadItems: [
      {
        title: "Vendor Payout Bundle",
        href: "/tracks/eitherway-live-dapp?profile=vendor-payout",
        category: "Track",
        summary:
          "Start with the live dApp track. The ordered surfaces emphasize submission path, metrics and diagnostics, then custody and trust for governed vendor execution.",
      },
      {
        title: "Vendor Payout Intake",
        href: "/engage?profile=vendor-payout",
        category: "Route",
        summary:
          "Open the governed vendor payout lane directly, then move into execution, diagnostics, and trust without a generic search flow.",
      },
    ],
  },
  {
    keywords: ["contributor payout"],
    leadItems: [
      {
        title: "Contributor Payout Bundle",
        href: "/tracks/consumer-apps?profile=contributor-payout",
        category: "Track",
        summary:
          "Start with the consumer track. The ordered surfaces emphasize submission path, metrics, then custody and trust for governed contributor funding.",
      },
      {
        title: "Contributor Payout Intake",
        href: "/engage?profile=contributor-payout",
        category: "Route",
        summary:
          "Open the governed contributor payout lane directly, then move into command, trust, and policy-aligned funding without a generic payments detour.",
      },
    ],
  },
];

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

function getProfileTrackLeadItems(query: string): SiteSearchItem[] {
  const normalized = query.trim().toLowerCase();
  const profile = detectTreasuryProfile(normalized);
  const workspace = findCompetitionWorkspace(normalized);

  if (!profile || !workspace) return [];

  if (profile === "pilot-funding") {
    return [
      {
        title: `Pilot Funding Route - ${getCompetitionLaneLabel(workspace.slug)}`,
        href: `/tracks/${workspace.slug}?profile=pilot-funding`,
        category: "Track",
        matchKind: "profile + track",
        summary:
          "Profile-aware track route. First surfaces: submission path, coach and alignment, then trust and proof.",
      },
      {
        title: "Pilot Funding Intake",
        href: "/engage?profile=pilot-funding",
        category: "Route",
        matchKind: "profile-aware",
        summary: "Commercial qualification route with pilot funding preselected.",
      },
    ];
  }

  if (profile === "treasury-top-up") {
    return [
      {
        title: `Treasury Top-up Route - ${getCompetitionLaneLabel(workspace.slug)}`,
        href: `/tracks/${workspace.slug}?profile=treasury-top-up`,
        category: "Track",
        matchKind: "profile + track",
        summary:
          "Profile-aware capitalization route. First surfaces: commercialization, investment case, and mainnet gates.",
      },
      {
        title: "Treasury Top-up Intake",
        href: "/engage?profile=treasury-top-up",
        category: "Route",
        matchKind: "profile-aware",
        summary: "Treasury capitalization route with top-up context preselected.",
      },
    ];
  }

  if (profile === "vendor-payout") {
    return [
      {
        title: `Vendor Payout Route - ${getCompetitionLaneLabel(workspace.slug)}`,
        href: `/tracks/${workspace.slug}?profile=vendor-payout`,
        category: "Track",
        matchKind: "profile + track",
        summary:
          "Profile-aware vendor payout route. First surfaces: submission path, metrics and diagnostics, then custody and trust.",
      },
      {
        title: "Vendor Payout Intake",
        href: "/engage?profile=vendor-payout",
        category: "Route",
        matchKind: "profile-aware",
        summary: "Governed vendor payout route with execution context preselected.",
      },
    ];
  }

  return [
    {
      title: `Contributor Payout Route - ${getCompetitionLaneLabel(workspace.slug)}`,
      href: `/tracks/${workspace.slug}?profile=contributor-payout`,
      category: "Track",
      matchKind: "profile + track",
      summary:
        "Profile-aware contributor payout route. First surfaces: submission path, metrics, then custody and trust.",
    },
    {
      title: "Contributor Payout Intake",
      href: "/engage?profile=contributor-payout",
      category: "Route",
      matchKind: "profile-aware",
      summary: "Governed contributor payout route with funding context preselected.",
    },
  ];
}

function getTrackAwareLeadItems(query: string): SiteSearchItem[] {
  const normalized = query.trim().toLowerCase();
  const profile = detectTreasuryProfile(normalized);
  const workspace = findCompetitionWorkspace(normalized);

  if (!workspace || profile) return [];

  return [
    {
      title: `${getCompetitionLaneLabel(workspace.slug)} Route`,
      href: `/tracks/${workspace.slug}`,
      category: "Track",
      matchKind: "track-aware",
      summary:
        "Track-aware result. Open the matching workspace directly, then follow the track-specific proof, trust, and demo bundle from the top capsule.",
    },
  ];
}

function getStrategicOpportunityLeadItems(query: string): SiteSearchItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const strategicRules = [
    {
      keywords: ["startup accelerator", "accelerator grant", "startup grant"],
      item: {
        title: "Startup Capital Corridor",
        href: "/documents/strategic-opportunity-readiness-2026",
        category: "Document" as const,
        summary:
          "Start from the strategic opportunity map, then open services and the custody reviewer packet for the startup-capital route.",
        matchKind: "track-aware" as const,
      },
    },
    {
      keywords: ["poland grant", "regional grant", "poland grants"],
      item: {
        title: "Regional Grant Corridor",
        href: "/documents/strategic-opportunity-readiness-2026",
        category: "Document" as const,
        summary:
          "Open the regional grant corridor first, then use awards, the Frontier primary workspace, and launch trust as the proof chain.",
        matchKind: "track-aware" as const,
      },
    },
    {
      keywords: ["dune data", "dune analytics", "data sidetrack", "data side track"],
      item: {
        title: "Data And Telemetry Corridor",
        href: "/documents/strategic-opportunity-readiness-2026",
        category: "Document" as const,
        summary:
          "Open the telemetry corridor first, then continue into diagnostics, analytics, and frontier integrations for the runtime story.",
        matchKind: "track-aware" as const,
      },
    },
    {
      keywords: ["umbra", "confidential payout", "private payout"],
      item: {
        title: "Confidential Payout Corridor",
        href: "/documents/strategic-opportunity-readiness-2026",
        category: "Document" as const,
        summary:
          "Open the confidential payout corridor first, then continue into security, services, custody, and reviewer-safe grant governance.",
        matchKind: "track-aware" as const,
      },
    },
    {
      keywords: ["adevar", "audit bounty", "hardening bounty", "security bounty"],
      item: {
        title: "Audit And Hardening Corridor",
        href: "/documents/strategic-opportunity-readiness-2026",
        category: "Document" as const,
        summary:
          "Open the hardening corridor first, then continue into canonical custody proof, authority hardening, incident readiness, and diagnostics.",
        matchKind: "track-aware" as const,
      },
    },
  ];

  const match = strategicRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  return match ? [match.item] : [];
}

function getProposalLeadItems(query: string): SiteSearchItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

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
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  return scored.map(({ proposal }) => ({
    title: `${proposal.id} · ${proposal.title}`,
    href: `/command-center?proposal=${encodeURIComponent(proposal.id)}`,
    category: "Proposal",
    summary: `${proposal.status} · ${proposal.execution.amountDisplay} · ${proposal.execution.recipientLabel}. Open the command center with this live indexed proposal preselected.`,
  }));
}

function getCustodyLeadItems(query: string): SiteSearchItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

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
    return [];
  }

  return [
    {
      title: "Custody Proof Reviewer Packet",
      href: "/documents/custody-proof-reviewer-packet",
      category: "Document",
      summary:
        "Start here for reviewer-facing custody truth. It condenses what is externally proven now, what is still pending, and the exact strict ingestion route.",
    },
    {
      title: "Canonical Custody Proof",
      href: "/documents/canonical-custody-proof",
      category: "Document",
      summary:
        "Open the canonical custody truth packet next for exact pending items, exact blocker, and explorer-linked closure points.",
    },
    {
      title: "Custody Workspace",
      href: "/custody",
      category: "Route",
      summary:
        "Open the strict custody workspace to build the signer and transfer packet in the exact repo-safe intake shape.",
    },
  ];
}

function getTrackReviewerPacketLeadItems(query: string): SiteSearchItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const packetRules = [
    {
      keywords: ["privacy reviewer packet", "privacy packet", "privacy judge packet"],
      title: getTrackReviewerPacketPublicLabel("privacy-track"),
      href: getTrackReviewerPacketRoute("privacy-track"),
      summary: getTrackReviewerPacketPublicSummary("privacy-track"),
    },
    {
      keywords: ["rpc reviewer packet", "rpc packet", "infrastructure reviewer packet", "infrastructure packet"],
      title: getTrackReviewerPacketPublicLabel("rpc-infrastructure"),
      href: getTrackReviewerPacketRoute("rpc-infrastructure"),
      summary: getTrackReviewerPacketPublicSummary("rpc-infrastructure"),
    },
    {
      keywords: ["colosseum packet", "colosseum reviewer packet", "frontier packet", "frontier reviewer packet"],
      title: getTrackReviewerPacketPublicLabel("colosseum-frontier"),
      href: getTrackReviewerPacketRoute("colosseum-frontier"),
      summary: getTrackReviewerPacketPublicSummary("colosseum-frontier"),
    },
  ];

  const match = packetRules.find((rule) => rule.keywords.some((keyword) => normalized.includes(keyword)));
  if (!match) return [];

  return [
    {
      title: match.title,
      href: match.href,
      category: "Document",
      summary: match.summary,
      matchKind: "track-aware",
    },
  ];
}

function getTelemetryLeadItems(query: string): SiteSearchItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const telemetryTerms = [
    "telemetry packet",
    "reviewer telemetry",
    "hosted read proof",
    "data corridor",
    "analytics packet",
    "runtime telemetry",
    "dune data",
    "dune analytics",
  ];

  if (!telemetryTerms.some((term) => normalized.includes(term))) {
    return [];
  }

  return [
    {
      title: "Reviewer Telemetry Packet",
      href: "/documents/reviewer-telemetry-packet",
      category: "Document",
      summary:
        "Start here for reviewer-safe telemetry. It connects diagnostics, analytics, hosted-read proof, and runtime evidence in one corridor.",
      matchKind: "track-aware",
    },
    {
      title: "Diagnostics",
      href: "/diagnostics",
      category: "Route",
      summary:
        "Operational diagnostics, runtime checks, and reviewer bundle health for infrastructure-facing review.",
      matchKind: "track-aware",
    },
    {
      title: "Analytics",
      href: "/analytics",
      category: "Route",
      summary:
        "Export-ready analytics summaries for votes, proposals, treasury operations, and data-side readiness.",
      matchKind: "track-aware",
    },
  ];
}

export function getSiteSearchResults(query: string): SiteSearchItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return siteSearchItems;

  const trackReviewerPacketLeadItems = getTrackReviewerPacketLeadItems(normalized);
  const custodyLeadItems = getCustodyLeadItems(normalized);
  const telemetryLeadItems = getTelemetryLeadItems(normalized);
  const strategicOpportunityLeadItems = getStrategicOpportunityLeadItems(normalized);
  const profileTrackLeadItems = getProfileTrackLeadItems(normalized);
  const trackAwareLeadItems = getTrackAwareLeadItems(normalized);
  const proposalLeadItems = getProposalLeadItems(normalized);

  const profileAwareLeadItems =
    profileAwareSearchRules.find((rule) =>
      rule.keywords.some((keyword) => normalized.includes(keyword)),
    )?.leadItems.map((item) => ({
      ...item,
      matchKind: item.matchKind ?? "profile-aware",
    })) ?? [];

  const generalResults = siteSearchItems.filter((item) =>
    [item.title, item.summary, item.category].some((field) =>
      field.toLowerCase().includes(normalized),
    ),
  );

  const seen = new Set<string>();
  return [...trackReviewerPacketLeadItems, ...custodyLeadItems, ...telemetryLeadItems, ...strategicOpportunityLeadItems, ...profileTrackLeadItems, ...trackAwareLeadItems, ...proposalLeadItems, ...profileAwareLeadItems, ...generalResults].filter((item) => {
    const key = `${item.category}:${item.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
