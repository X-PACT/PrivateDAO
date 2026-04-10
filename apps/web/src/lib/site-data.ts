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

export const productCorridors = [
  {
    name: "PrivateDAO Core",
    audience: "Private treasury teams and internal governance operators",
    summary:
      "The main governance system for private proposals, treasury execution, reviewer-visible evidence, and additive V3 hardening.",
    technologies: ["ZK", "REFHE", "Governance V3", "Settlement V3"],
    href: "/command-center",
    cta: "Open core governance rail",
  },
  {
    name: "Realms Compatibility Rail",
    audience: "Teams that need a familiar committee and council posture",
    summary:
      "A compatibility-facing surface for organizations that still think in Realms-style committees but need stronger privacy, proof, and operational rails.",
    technologies: ["ZK review", "Fast RPC", "Reviewer docs"],
    href: "/documents/reviewer-fast-path",
    cta: "Open reviewer compatibility rail",
  },
  {
    name: "Android Native",
    audience: "Mobile-first operators and signer workflows",
    summary:
      "A mobile and Android-facing runtime path for wallet access, reviewer journeys, and diagnostics without pretending the product is desktop-only.",
    technologies: ["Wallet UX", "Diagnostics", "Fast RPC"],
    href: "/viewer/android-native",
    cta: "Open Android runtime surface",
  },
  {
    name: "Gaming DAO Corridor",
    audience: "Reward programs, tournaments, and token-native communities",
    summary:
      "MagicBlock-backed evidence corridors for reward distribution and proposal-scoped settlement logic where responsiveness matters.",
    technologies: ["MagicBlock", "Settlement V3", "Proof"],
    href: "/services",
    cta: "Open gaming corridor",
  },
  {
    name: "Read API + RPC",
    audience: "Builders, operators, and hosted governance consumers",
    summary:
      "A commercial and operational surface for hosted reads, diagnostics, API-facing ops, and buyer-friendly product packaging.",
    technologies: ["Fast RPC", "Hosted Read API", "Ops"],
    href: "/services",
    cta: "Open API and RPC surface",
  },
];

