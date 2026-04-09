export type ProposalStatus =
  | "Live voting"
  | "Ready to reveal"
  | "Timelocked"
  | "Execution ready"
  | "Evidence gated";

export type ProposalCardModel = {
  id: string;
  title: string;
  type: string;
  status: ProposalStatus;
  quorum: string;
  window: string;
  treasury: string;
  privacy: string;
  tech: string[];
  summary: string;
};

export const daoSummary = {
  name: "PrivateDAO Frontier Council",
  network: "Solana Devnet",
  treasuryValue: "$2.84M",
  activeMembers: "164",
  livePolicies: "Governance V3 + Settlement V3",
  reviewerState: "Live proof and runtime evidence available",
};

export const topMetrics = [
  {
    label: "Live proofs",
    value: "2",
    detail: "Baseline proof and dedicated V3 proof packet are both reviewer-facing",
  },
  {
    label: "ZK anchors",
    value: "3",
    detail: "On-chain proof anchors exposed in the Devnet evidence path",
  },
  {
    label: "Wallets",
    value: "50",
    detail: "Multi-wallet Devnet rehearsal already captured and packaged",
  },
  {
    label: "Commercial rails",
    value: "4",
    detail: "Grant, fund, gaming, and enterprise service packs remain part of the UI",
  },
];

export const proposalCards: ProposalCardModel[] = [
  {
    id: "PDAO-104",
    title: "Confidential payroll batch / April",
    type: "Enterprise DAO",
    status: "Execution ready",
    quorum: "Token supply quorum snapshot captured",
    window: "Commit closed · Reveal complete",
    treasury: "0.05 SOL demo payout plus encrypted manifest",
    privacy: "Commit-reveal + REFHE envelope",
    tech: ["ZK", "REFHE", "Fast RPC"],
    summary:
      "Payroll proposal with encrypted manifest binding, reviewer-visible readiness checks, and evidence-bound execution.",
  },
  {
    id: "PDAO-105",
    title: "Gaming rewards private corridor",
    type: "Gaming DAO",
    status: "Evidence gated",
    quorum: "Private voting live",
    window: "Reveal still open",
    treasury: "Token reward corridor waiting on settlement",
    privacy: "Commit-reveal + MagicBlock settlement",
    tech: ["MagicBlock", "Fast RPC"],
    summary:
      "Private token distribution stays blocked until proposal-scoped settlement evidence matures and corridor execution is bound.",
  },
  {
    id: "PDAO-106",
    title: "Grant committee tranche approval",
    type: "Grant Committee",
    status: "Live voting",
    quorum: "Supply-based quorum policy active",
    window: "Commit open · 17h remaining",
    treasury: "Reviewer-friendly USDC-equivalent grant tranche",
    privacy: "Commit-reveal + optional ZK review path",
    tech: ["ZK", "Fast RPC"],
    summary:
      "Grant committee flow optimized for private signal collection with a strong reviewer path and generated evidence surfaces.",
  },
];

export const treasuryRows = [
  {
    asset: "SOL treasury",
    allocation: "42%",
    value: "$1.18M",
    policy: "Timelocked execution / onchain treasury PDA",
    runtime: "Live",
  },
  {
    asset: "Confidential payroll reserve",
    allocation: "23%",
    value: "$648k",
    policy: "REFHE envelope + execution snapshot",
    runtime: "Gated",
  },
  {
    asset: "Gaming rewards corridor",
    allocation: "19%",
    value: "$533k",
    policy: "MagicBlock settlement evidence",
    runtime: "Pending evidence",
  },
  {
    asset: "Strategic grants",
    allocation: "16%",
    value: "$451k",
    policy: "Governance V3 + live proof bundle",
    runtime: "Live",
  },
];

export const timelineEvents = [
  {
    title: "DAO bootstrap",
    detail: "Create DAO, treasury, policy companions, and migration-safe governance defaults.",
    state: "Completed",
  },
  {
    title: "Private vote",
    detail: "Commit-reveal with quorum snapshots, reveal rebate vault, and ZK review overlay when needed.",
    state: "Completed",
  },
  {
    title: "Evidence boundary",
    detail: "REFHE and MagicBlock runtime checks gate treasury execution without changing the legacy path.",
    state: "Live",
  },
  {
    title: "Execution and review",
    detail: "Execution log, Devnet proof packets, and reviewer bundles update together.",
    state: "Live",
  },
];

export const executionLog = [
  {
    label: "Create DAO",
    value: "DAO 8c6N...EvjG deployed with policy snapshotting and treasury rails.",
    status: "confirmed",
  },
  {
    label: "Submit proposal",
    value: "Proposal 6rSb...KqpG recorded with encrypted manifest binding and service-fit guidance.",
    status: "confirmed",
  },
  {
    label: "Private vote",
    value: "Commit and reveal completed with generated runtime evidence and reviewer path.",
    status: "confirmed",
  },
  {
    label: "Execute treasury",
    value: "0.05 SOL devnet execution completed with explicit proof and settlement packet linkage.",
    status: "confirmed",
  },
];

