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
        href: "/services/runtime-infrastructure",
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
      title: "AUDD Stablecoin Treasury",
      summary:
        "AUDD Stablecoin Treasury turns Australian-dollar stable settlement into governed merchant billing, treasury reserve management, supplier settlement, and programmable finance.",
      tryNow:
        "Open the Testnet billing rehearsal, select an AUDD lane, then continue into services, judge, and proof so the treasury request, billing memo, and reviewer path stay connected.",
      evidence: [payoutCoverage, executeHealth, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open AUDD settlement",
        href: "/engage?profile=audd-merchant-settlement",
      },
      bestRoute: {
        label: "Run AUDD rehearsal",
        href: "/services/testnet-billing-rehearsal",
      },
      profileRoutes: [
        { label: "AUDD merchant path", href: "/engage?profile=audd-merchant-settlement" },
        { label: "AUDD treasury path", href: "/engage?profile=audd-treasury-settlement" },
        { label: "AUDD layer brief", href: "/documents/audd-stablecoin-treasury-layer" },
      ],
      buyerMotion:
        "Lead with governed Australian-dollar merchant settlement, reserve management, invoice collection, and programmable treasury finance as the first AUDD-native commercial package.",
      mainnetGate:
        "The production activation path binds the official AUDD mint, treasury receive account, beneficiary policy, and custody ceremony for real-funds mainnet settlement.",
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
      title: "Eitherway Wallet-First Live dApp",
      summary:
        "Eitherway Wallet-First Live dApp turns partner integrations into one guided user corridor: connect wallet, sign profile challenge, then continue to governed operations.",
      tryNow:
        "Open the Eitherway route, connect wallet, sign the profile challenge, then continue to govern, execute, and proof from the same browser flow.",
      evidence: [walletCoverage, executeHealth, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open Eitherway lane",
        href: "/services/eitherway-live-dapp",
      },
      bestRoute: {
        label: "Open start flow",
        href: "/start",
      },
      profileRoutes: [
        { label: "Govern", href: "/govern" },
        { label: "Execute", href: "/execute" },
        { label: "Proof", href: "/proof" },
      ],
      buyerMotion:
        "Position the corridor as a consumer-grade entrypoint that hides protocol complexity while preserving wallet safety and proof-linked transparency.",
      mainnetGate:
        "Production rollout should bind audited wallet-session handling, receipt persistence, and stable return-to-app behavior across browser and Android wallet contexts.",
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
      title: "Consumer Governance UX",
      summary:
        "Consumer Governance UX converts advanced DAO execution into a guided normal-user corridor with wallet-first onboarding and proof continuity.",
      tryNow:
        "Open the consumer UX lane, run wallet sandbox actions, follow connect/review/sign/verify path, then check proof and Android parity surfaces.",
      evidence: [walletCoverage, executeHealth, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open consumer UX lane",
        href: "/services/consumer-governance-ux",
      },
      bestRoute: {
        label: "Open start route",
        href: "/start",
      },
      profileRoutes: [
        { label: "Android app", href: "/android" },
        { label: "Govern", href: "/govern" },
        { label: "Proof", href: "/proof" },
      ],
      buyerMotion:
        "Position the lane as onboarding and activation infrastructure for teams that need real users to complete governed operations without expert support.",
      mainnetGate:
        "Mainnet closure requires final mobile deep-link resilience, signing clarity on edge wallets, and proof continuity parity between web and Android routes.",
    },
    {
      title: "SolRouter Encrypted AI",
      summary:
        "SolRouter Encrypted AI turns proposal and treasury analysis into deterministic decision briefs, then encrypts output client-side before sharing.",
      tryNow:
        "Open the SolRouter lane, select a live proposal, generate deterministic AI brief, encrypt it locally, then continue to proof continuity.",
      evidence: [proofFreshness, executeHealth, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open encrypted AI lane",
        href: "/services/solrouter-encrypted-ai",
      },
      bestRoute: {
        label: "Open intelligence route",
        href: "/intelligence",
      },
      profileRoutes: [
        { label: "Govern", href: "/govern" },
        { label: "Proof", href: "/proof" },
        { label: "Assistant", href: "/assistant" },
      ],
      buyerMotion:
        "Position deterministic encrypted decision support as a premium operator feature for teams that need fast governance analysis without leaking sensitive planning context.",
      mainnetGate:
        "Mainnet rollout should include stricter model-bounding policy, evidence retention standards, and reviewed cryptographic envelope handling for encrypted brief exports.",
    },
    {
      title: "Main Frontier Closure",
      summary:
        "Main Frontier Closure packages all shipped tracks as one integrated operating system route for judges, users, and buyers.",
      tryNow:
        "Open the main closure route, walk through the integrated lane cards, and validate that each lane stays one click away from judge/proof surfaces.",
      evidence: [proofFreshness, executeHealth, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Open main closure",
        href: "/services/main-frontier-closure",
      },
      bestRoute: {
        label: "Open judge",
        href: "/judge",
      },
      profileRoutes: [
        { label: "Proof", href: "/proof" },
        { label: "Execute", href: "/execute" },
        { label: "Services", href: "/services" },
      ],
      buyerMotion:
        "Position PrivateDAO as a unified treasury and governance operating system instead of fragmented sponsor demos.",
      mainnetGate:
        "Mainnet closure depends on keeping each lane operationally tested, auditable, and consistently linked to proof continuity under one release discipline.",
    },
    {
      title: "Security / Encryption",
      summary:
        "Security is a product layer here: ZK, REFHE, MagicBlock, trust packets, and runtime diagnostics are visible to users, buyers, and reviewers.",
      tryNow:
        "Open Encrypt / IKA operations, run client-side encryption for a payload, then jump into Proof and Diagnostics to keep encrypted execution and reviewer continuity aligned.",
      evidence: [proofFreshness, walletCoverage, proofCompletion].filter(Boolean) as MetricPreview[],
      intakeRoute: {
        label: "Start a pilot",
        href: "/engage?profile=pilot-funding",
      },
      bestRoute: {
        label: "Open encrypted lane",
        href: "/services/encrypt-ika-operations",
      },
      profileRoutes: [
        { label: "Security route", href: "/security" },
        { label: "Proof route", href: "/proof" },
        { label: "Encrypted ops brief", href: "/documents/encrypted-operations-lane" },
      ],
      buyerMotion:
        "Sell confidential operations, proof-backed governance, and trust packaging as a premium layer for privacy-sensitive organizations.",
      mainnetGate:
        "Mainnet security promises depend on multisig authority transfer, incident monitoring closure, audit posture, and real-device capture coverage reaching full closure.",
    },
  ];
}