export const competitionTracks = [
  {
    title: "Privacy Track",
    sponsor: "MagicBlock and privacy-aligned partners",
    fit: "Strong",
    status: "Submission-ready with stronger live surface",
    summary:
      "PrivateDAO is already strongest where private voting, ZK review, REFHE envelopes, MagicBlock corridors, and reviewer-visible evidence converge.",
    edge: "This is the most natural track for the current protocol, security story, and additive V3 hardening posture.",
    gap: "The biggest remaining upside is sharper problem framing and a cleaner end-user story per use case.",
    action: "Lead with PrivateDAO Core, Gaming DAO Corridor, ZK Matrix, and the confidence engine in the demo and deck.",
    href: "/security",
    sourceUrl: "https://superteam.fun/earn/listing/privacy-track-colosseum-hackathon-powered-by-magicblock-st-my-and-sns",
  },
  {
    title: "Build a Live dApp with Solflare, Kamino, DFlow, or QuickNode",
    sponsor: "Eitherway App",
    fit: "Strong with one partner-facing flow",
    status: "Needs explicit integration narrative",
    summary:
      "The app is live and operational already, but this track gets stronger when one concrete partner-facing flow is surfaced around wallet UX, live dApp behavior, and infrastructure.",
    edge: "PrivateDAO already has wallet adapter, operational UI, and live proof surfaces; the highest-value uplift is a tighter partner corridor.",
    gap: "We still need a named Eitherway-style partner path, not only generic wallet and RPC messaging.",
    action: "Add a Solflare/QuickNode partner corridor and a single live demo flow optimized for wallet-first judges.",
    href: "/services",
    sourceUrl: "https://superteam.fun/earn/listing/build-a-live-dapp-with-solflare-kamino-dflow-or-quicknode-with-eitherway-app",
  },
  {
    title: "RPC Infrastructure Credits",
    sponsor: "RPC infrastructure sponsors",
    fit: "Very strong",
    status: "Submission-ready",
    summary:
      "Fast RPC, diagnostics, hosted reads, and reviewer-facing runtime surfaces are already part of the product story and commercial rails.",
    edge: "The project already sells hosted read API plus ops, not just protocol theory.",
    gap: "The API and RPC buyer journey can be made even more explicit in a dedicated partner section.",
    action: "Lead with the Read API + RPC corridor, diagnostics page, and hosted read commercial surfaces.",
    href: "/services",
    sourceUrl: "https://superteam.fun/earn/listing/dollar10000-in-rpc-infrastructure-credits-for-colosseum-frontier-hackathon",
  },
  {
    title: "Consumer Apps Track",
    sponsor: "TokenTon26",
    fit: "Moderate to strong",
    status: "Needs more consumer-first framing",
    summary:
      "The frontend is now much stronger, but this track wants the app to feel intuitive to normal users, not only operators and reviewers.",
    edge: "The new operational shell and corridors already move the project closer to consumer-grade clarity.",
    gap: "We still need even more direct first-run onboarding and clearer route labels for non-technical users.",
    action: "Lead with the buyer journey, command center, and solution corridors while tightening first-run wallet onboarding.",
    href: "/command-center",
    sourceUrl: "https://superteam.fun/earn/listing/tokenton26-consumer-apps-track-dollar8500-prize-pool",
  },
  {
    title: "Ranger Main Track",
    sponsor: "Ranger Build a Bear",
    fit: "Strong",
    status: "Submission-ready with sharper positioning",
    summary:
      "PrivateDAO already reads as serious infra: governance, evidence, trust packaging, and live runtime surfaces are all present.",
    edge: "This track rewards integrated products, and the project already combines protocol, ops, review, and commercial layers.",
    gap: "The submission should foreground the product thesis faster, with less reviewer jargon in the opening narrative.",
    action: "Lead with the operational shell, product corridors, awards, and proof-to-execution continuity.",
    href: "/awards",
    sourceUrl: "https://superteam.fun/earn/listing/ranger-build-a-bear-hackathon-main-track",
  },
  {
    title: "Ranger Drift Side Track",
    sponsor: "Ranger / Drift",
    fit: "Moderate",
    status: "Needs trading-specific thesis",
    summary:
      "The governance and confidential execution rails are strong, but this track gets stronger if tied to treasury strategy, risk policy, or capital allocation workflows.",
    edge: "The confidence engine and V3 policy surfaces can be adapted into a stronger capital-governance narrative.",
    gap: "No explicit Drift or treasury trading corridor is productized yet.",
    action: "Frame one treasury-operations corridor around bounded capital governance instead of generic DeFi claims.",
    href: "/analytics",
    sourceUrl: "https://superteam.fun/earn/listing/ranger-build-a-bear-hackathon-drift-side-track",
  },
  {
    title: "100xDevs Frontier Track",
    sponsor: "100xDevs",
    fit: "Strong",
    status: "Submission-ready",
    summary:
      "This track benefits from end-to-end product quality, and the app now has a strong operational shell, multi-page architecture, and live surface.",
    edge: "The migration from static docs-style pages to a professional Next.js product UI is now a real differentiator.",
    gap: "The narrative should emphasize developer execution quality and end-user polish more directly.",
    action: "Lead with the Next.js operational shell, wallet UX, and track-ready documentation stack.",
    href: "/dashboard",
    sourceUrl: "https://superteam.fun/earn/listing/100xdevs-frontier-hackathon-track",
  },
  {
    title: "Encrypt / IKA Frontier",
    sponsor: "Encrypt / IKA",
    fit: "Strong",
    status: "Submission-ready with encrypted narrative emphasis",
    summary:
      "The project already has a legitimate encrypted operations thesis thanks to REFHE, ZK, reviewer packets, and explicit security boundaries.",
    edge: "Few submissions can tell a coherent privacy story across governance, settlement, review, and product packaging.",
    gap: "The encrypted AI angle, if needed, must remain truth-aligned and not overstate current capabilities.",
    action: "Lead with confidential payroll, encrypted envelopes, and the cryptographic confidence engine as interpretation, not magic.",
    href: "/security",
    sourceUrl: "https://superteam.fun/earn/listing/encrypt-ika-frontier-april-2026",
  },
  {
    title: "SolRouter Ship with Encrypted AI",
    sponsor: "SolRouter",
    fit: "Partial",
    status: "Needs explicit AI-assisted user flow",
    summary:
      "The cryptographic confidence engine is strong, but this track becomes much stronger if wrapped in a more explicit encrypted AI or assistant workflow.",
    edge: "There is already a deterministic engine and strong privacy rails to build on.",
    gap: "The current repo does not yet ship a user-facing encrypted AI route or agent surface.",
    action: "Treat this as a secondary target unless a dedicated assistant flow is added without weakening truth alignment.",
    href: "/security",
    sourceUrl: "https://superteam.fun/earn/listing/solrouter-ship-with-encrypted-ai",
  },
];