export const techCards = [
  {
    name: "ZK Layer",
    description:
      "Companion proof surfaces, reviewer packets, and additive hardening flows for sensitive governance paths.",
  },
  {
    name: "REFHE",
    description:
      "Encrypted envelope path for payroll and bonus flows where confidential computation boundaries matter.",
  },
  {
    name: "MagicBlock",
    description:
      "Proposal-scoped token corridor and settlement evidence for private distribution workflows.",
  },
  {
    name: "Fast RPC",
    description:
      "Backend-indexed pooled reads, diagnostics, and proof surfaces so the app feels operational rather than static.",
  },
];

export const servicePacks = [
  {
    name: "Grant Committee",
    fit: "Private committee decisions and public treasury accountability",
    cta: "Start reviewer-safe grant governance",
  },
  {
    name: "Fund Governance",
    fit: "ZK-heavy review rails for sensitive capital allocation",
    cta: "Run private fund governance with stronger review surfaces",
  },
  {
    name: "Gaming DAO",
    fit: "Reward distribution and token-native operations with corridor evidence",
    cta: "Launch private gaming treasury operations",
  },
  {
    name: "Enterprise DAO",
    fit: "Payroll, bonus, and operator trust packaging for real teams",
    cta: "Deploy private internal treasury operations",
  },
];

export const commercialServices = [
  {
    title: "Hosted Read API + Ops",
    summary:
      "Serve governance state, runtime evidence, and diagnostics through a cleaner operational API layer.",
  },
  {
    title: "Pilot Package",
    summary:
      "Week-by-week rollout with trust packet, SLA framing, and buyer-friendly onboarding.",
  },
  {
    title: "Confidential Operations Premium",
    summary:
      "Add encrypted payout boundaries, V3 hardening, and reviewer-ready execution evidence.",
  },
];

export const proofPackets = [
  {
    title: "Live proof",
    summary: "Canonical Devnet create → vote → execute flow with public reviewer links.",
    href: "https://x-pact.github.io/PrivateDAO/?page=proof&judge=1",
    cta: "Open judge view",
  },
  {
    title: "Live proof V3",
    summary: "Dedicated additive hardening proof for Governance V3 and Settlement V3.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/test-wallet-live-proof-v3.generated.md",
    cta: "Open V3 packet",
  },
  {
    title: "Frontier integrations",
    summary: "ZK, REFHE, MagicBlock, backend-indexed reads, and runtime evidence in one surface.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/frontier-integrations.generated.md",
    cta: "Open integrations packet",
  },
  {
    title: "Audit packet",
    summary: "Reviewer and launch artifacts tied together with generated attestations.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/audit-packet.generated.md",
    cta: "Open audit packet",
  },
];

export const securitySurfaces = [
  {
    title: "Governance Hardening V3",
    body: "Token-supply quorum mode, policy snapshots, and reveal rebate vaults stay additive and versioned.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/governance-hardening-v3.md",
  },
  {
    title: "Settlement Hardening V3",
    body: "Payout caps, evidence aging, REFHE/MagicBlock requirements, and single-use settlement consumption semantics.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/settlement-hardening-v3.md",
  },
  {
    title: "Mainnet blockers",
    body: "The app keeps launch boundaries honest: what is live now, what is pending-external, and what still needs custody/audit work.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/mainnet-blockers.md",
  },
];

export const servicesJourney = [
  {
    title: "Pilot Program",
    detail: "Week-by-week rollout packet for teams that want guided adoption rather than a raw protocol integration.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/pilot-program.md",
  },
  {
    title: "Service Level Agreement",
    detail: "Operational framing for hosted reads, response expectations, and trust boundaries.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/service-level-agreement.md",
  },
  {
    title: "Pricing Model",
    detail: "Commercial packaging for API, ops, and confidential governance support without hiding the technical stack.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/pricing-model.md",
  },
  {
    title: "Trust Package",
    detail: "A buyer-readable path into proof packets, runtime evidence, and launch readiness boundaries.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/trust-package.md",
  },
];

export const analyticsSeries = {
  votes: [
    { name: "Mon", commits: 14, reveals: 9 },
    { name: "Tue", commits: 20, reveals: 14 },
    { name: "Wed", commits: 31, reveals: 25 },
    { name: "Thu", commits: 26, reveals: 21 },
    { name: "Fri", commits: 38, reveals: 33 },
    { name: "Sat", commits: 22, reveals: 18 },
  ],
  treasury: [
    { name: "Confidential payroll", value: 41 },
    { name: "Gaming corridor", value: 24 },
    { name: "Grant payouts", value: 19 },
    { name: "Ops reserve", value: 16 },
  ],
  proposals: [
    { month: "Jan", proposals: 8, executed: 5 },
    { month: "Feb", proposals: 11, executed: 7 },
    { month: "Mar", proposals: 14, executed: 10 },
    { month: "Apr", proposals: 17, executed: 12 },
  ],
};

export const awards = [
  {
    label: "Recognition",
    value: "1st Place - Superteam Poland",
  },
  {
    label: "What shipped",
    value: "Private governance, treasury evidence, and buyer-ready product surfaces",
  },
  {
    label: "Why it matters",
    value: "The product is reviewer-facing, operator-friendly, and additive to existing protocol rails",
  },
];
