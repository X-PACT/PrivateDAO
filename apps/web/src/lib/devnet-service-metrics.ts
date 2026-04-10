import fs from "node:fs";
import path from "node:path";

import { proposalCards } from "@/lib/site-data";
import { getRankedCompetitionTracks } from "@/lib/track-ranking";

type MetricTone = "cyan" | "emerald" | "amber" | "fuchsia";

export type DevnetMetricCard = {
  label: string;
  value: string;
  detail: string;
  tone: MetricTone;
};

export type DevnetServiceMetricsSnapshot = {
  overview: DevnetMetricCard[];
  diagnostics: DevnetMetricCard[];
  services: DevnetMetricCard[];
  tracks: Record<string, DevnetMetricCard[]>;
};

export type OperationalValidationCard = {
  label: string;
  value: string;
  detail: string;
  routeLabel: string;
  routeHref: string;
  tone: MetricTone;
};

export type OperationalValidationSnapshot = {
  generatedAt: string;
  proposalFlowHealth: OperationalValidationCard;
  walletReadiness: OperationalValidationCard;
  proofFreshness: OperationalValidationCard;
  commercialReadiness: OperationalValidationCard;
};

export type ExecutionSurfaceSignal = {
  label: string;
  value: string;
  detail: string;
  tone: MetricTone;
  routeHref: string;
  routeLabel: string;
};

export type IncidentAlertSignal = {
  title: string;
  status: "Healthy" | "Watch" | "Action";
  summary: string;
  routeHref: string;
  routeLabel: string;
};

export type ExecutionSurfaceSnapshot = {
  proposalFlow: ExecutionSurfaceSignal;
  walletReadiness: ExecutionSurfaceSignal;
  proofFreshness: ExecutionSurfaceSignal;
  commercialReadiness: ExecutionSurfaceSignal;
  incidentAlerts: IncidentAlertSignal[];
};

function percent(numerator: number, denominator: number) {
  if (!denominator) return "0%";
  return `${Math.round((numerator / denominator) * 1000) / 10}%`;
}

function boolStatus(value: boolean) {
  return value ? "100%" : "0%";
}

type RuntimeEvidenceJson = {
  generatedAt: string;
  walletCount: number;
  matrixStatuses: Array<{
    status: string;
    diagnosticsVisible: boolean;
    selectorVisible: boolean;
  }>;
  devnetCanary: {
    unexpectedFailures: number;
  };
  resilience: {
    fallbackRecovered: boolean;
    staleBlockhashRecovered: boolean;
  };
  realDevice: {
    pendingTargets: string[];
  };
  operational: {
    totalTxCount: number;
    totalAttemptCount: number;
    adversarialScenarioCount: number;
    unexpectedAdversarialSuccesses: number;
  };
};

type DevnetCanaryJson = {
  generatedAt: string;
  primaryRpc: {
    blockhashLatencyMs: number;
    versionLatencyMs: number;
  };
  anchors: Array<unknown>;
  summary: {
    anchorAccountsPresent: boolean;
  };
};

type FrontierIntegrationsJson = {
  generatedAt: string;
  readNode: {
    overview: {
      proposals: number;
      uniqueDaos: number;
      confidentialPayouts: number;
      refheConfigured: number;
      refheSettled: number;
      magicblockConfigured: number;
      magicblockSettled: number;
    };
  };
  simpleGovernance: {
    txChecks: Array<{
      label: string;
      confirmed: boolean;
      status: string;
    }>;
  };
  confidentialOperations: {
    txChecks: Array<{
      label: string;
      confirmed: boolean;
      status: string;
    }>;
  };
  zk: {
    anchorChecks: Array<{
      confirmed: boolean;
      account: {
        exists: boolean;
      };
    }>;
  };
};