export const proofPackets = [
  {
    title: "Live proof",
    summary: "Canonical Devnet create → vote → execute flow with public reviewer links.",
    href: "/proof/?judge=1",
    cta: "Open judge view",
  },
  {
    title: "Live proof V3",
    summary: "Dedicated additive hardening proof for Governance V3 and Settlement V3.",
    href: "/documents/live-proof-v3",
    cta: "Open curated V3 packet",
  },
  {
    title: "ZK capability matrix",
    summary: "PrivateDAO-specific matrix for what the ZK stack proves today, how it is verified, and what is still explicitly not claimed.",
    href: "/documents/zk-capability-matrix",
    cta: "Open curated ZK matrix",
  },
  {
    title: "Cryptographic confidence engine",
    summary: "Deterministic scoring model for how ZK, REFHE, MagicBlock, and Fast RPC strengthen specific proposal patterns.",
    href: "/documents/cryptographic-confidence-engine",
    cta: "Open engine specification",
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
    href: "/documents/audit-packet",
    cta: "Open curated audit packet",
  },
];

export const securitySurfaces = [
  {
    title: "ZK Capability Matrix",
    body: "Layer-by-layer truth-aligned matrix for proofs, anchors, attestation, zk_enforced posture, and verifier boundaries.",
    href: "/documents/zk-capability-matrix",
  },
  {
    title: "Cryptographic Confidence Engine",
    body: "Proposal-aware scoring model for privacy depth, enforcement depth, execution integrity, and reviewer confidence across ZK, REFHE, MagicBlock, and Fast RPC.",
    href: "/documents/cryptographic-confidence-engine",
  },
  {
    title: "Governance Hardening V3",
    body: "Token-supply quorum mode, policy snapshots, and reveal rebate vaults stay additive and versioned.",
    href: "/documents/governance-hardening-v3",
  },
  {
    title: "Settlement Hardening V3",
    body: "Payout caps, evidence aging, REFHE/MagicBlock requirements, and single-use settlement consumption semantics.",
    href: "/documents/settlement-hardening-v3",
  },
  {
    title: "Mainnet blockers",
    body: "The app keeps launch boundaries honest: what is live now, what is pending-external, and what still needs custody/audit work.",
    href: "/documents/mainnet-blockers",
  },
];

export const zkMatrixHighlights = [
  {
    layer: "Vote validity",
    state: "Live off-chain",
    verifier: "prove + verify commands",
    boundary: "Additive to current protocol",
  },
  {
    layer: "Delegation authorization",
    state: "Live off-chain",
    verifier: "prove + verify commands",
    boundary: "Additive to current protocol",
  },
  {
    layer: "Tally integrity",
    state: "Live off-chain",
    verifier: "bounded tally proof",
    boundary: "Not a full hidden tally replacement",
  },
  {
    layer: "Proposal-bound proof anchors",
    state: "Live and anchored",
    verifier: "Frontier integrations + live proof V3",
    boundary: "Reviewer-facing on-chain anchoring",
  },
  {
    layer: "zk_enforced path",
    state: "Live but bounded",
    verifier: "verifier strategy + V3 proof packet",
    boundary: "Not yet the dominant production recommendation",
  },
  {
    layer: "On-chain verifier CPI",
    state: "Not implemented",
    verifier: "Not claimed",
    boundary: "Future protocol phase",
  },
];

export const confidenceEngineHighlights = [
  {
    factor: "Privacy depth",
    meaning: "Commit-reveal, ZK review overlays, REFHE envelopes, and proposal-bound proof anchors.",
  },
  {
    factor: "Enforcement depth",
    meaning: "Governance V3, Settlement V3, anchors, REFHE boundaries, and MagicBlock evidence when present.",
  },
  {
    factor: "Execution integrity",
    meaning: "Fast RPC runtime, corridor evidence, live proof, and V3 proof completeness for the chosen proposal path.",
  },
  {
    factor: "Reviewer confidence",
    meaning: "Live proof, V3 packet, audit packet, and honest launch-boundary visibility.",
  },
];

