export type SiteSearchItem = {
  title: string;
  href: string;
  category: "Route" | "Track" | "Document" | "Proof" | "Service";
  summary: string;
};

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
    summary: "Competition readiness center across Frontier, Ranger, RPC, consumer, and privacy tracks.",
  },
  {
    title: "Colosseum Frontier Workspace",
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
    title: "Privacy Track Workspace",
    href: "/tracks/privacy-track",
    category: "Track",
    summary: "MagicBlock/privacy-aligned submission bundle and validation steps.",
  },
  {
    title: "Eitherway Live dApp Workspace",
    href: "/tracks/eitherway-live-dapp",
    category: "Track",
    summary: "Wallet-first live dApp corridor for Solflare, QuickNode, and sponsor-facing demos.",
  },
  {
    title: "RPC Infrastructure Workspace",
    href: "/tracks/rpc-infrastructure",
    category: "Track",
    summary: "Hosted read path, diagnostics, runtime evidence, and Fast RPC packaging.",
  },
  {
    title: "Consumer Apps Workspace",
    href: "/tracks/consumer-apps",
    category: "Track",
    summary: "Best path for normal users, onboarding, clarity, and consumer-grade UX.",
  },
  {
    title: "100xDevs Workspace",
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
