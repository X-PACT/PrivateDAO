export type PlatformCapability = {
  slug: string;
  title: string;
  promise: string;
  surfaceRoute: {
    label: string;
    href: string;
  };
  executionRoute: {
    label: string;
    href: string;
  };
  proofRoute: {
    label: string;
    href: string;
  };
  learnRoute: {
    label: string;
    href: string;
  };
  technologies: string[];
  executionCore: string[];
  commercialShape: string;
};

export const platformCapabilities: PlatformCapability[] = [
  {
    slug: "private-governance-execution",
    title: "Private governance execution",
    promise:
      "A normal user can create a DAO, submit a proposal, vote, and execute from one wallet-first flow while the product keeps proof and treasury discipline attached.",
    surfaceRoute: {
      label: "Start from onboarding",
      href: "/start",
    },
    executionRoute: {
      label: "Run the govern flow",
      href: "/govern",
    },
    proofRoute: {
      label: "Verify through judge",
      href: "/judge",
    },
    learnRoute: {
      label: "Learn governance UI",
      href: "/learn/lecture-2-governance-ui",
    },
    technologies: ["Commit-reveal", "Governance V3", "ZK review"],
    executionCore: [
      "DAO lifecycle orchestration",
      "proposal registry and policy snapshots",
      "wallet-signed execution path",
      "runtime-linked proof visibility",
    ],
    commercialShape:
      "The base service lane for grant committees, enterprise DAOs, fund governance, and internal operating councils.",
  },
  {
    slug: "confidential-treasury-operations",
    title: "Confidential treasury operations",
    promise:
      "Treasury motions, payout requests, and sensitive execution paths stay private where needed, yet still produce reviewer-safe evidence and operator-readable state.",
    surfaceRoute: {
      label: "Open security lane",
      href: "/security",
    },
    executionRoute: {
      label: "Open payout route selection",
      href: "/services#payout-route-selection",
    },
    proofRoute: {
      label: "Open privacy proof guide",
      href: "/documents/privacy-and-encryption-proof-guide",
    },
    learnRoute: {
      label: "Learn execution flow",
      href: "/learn/lecture-4-private-payments-gaming-and-proof",
    },
    technologies: ["REFHE", "MagicBlock", "Settlement V3", "Selective disclosure"],
    executionCore: [
      "treasury receive routing",
      "settlement receipt and closure surfaces",
      "confidence engine and policy-bound review",
      "reviewer-visible payout evidence",
    ],
    commercialShape:
      "This is the premium confidentiality lane for payroll, grants, vendor payouts, and high-trust treasury operations.",
  },
  {
    slug: "stablecoin-treasury-rails",
    title: "Stablecoin treasury rails",
    promise:
      "Stablecoins are not shown as token badges; they are activated as governed settlement rails for merchant billing, treasury reserves, payroll, and reward distribution.",
    surfaceRoute: {
      label: "Open treasury receive surface",
      href: "/services#treasury-payment-request",
    },
    executionRoute: {
      label: "Run billing rehearsal",
      href: "/services/testnet-billing-rehearsal",
    },
    proofRoute: {
      label: "Open stablecoin briefs",
      href: "/documents/audd-stablecoin-treasury-layer",
    },
    learnRoute: {
      label: "Learn stablecoin flow",
      href: "/learn/lecture-4-private-payments-gaming-and-proof",
    },
    technologies: ["AUDD", "PUSD", "SPL TransferChecked", "Treasury routing"],
    executionCore: [
      "AUDD merchant and treasury settlement profiles",
      "PUSD payroll and gaming reward profiles",
      "wallet-signed stablecoin transfer construction",
      "memo-coded billing rehearsal and reviewer context",
    ],
    commercialShape:
      "This lane becomes merchant settlement, programmable finance, payroll, grants, and stablecoin-native treasury services.",
  },
  {
    slug: "agentic-treasury-automation",
    title: "Agentic treasury automation",
    promise:
      "Automation is turned into a bounded treasury assistant instead of an unscoped bot, so teams can automate repetitive payouts and rebalances without surrendering wallet control.",
    surfaceRoute: {
      label: "Open services rail",
      href: "/services",
    },
    executionRoute: {
      label: "Open Zerion policy surface",
      href: "/services/zerion-agent-policy",
    },
    proofRoute: {
      label: "Open agent policy packet",
      href: "/documents/zerion-autonomous-agent-policy",
    },
    learnRoute: {
      label: "Learn agentic rails",
      href: "/learn/lecture-4-private-payments-gaming-and-proof",
    },
    technologies: ["Zerion policy", "Agentic micropayments", "Spend caps", "Expiry windows"],
    executionCore: [
      "policy-bound execution payloads",
      "agentic treasury micropayment rail",
      "approve-before-execute safety",
      "governance-attached payout sequencing",
    ],
    commercialShape:
      "The commercial lane is treasury operations automation for teams that need bounded execution, not god-mode agents.",
  },
  {
    slug: "runtime-and-data-plane",
    title: "Runtime and data plane",
    promise:
      "The infrastructure layer is visible as product value: faster reads, clearer logs, analytics, reviewer packets, and operator confidence after every signed action.",
    surfaceRoute: {
      label: "Open services",
      href: "/services",
    },
    executionRoute: {
      label: "Open diagnostics and analytics",
      href: "/diagnostics",
    },
    proofRoute: {
      label: "Open telemetry packet",
      href: "/documents/reviewer-telemetry-packet",
    },
    learnRoute: {
      label: "Learn runtime UX",
      href: "/learn/lecture-3-rpc-state-and-runtime",
    },
    technologies: ["Fast RPC", "Hosted reads", "Telemetry", "Read-node snapshots"],
    executionCore: [
      "diagnostics and live state surfaces",
      "reviewer telemetry packet",
      "hosted read proof and API-facing ops",
      "indexed proposal and runtime freshness snapshots",
    ],
    commercialShape:
      "This becomes hosted read API, DAO-specific RPC, infrastructure support, and analytics-grade governance operations.",
  },
  {
    slug: "growth-and-learning-loop",
    title: "Growth and learning loop",
    promise:
      "The platform can onboard, educate, activate, and measure users inside the same product instead of outsourcing product understanding to offsite docs and ad-hoc community support.",
    surfaceRoute: {
      label: "Open learn route",
      href: "/learn",
    },
    executionRoute: {
      label: "Open Torque growth loop",
      href: "/services/torque-growth-loop",
    },
    proofRoute: {
      label: "Open growth packet",
      href: "/documents/torque-growth-loop",
    },
    learnRoute: {
      label: "Open toolkit and quizzes",
      href: "/learn/toolkit",
    },
    technologies: ["Torque events", "Bootcamp", "Assignments", "Quizzes"],
    executionCore: [
      "lecture-to-route learning loop",
      "custom_events for activation and retention",
      "assignment and quiz completion surfaces",
      "route-linked onboarding and adoption tooling",
    ],
    commercialShape:
      "This supports community activation, contributor onboarding, operator enablement, and measurable growth loops for live governance products.",
  },
];