export const servicesJourney = [
  {
    title: "Pilot Program",
    detail: "Week-by-week rollout packet for teams that want guided adoption rather than a raw protocol integration.",
    href: "/documents/pilot-program",
  },
  {
    title: "Service Level Agreement",
    detail: "Operational framing for hosted reads, response expectations, and trust boundaries.",
    href: "/documents/service-level-agreement",
  },
  {
    title: "Pricing Model",
    detail: "Commercial packaging for API, ops, and confidential governance support without hiding the technical stack.",
    href: "/documents/pricing-model",
  },
  {
    title: "Trust Package",
    detail: "A buyer-readable path into proof packets, runtime evidence, and launch readiness boundaries.",
    href: "/documents/trust-package",
  },
];

export const securityTracks = [
  {
    title: "Governance Hardening V3",
    status: "Devnet-proven",
    summary:
      "Proposal-level governance snapshots, supply-based quorum mode, and reveal rebate vaults keep the path additive instead of reinterpreting legacy objects.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/governance-hardening-v3.md",
  },
  {
    title: "Settlement Hardening V3",
    status: "Devnet-proven",
    summary:
      "Payout caps, evidence aging, and proposal-scoped settlement policy snapshots keep confidential execution bounded and versioned.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/settlement-hardening-v3.md",
  },
  {
    title: "Frontier integrations",
    status: "Integrated",
    summary:
      "ZK anchors, REFHE envelopes, MagicBlock corridor evidence, and backend-indexed Fast RPC reads remain part of the product story.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/frontier-integrations.generated.md",
  },
  {
    title: "Audit and trust surfaces",
    status: "Reviewer-ready",
    summary:
      "Audit packet, trust package, launch trust packet, and mainnet blockers stay visible as product-facing security boundaries.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/audit-packet.generated.md",
  },
];

export const diagnosticsChecks = [
  {
    name: "Proof packets",
    state: "Healthy",
    detail: "Baseline and V3 proof packets are generated and linked through the reviewer bundle.",
    href: "/documents/live-proof-v3",
  },
  {
    name: "Readiness gates",
    state: "Tracked",
    detail: "Mainnet blockers, launch checklist, and release ceremony attestations remain explicit and versioned.",
    href: "/documents/mainnet-blockers",
  },
  {
    name: "Wallet runtime",
    state: "Pending external",
    detail: "Real-device runtime captures are tracked honestly and separated from simulated reviewer proof.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/wallet-runtime.md",
  },
  {
    name: "Monitoring and alerts",
    state: "Documented",
    detail: "Monitoring alerts, security review, and operator guides are packaged as operational follow-through.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/monitoring-alerts.md",
  },
];

export const diagnosticsEvents = [
  {
    title: "Generated artifacts",
    body: "Review attestation, cryptographic manifest, proof packages, and launch attestations stay regenerated together.",
  },
  {
    title: "Review bundle",
    body: "Reviewer tarball verification ensures baseline proof, V3 proof, fast-path docs, and audit packets travel together.",
  },
  {
    title: "Mainnet gate",
    body: "Readiness checks force honest launch boundaries instead of implying custody or audit completion that did not happen.",
  },
];

export const buyerJourneySteps = [
  {
    title: "Choose a product pack",
    description: "Start from grant, fund, gaming, or enterprise rails so the app can bias the governance and treasury experience correctly.",
    outcome: "The product story feels like a guided deployment, not a blank DAO console.",
  },
  {
    title: "Create and fund the DAO",
    description: "Bootstrap the DAO, treasury, governance settings, and wallet-connected runtime surfaces from one product shell.",
    outcome: "Operators understand treasury rails, review state, and service options before launching governance.",
  },
  {
    title: "Submit a private proposal",
    description: "Proposal cards keep privacy boundary, treasury path, service fit, and hardening expectations visible before a vote begins.",
    outcome: "Normal users understand what is being approved and what will be executed.",
  },
  {
    title: "Private vote and execute treasury",
    description: "Commit, reveal, evidence gates, and treasury execution remain connected to proof packets and runtime diagnostics.",
    outcome: "The product closes the loop from governance intent to reviewer-visible execution evidence.",
  },
];