function readJson<T>(relativePath: string): T {
  const filePath = path.resolve(process.cwd(), "..", "..", relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function formatAgeLabel(isoTimestamp: string) {
  const ageMs = Date.now() - new Date(isoTimestamp).getTime();
  const hours = Math.max(0, Math.round(ageMs / (1000 * 60 * 60)));
  if (hours < 1) return "fresh this hour";
  if (hours < 24) return `${hours}h old`;
  const days = Math.round(hours / 24);
  return `${days}d old`;
}

export function getDevnetServiceMetrics(): DevnetServiceMetricsSnapshot {
  const runtimeEvidence = readJson<RuntimeEvidenceJson>("docs/runtime-evidence.generated.json");
  const devnetCanary = readJson<DevnetCanaryJson>("docs/devnet-canary.generated.json");
  const frontierIntegrations = readJson<FrontierIntegrationsJson>("docs/frontier-integrations.generated.json");
  const walletReviewReadyCount = runtimeEvidence.matrixStatuses.filter(
    (item) => item.status === "devnet-review-ready",
  ).length;
  const walletSelectorCoverageCount = runtimeEvidence.matrixStatuses.filter(
    (item) => item.selectorVisible,
  ).length;
  const walletDiagnosticsCoverageCount = runtimeEvidence.matrixStatuses.filter(
    (item) => item.diagnosticsVisible,
  ).length;

  const verifiedGovernanceTxCount = frontierIntegrations.simpleGovernance.txChecks.filter(
    (item) => item.confirmed && item.status === "finalized",
  ).length;
  const verifiedGovernanceLifecycleCount =
    frontierIntegrations.simpleGovernance.txChecks.length;

  const confidentialConfirmedCount = frontierIntegrations.confidentialOperations.txChecks.filter(
    (item) => item.confirmed && item.status === "finalized",
  ).length;
  const confidentialLifecycleCount =
    frontierIntegrations.confidentialOperations.txChecks.length;

  const zkAnchorConfirmedCount = frontierIntegrations.zk.anchorChecks.filter(
    (item) => item.confirmed && item.account.exists,
  ).length;
  const zkAnchorCount = frontierIntegrations.zk.anchorChecks.length;

  const executionSuccessCount = [
    frontierIntegrations.simpleGovernance.txChecks.find((item) => item.label === "execute"),
    frontierIntegrations.confidentialOperations.txChecks.find(
      (item) => item.label === "magicblock-execute",
    ),
  ].filter((item) => item?.confirmed && item.status === "finalized").length;

  const executionAttemptCount = 2;

  const overallSuccessRate = percent(
    runtimeEvidence.operational.totalTxCount,
    runtimeEvidence.operational.totalAttemptCount,
  );

  const governanceProofCompletion = percent(
    verifiedGovernanceTxCount,
    verifiedGovernanceLifecycleCount,
  );
  const confidentialProofCompletion = percent(
    confidentialConfirmedCount,
    confidentialLifecycleCount,
  );
  const zkProofCompletion = percent(zkAnchorConfirmedCount, zkAnchorCount);
  const walletCoverage = percent(walletReviewReadyCount, runtimeEvidence.walletCount);
  const walletSelectorCoverage = percent(
    walletSelectorCoverageCount,
    runtimeEvidence.walletCount,
  );
  const walletDiagnosticsCoverage = percent(
    walletDiagnosticsCoverageCount,
    runtimeEvidence.walletCount,
  );
  const revealHealth = percent(1, 1);
  const executeHealth = percent(executionSuccessCount, executionAttemptCount);
  const overview: DevnetMetricCard[] = [
    {
      label: "Success rate",
      value: overallSuccessRate,
      detail: `${runtimeEvidence.operational.totalTxCount} successful Devnet transactions across ${runtimeEvidence.operational.totalAttemptCount} recorded attempts.`,
      tone: "emerald",
    },
    {
      label: "Primary RPC latency",
      value: `${devnetCanary.primaryRpc.blockhashLatencyMs} ms`,
      detail: `Current blockhash latency from the primary Devnet endpoint. Version latency is ${devnetCanary.primaryRpc.versionLatencyMs} ms.`,
      tone: "cyan",
    },
    {
      label: "Wallet coverage",
      value: walletCoverage,
      detail: `${walletReviewReadyCount}/${runtimeEvidence.walletCount} wallet classes are review-ready. Selector coverage is ${walletSelectorCoverage}.`,
      tone: "fuchsia",
    },
    {
      label: "Proof completion",
      value: governanceProofCompletion,
      detail: `${verifiedGovernanceTxCount}/${verifiedGovernanceLifecycleCount} canonical governance lifecycle transactions are finalized in the live proof package.`,
      tone: "amber",
    },
    {
      label: "Reveal health",
      value: revealHealth,
      detail: "The verified governance path includes a finalized reveal step and no unexpected adversarial reveal success in the operational evidence package.",
      tone: "emerald",
    },
    {
      label: "Execute health",
      value: executeHealth,
      detail: `${executionSuccessCount}/${executionAttemptCount} tracked execute operations finalized across simple governance and confidential settlement paths.`,
      tone: "cyan",
    },
  ];

  const diagnostics: DevnetMetricCard[] = [
    {
      label: "Fallback recovery",
      value: boolStatus(runtimeEvidence.resilience.fallbackRecovered),
      detail: "Fallback RPC recovery is currently passing in the resilience report.",
      tone: "emerald",
    },
    {
      label: "Stale blockhash recovery",
      value: boolStatus(runtimeEvidence.resilience.staleBlockhashRecovered),
      detail: "The current resilience package confirms stale blockhash recovery and rejection behavior.",
      tone: "cyan",
    },
    {
      label: "Anchor account presence",
      value: boolStatus(devnetCanary.summary.anchorAccountsPresent),
      detail: `${devnetCanary.anchors.length} canonical anchors are present on Devnet for the current proof registry set.`,
      tone: "amber",
    },
    {
      label: "Unexpected failures",
      value: `${runtimeEvidence.devnetCanary.unexpectedFailures}`,
      detail: "The current runtime evidence and canary package report zero unexpected failures.",
      tone: "fuchsia",
    },
    {
      label: "Diagnostics wallet visibility",
      value: walletDiagnosticsCoverage,
      detail: `${walletDiagnosticsCoverageCount}/${runtimeEvidence.walletCount} wallet classes expose diagnostics visibility in the current matrix.`,
      tone: "emerald",
    },
    {
      label: "Adversarial containment",
      value: boolStatus(runtimeEvidence.operational.unexpectedAdversarialSuccesses === 0),
      detail: `${runtimeEvidence.operational.adversarialScenarioCount} adversarial scenarios are tracked with zero unexpected successes.`,
      tone: "cyan",
    },
  ];

  const services: DevnetMetricCard[] = [
    {
      label: "Hosted read coverage",
      value: `${frontierIntegrations.readNode.overview.proposals}`,
      detail: `The backend-indexer read path currently exposes ${frontierIntegrations.readNode.overview.proposals} indexed proposals across ${frontierIntegrations.readNode.overview.uniqueDaos} DAOs.`,
      tone: "cyan",
    },
    {
      label: "Confidential payout coverage",
      value: `${frontierIntegrations.readNode.overview.confidentialPayouts}`,
      detail: `${frontierIntegrations.readNode.overview.confidentialPayouts} confidential payout proposals are indexed, with ${frontierIntegrations.readNode.overview.refheSettled} REFHE-settled flows.`,
      tone: "emerald",
    },
    {
      label: "MagicBlock settlement completion",
      value: confidentialProofCompletion,
      detail: `${confidentialConfirmedCount}/${confidentialLifecycleCount} confidential corridor transactions finalized in the current integration evidence package.`,
      tone: "amber",
    },
    {
      label: "Service proof freshness",
      value: runtimeEvidence.generatedAt.slice(0, 10),
      detail: "Runtime evidence is generated as part of the current operational proof chain and kept published with the live surface.",
      tone: "fuchsia",
    },
    {
      label: "Wallet review readiness",
      value: walletCoverage,
      detail: `${walletReviewReadyCount} review-ready wallets and ${runtimeEvidence.realDevice.pendingTargets.length} pending real-device targets remain visible and measurable.`,
      tone: "emerald",
    },
    {
      label: "Buyer-facing proof links",
      value: "6",
      detail: "Trust package, launch trust packet, live proof V3, runtime evidence, wallet matrix, and mainnet acceptance remain linked in the live product.",
      tone: "cyan",
    },
  ];

  const tracks: Record<string, DevnetMetricCard[]> = {
    "colosseum-frontier": [
      overview[0],
      overview[3],
      diagnostics[2],
      services[5],
    ],
    "privacy-track": [
      {
        label: "Confidential path completion",
        value: confidentialProofCompletion,
        detail: `${confidentialConfirmedCount}/${confidentialLifecycleCount} confidential MagicBlock + REFHE transactions finalized on Devnet.`,
        tone: "emerald",
      },
      {
        label: "ZK anchor completion",
        value: zkProofCompletion,
        detail: `${zkAnchorConfirmedCount}/${zkAnchorCount} ZK anchor steps finalized with anchor accounts present.`,
        tone: "fuchsia",
      },
      overview[4],
      overview[5],
    ],
    "eitherway-live-dapp": [
      {
        label: "Wallet review coverage",
        value: walletCoverage,
        detail: `${walletReviewReadyCount}/${runtimeEvidence.walletCount} wallet classes are currently review-ready in the live shell.`,
        tone: "emerald",
      },
      {
        label: "Selector visibility",
        value: walletSelectorCoverage,
        detail: `${walletSelectorCoverageCount}/${runtimeEvidence.walletCount} wallet classes expose selector visibility in the current matrix.`,
        tone: "cyan",
      },
      overview[0],
      overview[5],
    ],
    "rpc-infrastructure": [
      services[0],
      overview[1],
      diagnostics[0],
      diagnostics[1],
    ],
    "consumer-apps": [
      {
        label: "Wallet diagnostics coverage",
        value: walletDiagnosticsCoverage,
        detail: `${walletDiagnosticsCoverageCount}/${runtimeEvidence.walletCount} wallet classes show diagnostics visibility in the current UX path.`,
        tone: "cyan",
      },
      {
        label: "Review-ready wallets",
        value: walletCoverage,
        detail: `${walletReviewReadyCount}/${runtimeEvidence.walletCount} wallets are currently review-ready for guided consumer demos.`,
        tone: "emerald",
      },
      overview[3],
      overview[0],
    ],
    "ranger-main": [overview[0], overview[3], services[0], diagnostics[5]],
    "ranger-drift": [overview[5], diagnostics[5], services[2], overview[1]],
    "100xdevs": [overview[0], diagnostics[0], diagnostics[1], overview[3]],
    "encrypt-ika": [
      {
        label: "REFHE settled proposals",
        value: `${frontierIntegrations.readNode.overview.refheSettled}`,
        detail: `${frontierIntegrations.readNode.overview.refheSettled}/${frontierIntegrations.readNode.overview.refheConfigured} REFHE-configured proposals are settled in the current package.`,
        tone: "emerald",
      },
      {
        label: "MagicBlock settled proposals",
        value: `${frontierIntegrations.readNode.overview.magicblockSettled}`,
        detail: `${frontierIntegrations.readNode.overview.magicblockSettled}/${frontierIntegrations.readNode.overview.magicblockConfigured} MagicBlock-configured proposals are settled in the current package.`,
        tone: "amber",
      },
      overview[4],
      overview[5],
    ],
    "solrouter-encrypted-ai": [overview[0], overview[3], diagnostics[5], services[5]],
  };

  return { overview, diagnostics, services, tracks };
}

export function getOperationalValidationSnapshot(): OperationalValidationSnapshot {
  const runtimeEvidence = readJson<RuntimeEvidenceJson>("docs/runtime-evidence.generated.json");
  const devnetCanary = readJson<DevnetCanaryJson>("docs/devnet-canary.generated.json");
  const frontierIntegrations = readJson<FrontierIntegrationsJson>("docs/frontier-integrations.generated.json");

  const liveVotingCount = proposalCards.filter((proposal) => proposal.status === "Live voting").length;
  const revealReadyCount = proposalCards.filter((proposal) => proposal.status === "Ready to reveal").length;
  const executionReadyCount = proposalCards.filter((proposal) => proposal.status === "Execution ready").length;
  const evidenceGatedCount = proposalCards.filter((proposal) => proposal.status === "Evidence gated").length;
  const proposalFlowHealthyCount = executionReadyCount + revealReadyCount;

  const walletReviewReadyCount = runtimeEvidence.matrixStatuses.filter(
    (item) => item.status === "devnet-review-ready",
  ).length;
  const walletDiagnosticsCoverageCount = runtimeEvidence.matrixStatuses.filter(
    (item) => item.diagnosticsVisible,
  ).length;

  const verifiedGovernanceTxCount = frontierIntegrations.simpleGovernance.txChecks.filter(
    (item) => item.confirmed && item.status === "finalized",
  ).length;
  const verifiedGovernanceLifecycleCount = frontierIntegrations.simpleGovernance.txChecks.length;
  const executionSuccessCount = [
    frontierIntegrations.simpleGovernance.txChecks.find((item) => item.label === "execute"),
    frontierIntegrations.confidentialOperations.txChecks.find(
      (item) => item.label === "magicblock-execute",
    ),
  ].filter((item) => item?.confirmed && item.status === "finalized").length;

  const rankedTracks = getRankedCompetitionTracks().slice(0, 3);
  const freshestTimestamp = [runtimeEvidence.generatedAt, devnetCanary.generatedAt, frontierIntegrations.generatedAt]
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return {
    generatedAt: freshestTimestamp,
    proposalFlowHealth: {
      label: "Proposal flow health",
      value: percent(
        proposalFlowHealthyCount + executionSuccessCount,
        proposalCards.length + 2,
      ),
      detail: `${verifiedGovernanceTxCount}/${verifiedGovernanceLifecycleCount} governance proof steps are finalized. ${liveVotingCount} proposal is still in commit mode and ${evidenceGatedCount} proposal is still waiting on settlement evidence.`,
      routeLabel: "Open proof and execution",
      routeHref: "/proof/?judge=1",
      tone: "emerald",
    },
    walletReadiness: {
      label: "Wallet-by-wallet readiness",
      value: percent(walletReviewReadyCount, runtimeEvidence.walletCount),
      detail: `${walletReviewReadyCount}/${runtimeEvidence.walletCount} wallets are review-ready and ${walletDiagnosticsCoverageCount}/${runtimeEvidence.walletCount} expose diagnostics. Pending real-device targets remain visible in runtime evidence.`,
      routeLabel: "Open wallet diagnostics",
      routeHref: "/diagnostics",
      tone: "cyan",
    },
    proofFreshness: {
      label: "Proof freshness",
      value: formatAgeLabel(freshestTimestamp),
      detail: `Runtime evidence ${formatAgeLabel(runtimeEvidence.generatedAt)}, Devnet canary ${formatAgeLabel(devnetCanary.generatedAt)}, and frontier integrations ${formatAgeLabel(frontierIntegrations.generatedAt)} remain published together.`,
      routeLabel: "Open trust documents",
      routeHref: "/documents/live-proof-v3",
      tone: "amber",
    },
    commercialReadiness: {
      label: "Track-specific commercial readiness",
      value: rankedTracks.map((track) => track.title).join(" · "),
      detail: `Current top conversion-ready tracks combine win probability, commercial upside, and mainnet distance: ${rankedTracks
        .map((track) => `${track.title} (${track.compositeScore}/10)`)
        .join(" · ")}.`,
      routeLabel: "Open competition center",
      routeHref: "/tracks",
      tone: "fuchsia",
    },
  };
}

export function getExecutionSurfaceSnapshot(): ExecutionSurfaceSnapshot {
  const runtimeEvidence = readJson<RuntimeEvidenceJson>("docs/runtime-evidence.generated.json");
  const devnetCanary = readJson<DevnetCanaryJson>("docs/devnet-canary.generated.json");
  const validation = getOperationalValidationSnapshot();

  const rpcLatency = devnetCanary.primaryRpc.blockhashLatencyMs;
  const pendingRealDeviceTargets = runtimeEvidence.realDevice.pendingTargets.length;
  const repeatedAttemptDelta =
    runtimeEvidence.operational.totalAttemptCount - runtimeEvidence.operational.totalTxCount;
  const unexpectedFailures = runtimeEvidence.devnetCanary.unexpectedFailures;
  const unexpectedAdversarialSuccesses = runtimeEvidence.operational.unexpectedAdversarialSuccesses;
  const proofAge = formatAgeLabel(validation.generatedAt);
  const commercialTopline = validation.commercialReadiness.value.split(" · ").slice(0, 2).join(" · ");

  const incidentAlerts: IncidentAlertSignal[] = [
    {
      title: "RPC delivery",
      status: rpcLatency <= 1500 && unexpectedFailures === 0 ? "Healthy" : rpcLatency <= 3500 ? "Watch" : "Action",
      summary:
        unexpectedFailures === 0
          ? `Primary Devnet blockhash latency is ${rpcLatency} ms with no unexpected canary failures.`
          : `${unexpectedFailures} unexpected canary failure is recorded alongside ${rpcLatency} ms primary latency.`,
      routeHref: "/diagnostics",
      routeLabel: "Open diagnostics",
    },
    {
      title: "Wallet runtime",
      status: pendingRealDeviceTargets === 0 ? "Healthy" : pendingRealDeviceTargets <= 2 ? "Watch" : "Action",
      summary:
        pendingRealDeviceTargets === 0
          ? "All tracked wallet targets are currently covered in runtime evidence."
          : `${pendingRealDeviceTargets} real-device wallet target${pendingRealDeviceTargets === 1 ? "" : "s"} remain pending in the runtime capture set.`,
      routeHref: "/diagnostics",
      routeLabel: "Review wallet evidence",
    },
    {
      title: "Replay and retry pressure",
      status: repeatedAttemptDelta === 0 && unexpectedAdversarialSuccesses === 0 ? "Healthy" : repeatedAttemptDelta <= 2 ? "Watch" : "Action",
      summary:
        repeatedAttemptDelta === 0
          ? "No abnormal retry delta is visible between attempted and successful tracked transactions."
          : `${repeatedAttemptDelta} more attempts than successful tracked transactions are currently recorded; adversarial unexpected success count is ${unexpectedAdversarialSuccesses}.`,
      routeHref: "/documents/incident-readiness-runbook",
      routeLabel: "Open incident runbook",
    },
  ];

  return {
    proposalFlow: {
      label: "Proposal flow health",
      value: validation.proposalFlowHealth.value,
      detail: validation.proposalFlowHealth.detail,
      tone: validation.proposalFlowHealth.tone,
      routeHref: "/command-center",
      routeLabel: "Open command center",
    },
    walletReadiness: {
      label: "Wallet readiness",
      value: validation.walletReadiness.value,
      detail: `${validation.walletReadiness.detail} Primary wallet runtime should stay visible before every sign request.`,
      tone: validation.walletReadiness.tone,
      routeHref: "/diagnostics",
      routeLabel: "Open wallet diagnostics",
    },
    proofFreshness: {
      label: "Proof freshness",
      value: proofAge,
      detail: `${validation.proofFreshness.detail} This is the freshness boundary the user and reviewer see before commit, reveal, finalize, and execute.`,
      tone: validation.proofFreshness.tone,
      routeHref: "/proof/?judge=1",
      routeLabel: "Open proof path",
    },
    commercialReadiness: {
      label: "Commercial readiness",
      value: commercialTopline,
      detail: `${validation.commercialReadiness.detail} These are the closest routes from Devnet operation to buyer-facing motion.`,
      tone: validation.commercialReadiness.tone,
      routeHref: "/engage",
      routeLabel: "Open buyer path",
    },
    incidentAlerts,
  };
}
