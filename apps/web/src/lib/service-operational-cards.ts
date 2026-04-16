import { getDevnetServiceMetrics, getOperationalValidationSnapshot } from "@/lib/devnet-service-metrics";

type MetricPreview = {
  label: string;
  value: string;
  detail: string;
};

export type ServiceOperationalCard = {
  title: string;
  summary: string;
  tryNow: string;
  evidence: MetricPreview[];
  intakeRoute: {
    label: string;
    href: string;
  };
  bestRoute: {
    label: string;
    href: string;
  };
  profileRoutes?: Array<{
    label: string;
    href: string;
  }>;
  buyerMotion: string;
  mainnetGate: string;
};

function pickMetric(metrics: MetricPreview[], label: string) {
  return metrics.find((metric) => metric.label === label);
}

export function getServiceOperationalCards(): ServiceOperationalCard[] {
  const devnet = getDevnetServiceMetrics();
  const validation = getOperationalValidationSnapshot();

  const rpcCoverage = pickMetric(devnet.services, "Hosted read coverage");
  const rpcLatency = pickMetric(devnet.overview, "Primary RPC latency");
  const fallbackRecovery = pickMetric(devnet.diagnostics, "Fallback recovery");

  const payoutCoverage = pickMetric(devnet.services, "Confidential payout coverage");
  const magicblockSettlement = pickMetric(devnet.services, "MagicBlock settlement completion");
  const executeHealth = pickMetric(devnet.overview, "Execute health");

  const walletCoverage = pickMetric(devnet.overview, "Wallet coverage");
  const proofCompletion = pickMetric(devnet.overview, "Proof completion");
  const proofFreshness = {
    label: validation.proofFreshness.label,
    value: validation.proofFreshness.value,
    detail: validation.proofFreshness.detail,
  };

  return [
    {
      title: "RPC Infrastructure",
      summary:
        "PrivateDAO RPC is the infrastructure rail behind reads, writes, diagnostics, and buyer-facing hosted governance access.",
      tryNow:
        "Open Services and Diagnostics, inspect hosted read coverage, and route into the command center to see the same infrastructure powering live DAO actions on Devnet.",
      evidence: [rpcCoverage, rpcLatency, fallbackRecovery].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Request RPC access",
        href: "/engage?intake=rpc",
      },
      bestRoute: {
        label: "Open RPC surface",
        href: "/services",
      },
      buyerMotion:
        "Sell shared or dedicated DAO-specific RPC plus hosted reads and operator support as the first paid infrastructure motion.",
      mainnetGate:
        "Dedicated endpoint hardening, quota enforcement, alert routing, and production support commitments should be completed before mainnet RPC promises become customer-grade.",
    },
    {
      title: "Gaming DAO",
      summary:
        "Gaming DAO turns proposal templates, reward treasury, and tournament or guild operations into a live governance corridor rather than a concept pitch.",
      tryNow:
        "Use Products for the gaming corridor, then continue into the command center to model reward, clan, or event decisions through the live proposal flow.",
      evidence: [magicblockSettlement, executeHealth, walletCoverage].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Request gaming demo",
        href: "/engage?intake=gaming",
      },
      bestRoute: {
        label: "Open gaming corridor",
        href: "/products",
      },
      buyerMotion:
        "Lead game studios with reward governance, guild treasury control, and tournament payout management as a repeatable premium package.",
      mainnetGate:
        "Game-specific proposal templates, reward token policy hardening, and studio-grade custody or treasury authority separation should be finalized before production launch.",
    },
    {
      title: "Treasury Swap / Rebalance",
      summary:
        "The treasury route is being extended into a Jupiter-backed swap and rebalance corridor so asset moves stay governed, quote-aware, and reviewer-readable.",
      tryNow:
        "Open Services, inspect the Jupiter treasury route, then continue into govern and treasury routes to see how asset-motion intent is kept inside the same wallet-first operating path.",
      evidence: [executeHealth, walletCoverage, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open treasury route",
        href: "/services#jupiter-treasury-route",
      },
      bestRoute: {
        label: "Open route brief",
        href: "/documents/jupiter-treasury-route",
      },
      buyerMotion:
        "Position treasury swap and rebalance support as a premium corridor for DAOs that need controlled asset motion without leaving the governance shell.",
      mainnetGate:
        "Quote preview, policy thresholds, and post-route settlement evidence need to stay connected before treasury swap claims become production-grade.",
    },
    {
      title: "Payments DAO",
      summary:
        "Payments DAO extends the treasury model into contributor, vendor, and subscription payouts governed through the same proposal and proof rails.",
      tryNow:
        "Open Services, then the command center, and walk through treasury-backed proposal execution as the governed payout path for contributors or vendors.",
      evidence: [payoutCoverage, executeHealth, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Treasury top-up",
        href: "/engage?profile=treasury-top-up",
      },
      profileRoutes: [
        { label: "Pilot funding", href: "/engage?profile=pilot-funding" },
        { label: "Vendor payout", href: "/engage?profile=vendor-payout" },
        { label: "Contributor payout", href: "/engage?profile=contributor-payout" },
      ],
      bestRoute: {
        label: "Open payments path",
        href: "/services",
      },
      buyerMotion:
        "Position governed payouts as the first paid motion for teams that need contributor, vendor, or internal treasury disbursements with reviewable controls.",
      mainnetGate:
        "Real payment rails need stricter beneficiary validation, payout policy closure, production custody ceremony, and external audit evidence before mainnet claims.",
    },
    {
      title: "Security / Encryption",
      summary:
        "Security is a product layer here: ZK, REFHE, MagicBlock, trust packets, and runtime diagnostics are visible to users, buyers, and reviewers.",
      tryNow:
        "Open Security, inspect the ZK matrix and confidence engine, then jump into Proof and Diagnostics to see the encrypted and reviewer-facing path stay connected.",
      evidence: [proofFreshness, walletCoverage, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Start a pilot",
        href: "/engage?profile=pilot-funding",
      },
      bestRoute: {
        label: "Open trust layer",
        href: "/security",
      },
      buyerMotion:
        "Sell confidential operations, proof-backed governance, and trust packaging as a premium layer for privacy-sensitive organizations.",
      mainnetGate:
        "Mainnet security promises depend on multisig authority transfer, incident monitoring closure, audit posture, and real-device capture coverage reaching full closure.",
    },
  ];
}