export const commandCenterPacks = [
  {
    title: "Confidential Payroll",
    subtitle: "Enterprise DAO",
    summary: "Best for teams that need private payroll, bonus, and operator trust packaging with REFHE envelopes and additive governance hardening.",
    technologies: ["REFHE", "Fast RPC", "Governance V3"],
    readiness: "Execution-ready pattern",
  },
  {
    title: "Private Grant Committee",
    subtitle: "Grant Committee",
    summary: "Best for proposal review committees that need private signal collection, generated proof packets, and a reviewer-safe grant flow.",
    technologies: ["ZK", "Fast RPC", "Live proof"],
    readiness: "Reviewer-ready pattern",
  },
  {
    title: "Gaming Rewards Corridor",
    subtitle: "Gaming DAO",
    summary: "Best for token reward programs that need MagicBlock corridor evidence and proposal-scoped settlement boundaries.",
    technologies: ["MagicBlock", "Settlement V3", "Diagnostics"],
    readiness: "Evidence-gated pattern",
  },
];

export const commandCenterReferences = [
  {
    title: "Judge proof view",
    description: "Fastest reviewer path into the live proof surface.",
    href: "/proof/?judge=1",
  },
  {
    title: "Dedicated V3 proof",
    description: "Governance V3 and Settlement V3 proof packet for the additive hardening path.",
    href: "/documents/live-proof-v3",
  },
  {
    title: "Frontier integrations",
    description: "ZK, REFHE, MagicBlock, and Fast RPC reviewer packet.",
    href: "/documents/frontier-integrations",
  },
  {
    title: "Launch trust packet",
    description: "Commercial and launch boundaries linked to operational evidence.",
    href: "/documents/launch-trust-packet",
  },
];

export const analyticsSnapshots = [
  {
    label: "Baseline live proof",
    value: "Healthy",
    detail: "Create → submit → private vote → execute treasury is already packaged as reviewer-facing Devnet evidence.",
  },
  {
    label: "V3 hardening proof",
    value: "Healthy",
    detail: "Governance V3 and Settlement V3 have dedicated Devnet proof packets with additive boundaries.",
  },
  {
    label: "Launch blockers",
    value: "6 tracked",
    detail: "Audit, multisig transfer, monitoring, real-device runtime, source-verifiable receipts, and cutover ceremony stay explicit.",
  },
  {
    label: "Commercial readiness",
    value: "Pilot-ready",
    detail: "Service packs, pricing, SLA, trust package, and onboarding playbook remain visible in-product.",
  },
];

export const analyticsReadiness = [
  {
    title: "Proof coverage",
    body: "Baseline live proof, dedicated V3 hardening proof, frontier integrations, and audit packet are all reviewer-facing.",
    tone: "success",
  },
  {
    title: "Runtime operations",
    body: "Execution logs, diagnostics surfaces, reviewer bundles, and readiness gates stay tied to generated artifacts.",
    tone: "cyan",
  },
  {
    title: "Launch truth boundary",
    body: "Mainnet custody, multisig ceremony, audit closure, and real-device captures remain pending-external until evidenced.",
    tone: "warning",
  },
];

