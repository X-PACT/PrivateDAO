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
        "Open Services and Diagnostics, inspect hosted read coverage, and route into the command center to see the same infrastructure powering live DAO actions on Testnet.",
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
        label: "Request gaming workflow",
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
      title: "Agentic Treasury Micropayments",
      summary:
        "Agentic Treasury Micropayments turns an approved DAO action into a stablecoin batch rail where execution, telemetry, and proof remain attached to the same governed request object.",
      tryNow:
        "Open Services, switch to the agentic micropayment rail, then continue into govern and proof to see how batched settlement is staged as a single policy-bound execution corridor.",
      evidence: [payoutCoverage, executeHealth, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open agentic rail",
        href: "/engage?profile=agentic-micropayment-rail",
      },
      bestRoute: {
        label: "Open judge proof",
        href: "/judge",
      },
      profileRoutes: [
        { label: "Services rail", href: "/services#treasury-payment-request" },
        { label: "Govern", href: "/govern" },
        { label: "Analytics", href: "/analytics" },
      ],
      buyerMotion:
        "Position the rail as DAO-controlled agentic settlement for reviewer rewards, API usage, operator tasks, and future onchain service commerce.",
      mainnetGate:
        "Production rollout depends on stable settlement policy hardening, beneficiary validation, monitoring continuity, and external review for batched micropayment execution.",
    },
    {
      title: "PUSD Stablecoin Treasury",
      summary:
        "PUSD Stablecoin Treasury turns Palm USD, USDC, and adjacent stablecoin rails into governed payroll, grant distribution, commerce settlement, and gaming reward products.",
      tryNow:
        "Open the Testnet billing rehearsal, select a PUSD lane, then continue into services, judge, and proof to keep the stablecoin payment, memo, and reviewer path in one flow.",
      evidence: [payoutCoverage, executeHealth, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open PUSD payroll",
        href: "/engage?profile=pusd-confidential-payroll",
      },
      bestRoute: {
        label: "Run billing rehearsal",
        href: "/services/testnet-billing-rehearsal",
      },
      profileRoutes: [
        { label: "PUSD payroll", href: "/engage?profile=pusd-confidential-payroll" },
        { label: "PUSD gaming rewards", href: "/engage?profile=pusd-gaming-reward-pool" },
        { label: "PUSD layer brief", href: "/documents/pusd-stablecoin-treasury-layer" },
      ],
      buyerMotion:
        "Lead with confidential payroll, grant distribution, gaming reward pools, and institutional stablecoin settlement as the first high-value commercial stablecoin package.",
      mainnetGate:
        "The production activation path binds the official PUSD mint, treasury receive account, beneficiary policy, and custody ceremony for real-funds mainnet settlement.",
    },
    {
      title: "Zerion Agent Policy",
      summary:
        "Zerion Agent Policy turns autonomous execution into a governed treasury assistant with chain locks, spend caps, expiry windows, and approve-before-execute safety.",
      tryNow:
        "Open the Zerion policy surface, choose a payroll, rebalance, or gaming-reward policy, copy the policy payload, and route the action into govern or billing.",
      evidence: [executeHealth, walletCoverage, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open agent policy",
        href: "/services/zerion-agent-policy",
      },
      bestRoute: {
        label: "Open agent packet",
        href: "/documents/zerion-autonomous-agent-policy",
      },
      profileRoutes: [
        { label: "Govern", href: "/govern" },
        { label: "Billing", href: "/services/testnet-billing-rehearsal" },
        { label: "Judge", href: "/judge" },
      ],
      buyerMotion:
        "Position the agent as a bounded treasury operations assistant for teams that need automation without handing an AI bot unchecked wallet authority.",
      mainnetGate:
        "Production execution should bind the Zerion CLI fork, API routing, final wallet signing, and policy audit evidence before any real-funds automated treasury motion.",
    },
    {
      title: "Torque Growth Loop",
      summary:
        "Torque Growth Loop converts real product actions into measurable custom_events for onboarding, governance activation, billing proof, and learning completion.",
      tryNow:
        "Open the Torque growth surface, select an event, record it locally, copy the custom_event payload, then connect it to the live action route that created the event.",
      evidence: [walletCoverage, executeHealth, proofFreshness].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open growth loop",
        href: "/services/torque-growth-loop",
      },
      bestRoute: {
        label: "Open growth packet",
        href: "/documents/torque-growth-loop",
      },
      profileRoutes: [
        { label: "Learn", href: "/learn" },
        { label: "Govern", href: "/govern" },
        { label: "Billing", href: "/services/testnet-billing-rehearsal" },
      ],
      buyerMotion:
        "Sell retention and activation as measurable product growth: teams can reward real DAO setup, proposal creation, billing signatures, and learning completion.",
      mainnetGate:
        "Production delivery should use a server-side Torque event relay or MCP runner with scoped credentials, campaign IDs, and abuse-resistant reward policy.",
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
