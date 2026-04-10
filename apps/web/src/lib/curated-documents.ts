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
    slug: "frontier-integrations",
    title: "Frontier Integrations",
    category: "Reviewer core",
    summary: "Unified packet for ZK anchors, REFHE envelopes, MagicBlock corridor evidence, and Fast RPC-backed runtime surfaces.",
    audience: "Judges, reviewers, technical operators",
    boundary: "Reviewer-facing integration surface only; source-verifiable external receipts remain a separate launch boundary.",
    docPath: "docs/frontier-integrations.generated.md",
    rawHref: `${repositoryBlobBase}/docs/frontier-integrations.generated.md`,
  },
];

export function getCuratedDocuments() {
  return curatedDocuments;
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