export const launchBlockers = [
  {
    name: "Multisig + authority transfer",
    state: "Pending external",
    note: "Program authority and operational privileges still need final custody ceremony evidence.",
  },
  {
    name: "External audit closure",
    state: "Pending external",
    note: "Security review packet exists, but external sign-off is still an explicit blocker.",
  },
  {
    name: "Real-device runtime captures",
    state: "Pending external",
    note: "Wallet runtime templates are documented; production captures are still separated from claims.",
  },
  {
    name: "Monitoring + alerting",
    state: "Documented",
    note: "Operational rules exist and are linked, but live deployment evidence remains outside the repo surface.",
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

export const trustLinks = [
  {
    title: "Judge proof view",
    summary: "Fastest reviewer path into the live product proof surface.",
    href: "/proof/?judge=1",
  },
  {
    title: "Audit packet",
    summary: "Generated audit-facing packet that ties reviewer and launch evidence together.",
    href: "/documents/audit-packet",
  },
  {
    title: "Launch trust packet",
    summary: "Commercial and launch trust narrative with boundaries kept explicit.",
    href: "/documents/launch-trust-packet",
  },
  {
    title: "Mainnet blockers",
    summary: "Honest list of what still needs custody, audit, and runtime evidence before real-funds launch.",
    href: "/documents/mainnet-blockers",
  },
  {
    title: "Presentation deck",
    summary: "Pitch-ready investor and competition presentation surface.",
    href: "https://github.com/X-PACT/PrivateDAO/blob/main/docs/investor-pitch-deck.md",
  },
  {
    title: "Live proof V3",
    summary: "Dedicated additive hardening proof packet for Governance V3 and Settlement V3.",
    href: "/documents/live-proof-v3",
  },
];

export const commercialCompare = [
  {
    name: "Pilot Package",
    fit: "Best for teams validating private governance and treasury operations before a longer rollout.",
    deliverable: "Week-by-week onboarding, trust packet, readiness framing, and guided operating plan.",
    cta: "Open pilot program",
    href: "/documents/pilot-program",
  },
  {
    name: "Hosted Read API + Ops",
    fit: "Best for apps or teams that need cleaner governance data, evidence reads, and reviewer exports.",
    deliverable: "Hosted read surfaces, ops guidance, reviewer packet alignment, and product-facing API framing.",
    cta: "Open service catalog",
    href: "/documents/service-catalog",
  },
  {
    name: "Confidential Operations Premium",
    fit: "Best for payroll, bonus, and private treasury teams that need stronger confidentiality boundaries.",
    deliverable: "REFHE paths, V3 hardening, evidence-gated treasury flows, and operator trust surfaces.",
    cta: "Open pricing model",
    href: "/documents/pricing-model",
  },
  {
    name: "Enterprise Governance Retainer",
    fit: "Best for organizations that want longer-term support across launch, controls, and operator workflows.",
    deliverable: "SLA framing, trust package, launch blockers review, and governance operations guidance.",
    cta: "Open SLA",
    href: "/documents/service-level-agreement",
  },
];

export const proofFlowSteps = [
  {
    title: "Live proof",
    detail: "Open the canonical Devnet flow that proves create → submit → private vote → execute treasury happened.",
    href: "/proof/?judge=1",
  },
  {
    title: "Dedicated V3 proof",
    detail: "Open the additive hardening packet for Governance V3 and Settlement V3 after reviewing the baseline flow.",
    href: "/documents/live-proof-v3",
  },
  {
    title: "Integration packet",
    detail: "Open the Frontier integrations packet to verify ZK, REFHE, MagicBlock, and Fast RPC surfaces together.",
    href: "/documents/frontier-integrations",
  },
  {
    title: "Audit and launch trust",
    detail: "Close the loop with audit packet, launch trust packet, and mainnet blockers so proof is not separated from deployment truth.",
    href: "/documents/launch-trust-packet",
  },
];

export const heroPersonas = {
  buyer: {
    label: "Buyer",
    eyebrow: "Pilot-ready product surface",
    title: "Private governance and treasury execution packaged like a serious product.",
    description:
      "See service packs, pricing language, trust boundaries, launch blockers, and a guided path from product selection to treasury execution.",
    primaryCtaLabel: "Open services",
    primaryCtaHref: "/services",
    secondaryCtaLabel: "Open command center",
    secondaryCtaHref: "/command-center",
    badge: "Commercial + launch aware",
  },
  judge: {
    label: "Judge",
    eyebrow: "Reviewer-first proof surface",
    title: "Proof packets, additive hardening, and launch truth are visible without digging.",
    description:
      "Move from live proof to V3 hardening, integration packets, audit packet, and trust surfaces without losing the actual product flow.",
    primaryCtaLabel: "Open proof center",
    primaryCtaHref: "/proof",
    secondaryCtaLabel: "Open awards + trust",
    secondaryCtaHref: "/awards",
    badge: "Baseline + V3 reviewer path",
  },
  operator: {
    label: "Operator",
    eyebrow: "Governance and runtime operations",
    title: "Proposal actions, wallet state, diagnostics, and readiness gates stay connected.",
    description:
      "Command Center, governance dashboard, diagnostics, and launch blockers remain available in one operational surface for the team actually running the DAO.",
    primaryCtaLabel: "Open governance dashboard",
    primaryCtaHref: "/dashboard",
    secondaryCtaLabel: "Open diagnostics",
    secondaryCtaHref: "/diagnostics",
    badge: "Runtime and wallet aware",
  },
} as const;
