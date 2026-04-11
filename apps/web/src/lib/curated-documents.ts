import fs from "fs";
import path from "path";

export type CuratedDocument = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  audience: string;
  boundary: string;
  docPath: string;
  rawHref: string;
};

const repositoryBlobBase = "https://github.com/X-PACT/PrivateDAO/blob/main";

const curatedDocuments: CuratedDocument[] = [
  {
    slug: "reviewer-fast-path",
    title: "Reviewer Fast Path",
    category: "Reviewer core",
    summary: "Shortest reviewer path across live proof, V3 hardening, trust links, and launch boundary surfaces.",
    audience: "Judges, auditors, technical reviewers",
    boundary: "Curated in-app view only. The canonical query-driven docs viewer remains in docs/ until full parity exists.",
    docPath: "docs/reviewer-fast-path.md",
    rawHref: `${repositoryBlobBase}/docs/reviewer-fast-path.md`,
  },
  {
    slug: "audit-packet",
    title: "Audit Packet",
    category: "Reviewer core",
    summary: "Generated packet that ties audit-facing evidence, V3 surfaces, and launch materials together.",
    audience: "Judges, auditors, security reviewers",
    boundary: "Rendered in-app as a reviewer-friendly subset. Raw markdown remains the authoritative file.",
    docPath: "docs/audit-packet.generated.md",
    rawHref: `${repositoryBlobBase}/docs/audit-packet.generated.md`,
  },
  {
    slug: "live-proof-v3",
    title: "Live Proof V3",
    category: "Reviewer core",
    summary: "Dedicated additive hardening proof for Governance V3 and Settlement V3 on Devnet.",
    audience: "Judges, reviewers, protocol operators",
    boundary: "Devnet proof only; not a mainnet custody claim.",
    docPath: "docs/test-wallet-live-proof-v3.generated.md",
    rawHref: `${repositoryBlobBase}/docs/test-wallet-live-proof-v3.generated.md`,
  },
  {
    slug: "governance-hardening-v3",
    title: "Governance Hardening V3",
    category: "Security",
    summary: "Token-supply quorum snapshots, rebate vault isolation, and additive governance policy hardening.",
    audience: "Security reviewers, operators, protocol readers",
    boundary: "Versioned additive hardening; legacy protocol path remains intact.",
    docPath: "docs/governance-hardening-v3.md",
    rawHref: `${repositoryBlobBase}/docs/governance-hardening-v3.md`,
  },
  {
    slug: "zk-capability-matrix",
    title: "ZK Capability Matrix",
    category: "Security",
    summary: "PrivateDAO-specific matrix for what the ZK layer proves today, how it is verified, and what remains explicitly out of scope.",
    audience: "Judges, security reviewers, operators",
    boundary: "Truth-aligned matrix only; it does not upgrade the repo beyond the actual verifier and launch boundaries.",
    docPath: "docs/zk-capability-matrix.md",
    rawHref: `${repositoryBlobBase}/docs/zk-capability-matrix.md`,
  },
  {
    slug: "cryptographic-confidence-engine",
    title: "Cryptographic Confidence Engine",
    category: "Security",
    summary: "Deterministic scoring model for how ZK, REFHE, MagicBlock, Fast RPC, and hardening surfaces change the confidence profile of each proposal pattern.",
    audience: "Judges, security reviewers, operators, buyers",
    boundary: "Interpretation layer only; it does not replace audit, custody, or formal security proofs.",
    docPath: "docs/cryptographic-confidence-engine.md",
    rawHref: `${repositoryBlobBase}/docs/cryptographic-confidence-engine.md`,
  },
  {
    slug: "settlement-hardening-v3",
    title: "Settlement Hardening V3",
    category: "Security",
    summary: "Proposal-scoped settlement policy snapshots, evidence aging, payout caps, and single-use settlement consumption.",
    audience: "Security reviewers, operators, protocol readers",
    boundary: "Curated surface only; confidential payout semantics still depend on the underlying docs and program path.",
    docPath: "docs/settlement-hardening-v3.md",
    rawHref: `${repositoryBlobBase}/docs/settlement-hardening-v3.md`,
  },
  {
    slug: "launch-trust-packet",
    title: "Launch Trust Packet",
    category: "Trust",
    summary: "Custody, audit, pilot, and runtime boundaries tied into one buyer- and reviewer-readable packet.",
    audience: "Buyers, judges, operators",
    boundary: "Keeps pending-external launch work explicit rather than implying mainnet readiness.",
    docPath: "docs/launch-trust-packet.generated.md",
    rawHref: `${repositoryBlobBase}/docs/launch-trust-packet.generated.md`,
  },
  {
    slug: "mainnet-blockers",
    title: "Mainnet Blockers",
    category: "Trust",
    summary: "Canonical list of pending-external custody, audit, runtime, and release blockers before real-funds cutover.",
    audience: "Operators, buyers, reviewers",
    boundary: "This is a blocker surface, not a launch approval.",
    docPath: "docs/mainnet-blockers.md",
    rawHref: `${repositoryBlobBase}/docs/mainnet-blockers.md`,
  },
  {
    slug: "trust-package",
    title: "Trust Package",
    category: "Trust",
    summary: "Buyer-readable trust and proof narrative that connects product surfaces to security and launch truth.",
    audience: "Buyers, operators, reviewers",
    boundary: "Commercial trust framing remains tied to the underlying proof and blocker docs.",
    docPath: "docs/trust-package.md",
    rawHref: `${repositoryBlobBase}/docs/trust-package.md`,
  },
  {
    slug: "pilot-program",
    title: "Pilot Program",
    category: "Commercial",
    summary: "Week-by-week pilot structure that frames onboarding, trust packets, and execution readiness for early adopters.",
    audience: "Buyers, operators, pilot teams",
    boundary: "Commercial rollout framing only; it does not turn pending-external launch work into shipped infrastructure.",
    docPath: "docs/pilot-program.md",
    rawHref: `${repositoryBlobBase}/docs/pilot-program.md`,
  },
  {
    slug: "service-level-agreement",
    title: "Service Level Agreement",
    category: "Commercial",
    summary: "Hosted ops and service-boundary framing for response expectations, support surfaces, and operator responsibilities.",
    audience: "Buyers, operators, procurement",
    boundary: "Service framing depends on the underlying proof and runtime surfaces; it is not a live enterprise SLA claim by itself.",
    docPath: "docs/service-level-agreement.md",
    rawHref: `${repositoryBlobBase}/docs/service-level-agreement.md`,
  },
  {
    slug: "pricing-model",
    title: "Pricing Model",
    category: "Commercial",
    summary: "Packaging for pilot, API, confidential governance support, and longer-term operating engagements.",
    audience: "Buyers, operators, procurement",
    boundary: "Commercial packaging remains informational until paired with an actual engagement.",
    docPath: "docs/pricing-model.md",
    rawHref: `${repositoryBlobBase}/docs/pricing-model.md`,
  },
  {
    slug: "service-catalog",
    title: "Service Catalog",
    category: "Commercial",
    summary: "Buyer-facing inventory of hosted read API, ops assistance, and confidential governance support services.",
    audience: "Buyers, operators, partnerships",
    boundary: "Service catalog is a product surface, not a claim that every package is currently live-operated.",
    docPath: "docs/service-catalog.md",
    rawHref: `${repositoryBlobBase}/docs/service-catalog.md`,
  },
  {
    slug: "production-custody-ceremony",
    title: "Production Custody Ceremony",
    category: "Operations",
    summary: "Operational handoff for multisig creation, authority transfer, and custody evidence collection before real-funds launch.",
    audience: "Operators, auditors, launch leads",
    boundary: "This is an execution runbook and evidence checklist, not proof that the custody ceremony is already complete.",
    docPath: "docs/production-custody-ceremony.md",
    rawHref: `${repositoryBlobBase}/docs/production-custody-ceremony.md`,
  },
  {
    slug: "canonical-custody-proof",
    title: "Canonical Custody Proof",
    category: "Operations",
    summary: "Repo-backed custody truth packet with exact pending items, observed chain readouts, and explorer-linked closure points.",
    audience: "Operators, auditors, judges, buyers",
    boundary: "Truth packet only; it does not claim that production multisig or authority transfer signatures already exist.",
    docPath: "docs/canonical-custody-proof.generated.md",
    rawHref: `${repositoryBlobBase}/docs/canonical-custody-proof.generated.md`,
  },
  {
    slug: "custody-proof-reviewer-packet",
    title: "Custody Proof Reviewer Packet",
    category: "Reviewer core",
    summary: "Reviewer-facing custody truth packet that condenses what is externally proven now, what is still pending, and the exact strict ingestion route for ceremony evidence.",
    audience: "Judges, auditors, technical reviewers, launch leads",
    boundary: "Reviewer condensation only; it does not claim ceremony completion until the exact external artifacts exist.",
    docPath: "docs/custody-proof-reviewer-packet.generated.md",
    rawHref: `${repositoryBlobBase}/docs/custody-proof-reviewer-packet.generated.md`,
  },
  {
    slug: "track-judge-first-openings",
    title: "Track Judge-First Openings",
    category: "Reviewer core",
    summary: "Canonical 30 to 45 second opening copy for the three priority tracks, kept aligned with the judge-first top strip and reviewer packet.",
    audience: "Judges, reviewers, founders, video editors",
    boundary: "Presentation alignment surface only; it does not change what is proven, pending, or externally blocked.",
    docPath: "docs/track-judge-first-openings.generated.md",
    rawHref: `${repositoryBlobBase}/docs/track-judge-first-openings.generated.md`,
  },
  {
    slug: "track-reviewer-packet-colosseum-frontier",
    title: "Colosseum Frontier Reviewer Packet",
    category: "Reviewer core",
    summary: "Judge packet for Colosseum Frontier with judge-first opening, proof closure, exact blocker, best demo route, and reviewer links.",
    audience: "Judges, reviewers, founders",
    boundary: "Track packet only; it does not alter the underlying trust or blocker truth.",
    docPath: "docs/track-reviewer-packets/colosseum-frontier.generated.md",
    rawHref: `${repositoryBlobBase}/docs/track-reviewer-packets/colosseum-frontier.generated.md`,
  },
  {
    slug: "track-reviewer-packet-privacy-track",
    title: "Privacy Track Reviewer Packet",
    category: "Reviewer core",
    summary: "Judge packet for Privacy Track with judge-first opening, proof closure, exact blocker, best demo route, and reviewer links.",
    audience: "Judges, reviewers, founders",
    boundary: "Track packet only; it does not alter the underlying trust or blocker truth.",
    docPath: "docs/track-reviewer-packets/privacy-track.generated.md",
    rawHref: `${repositoryBlobBase}/docs/track-reviewer-packets/privacy-track.generated.md`,
  },
  {
    slug: "track-reviewer-packet-rpc-infrastructure",
    title: "RPC Infrastructure Reviewer Packet",
    category: "Reviewer core",
    summary: "Judge packet for RPC Infrastructure with judge-first opening, proof closure, exact blocker, best demo route, and reviewer links.",
    audience: "Judges, reviewers, founders",
    boundary: "Track packet only; it does not alter the underlying trust or blocker truth.",
    docPath: "docs/track-reviewer-packets/rpc-infrastructure.generated.md",
    rawHref: `${repositoryBlobBase}/docs/track-reviewer-packets/rpc-infrastructure.generated.md`,
  },
  {
    slug: "external-audit-engagement",
    title: "External Audit Engagement",
    category: "Operations",
    summary: "Audit intake and boundary packet for external reviewers, including blocker truth and required evidence surfaces.",
    audience: "Auditors, operators, security reviewers",
    boundary: "Captures audit readiness and requested evidence, not external sign-off itself.",
    docPath: "docs/external-audit-engagement.md",
    rawHref: `${repositoryBlobBase}/docs/external-audit-engagement.md`,
  },
  {
    slug: "authority-hardening-mainnet",
    title: "Authority Hardening for Mainnet",
    category: "Operations",
    summary: "Canonical authority-separation brief covering multisig posture, upgrade authority, treasury authority, and admin-boundary discipline before Mainnet.",
    audience: "Operators, auditors, reviewers, buyers",
    boundary: "Launch-discipline surface only; it does not claim the ceremony is already complete.",
    docPath: "docs/authority-hardening-mainnet.md",
    rawHref: `${repositoryBlobBase}/docs/authority-hardening-mainnet.md`,
  },
  {
    slug: "incident-readiness-runbook",
    title: "Incident Readiness Runbook",
    category: "Operations",
    summary: "Canonical runbook for RPC, wallet, instruction, and proposal-state monitoring with a compact operator response loop.",
    audience: "Operators, reviewers, buyers, security readers",
    boundary: "Runbook surface only; it does not claim 24/7 coverage or external IR membership.",
    docPath: "docs/incident-readiness-runbook.md",
    rawHref: `${repositoryBlobBase}/docs/incident-readiness-runbook.md`,
  },
  {
    slug: "frontier-integrations",
    title: "Frontier Integrations",
    category: "Reviewer core",
    summary: "Unified packet for ZK anchors, REFHE envelopes, MagicBlock corridor evidence, and Fast RPC-backed runtime surfaces.",
    audience: "Judges, reviewers, technical operators",
    boundary: "Reviewer-facing integration surface only; source-verifiable external receipts remain a separate launch boundary.",
    docPath: "docs/frontier-integrations.generated.md",
    rawHref: `${repositoryBlobBase}/docs/frontier-integrations.generated.md`,
  },
  {
    slug: "frontier-competition-readiness-2026",
    title: "Frontier Competition Readiness 2026",
    category: "Strategy",
    summary: "Truth-aligned readiness map across the active Superteam and Frontier-adjacent tracks beyond the core Colosseum submission.",
    audience: "Founders, judges, strategy reviewers, operators",
    boundary: "Strategy surface only; it does not claim partner integrations or shipped behaviors beyond what already exists in the repo.",
    docPath: "docs/frontier-competition-readiness-2026.md",
    rawHref: `${repositoryBlobBase}/docs/frontier-competition-readiness-2026.md`,
  },
  {
    slug: "competition-execution-playbook",
    title: "Competition Execution Playbook",
    category: "Strategy",
    summary: "Development playbook for keeping product, demo, docs, proof, and UX aligned with the active competition targets.",
    audience: "Founders, operators, product leads, reviewers",
    boundary: "Execution guidance only; it does not by itself upgrade the repo beyond what is actually implemented.",
    docPath: "docs/competition-execution-playbook.md",
    rawHref: `${repositoryBlobBase}/docs/competition-execution-playbook.md`,
  },
  {
    slug: "colosseum-frontier-2026-operating-brief",
    title: "Colosseum Frontier 2026 Operating Brief",
    category: "Strategy",
    summary: "Operating interpretation of the current Colosseum Frontier, Drift, STRIDE, Anchor v1, and ecosystem signals for PrivateDAO.",
    audience: "Founders, operators, judges, security reviewers",
    boundary: "Operating brief only; it does not replace the underlying proof, launch, or runtime evidence surfaces.",
    docPath: "docs/colosseum-frontier-2026-operating-brief.md",
    rawHref: `${repositoryBlobBase}/docs/colosseum-frontier-2026-operating-brief.md`,
  },
  {
    slug: "frontier-overview-video",
    title: "Frontier Overview Video Package",
    category: "Strategy",
    summary: "Canonical brief for the comprehensive product reel that explains everything PrivateDAO offers and why it is positioned to win across the active track set.",
    audience: "Judges, buyers, operators, content reviewers",
    boundary: "Video brief and asset package only; it does not change the underlying proof or launch boundary documents.",
    docPath: "docs/investor-video.md",
    rawHref: `${repositoryBlobBase}/docs/investor-video.md`,
  },
];

export function getCuratedDocuments() {
  return curatedDocuments;
}

export function getCuratedDocumentsBySlugs(slugs: string[]) {
  const wanted = new Set(slugs);
  return curatedDocuments.filter((entry) => wanted.has(entry.slug));
}

export function getCuratedDocument(slug: string) {
  return curatedDocuments.find((entry) => entry.slug === slug) ?? null;
}

export function getCuratedDocumentContent(slug: string) {
  const entry = getCuratedDocument(slug);
  if (!entry) return null;

  const docsRoot = path.join(/* turbopackIgnore: true */ process.cwd(), "..", "..", "docs");
  const relativeDocPath = entry.docPath.replace(/^docs\//, "");
  const absolutePath = path.join(docsRoot, relativeDocPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing curated document source: ${entry.docPath}`);
  }

  return {
    ...entry,
    content: fs.readFileSync(absolutePath, "utf8"),
  };
}
