import fs from "fs";
import path from "path";

type RuntimeEvidence = {
  project: string;
  generatedAt: string;
  diagnosticsPage: string;
  walletCount: number;
  realDevice: {
    status: string;
    pendingTargets: string[];
  };
  devnetCanary: {
    unexpectedFailures: number;
  };
  resilience: {
    fallbackRecovered: boolean;
    staleBlockhashRecovered: boolean;
  };
  operational: {
    totalTxCount: number;
    totalAttemptCount: number;
    unexpectedAdversarialSuccesses: number;
  };
};

type FrontierIntegrations = {
  project: string;
  generatedAt: string;
  reviewerEntry: string;
  readNode: {
    readPath: string;
    rpcEndpoint: string;
    overview: {
      proposals: number;
      uniqueDaos: number;
      confidentialPayouts: number;
      magicblockConfigured: number;
      magicblockSettled: number;
      refheConfigured: number;
      refheSettled: number;
      refheWithVerifier: number;
    };
  };
  simpleGovernance: {
    verificationStatus: string;
    txChecks: Array<{ confirmed: boolean; status: string }>;
  };
  confidentialOperations: {
    status: string;
    txChecks: Array<{ confirmed: boolean; status: string }>;
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

type ReadNodeSnapshot = {
  generatedAt: string;
  readPath: string;
  runtime: {
    rpcEndpoint: string;
    slot: number;
    programId: string;
    commitment: string;
  };
  counts: {
    proposals: number;
    executed: number;
    executable: number;
    timelocked: number;
    confidentialPayouts: number;
    uniqueDaos: number;
  };
  overview: {
    magicblockSettled: number;
    refheSettled: number;
  };
};

type DevnetMetricCard = {
  label: string;
  value: string;
  detail: string;
  tone: "cyan" | "emerald" | "amber" | "fuchsia";
};

type OperationalValidationCard = {
  label: string;
  value: string;
  detail: string;
  routeLabel: string;
  routeHref: string;
  tone: "cyan" | "emerald" | "amber" | "fuchsia";
};

type DevnetMetricsModule = {
  getDevnetServiceMetrics: () => {
    overview: DevnetMetricCard[];
    diagnostics: DevnetMetricCard[];
    services: DevnetMetricCard[];
  };
  getOperationalValidationSnapshot: () => {
    generatedAt: string;
    proposalFlowHealth: OperationalValidationCard;
    walletReadiness: OperationalValidationCard;
    proofFreshness: OperationalValidationCard;
    commercialReadiness: OperationalValidationCard;
  };
};

type ReviewerTelemetryPacket = {
  project: string;
  generatedAt: string;
  reviewerIntent: string;
  truthSources: Array<{ label: string; generatedAt: string; href: string }>;
  whatWorksNow: string[];
  externallyProvenNow: string[];
  exactBoundary: string[];
  hostedReadProof: {
    readPath: string;
    rpcEndpoint: string;
    slot: number;
    programId: string;
    commitment: string;
    proposals: number;
    uniqueDaos: number;
  };
  runtimeSnapshot: {
    diagnosticsPage: string;
    walletCount: number;
    unexpectedFailures: number;
    fallbackRecovered: boolean;
    staleBlockhashRecovered: boolean;
    pendingRealDeviceTargets: number;
  };
  integrationsSnapshot: {
    governanceStatus: string;
    confidentialStatus: string;
    governanceFinalizedCount: number;
    governanceTotalCount: number;
    confidentialFinalizedCount: number;
    confidentialTotalCount: number;
    zkAnchorsConfirmed: number;
    zkAnchorsTotal: number;
  };
  exportReadySummaries: Array<OperationalValidationCard | (DevnetMetricCard & { routeLabel: string; routeHref: string })>;
  reviewerFirstPath: Array<{ label: string; href: string; reason: string }>;
  bestDemoRoute: {
    start: string;
    sequence: string[];
    explanation: string;
  };
  linkedDocs: string[];
  liveRoutes: string[];
  commands: string[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

function finalizedCount(entries: Array<{ confirmed: boolean; status: string }>) {
  return entries.filter((entry) => entry.confirmed && entry.status === "finalized").length;
}

function main() {
  const runtimeEvidence = readJson<RuntimeEvidence>("docs/runtime-evidence.generated.json");
  const frontierIntegrations = readJson<FrontierIntegrations>("docs/frontier-integrations.generated.json");
  const readNodeSnapshot = readJson<ReadNodeSnapshot>("docs/read-node/snapshot.generated.json");

  const repoRoot = process.cwd();
  process.chdir(path.resolve(repoRoot, "apps/web"));
  // Load the metrics module from the app so this packet stays synced to the same summaries used by the UI.
  const metricsModule = require(path.resolve(
    repoRoot,
    "apps/web/src/lib/devnet-service-metrics",
  )) as DevnetMetricsModule;
  const devnetMetrics = metricsModule.getDevnetServiceMetrics();
  const validation = metricsModule.getOperationalValidationSnapshot();
  process.chdir(repoRoot);

  const governanceFinalizedCount = finalizedCount(frontierIntegrations.simpleGovernance.txChecks);
  const confidentialFinalizedCount = finalizedCount(frontierIntegrations.confidentialOperations.txChecks);
  const zkAnchorsConfirmed = frontierIntegrations.zk.anchorChecks.filter(
    (entry) => entry.confirmed && entry.account.exists,
  ).length;

  const exportReadySummaries: ReviewerTelemetryPacket["exportReadySummaries"] = [
    validation.proposalFlowHealth,
    validation.walletReadiness,
    validation.proofFreshness,
    {
      ...devnetMetrics.services[0],
      routeLabel: "Open services",
      routeHref: "/services",
    },
    {
      ...devnetMetrics.services[2],
      routeLabel: "Open diagnostics",
      routeHref: "/diagnostics",
    },
    {
      ...devnetMetrics.overview[1],
      routeLabel: "Open analytics",
      routeHref: "/analytics",
    },
  ];

  const payload: ReviewerTelemetryPacket = {
    project: runtimeEvidence.project,
    generatedAt: new Date().toISOString(),
    reviewerIntent:
      "Show the shortest truth-synced route into runtime maturity, hosted reads, indexed governance, and infrastructure-facing reviewer value without claiming unsupported partnerships or mainnet readiness.",
    truthSources: [
      {
        label: "Runtime evidence",
        generatedAt: runtimeEvidence.generatedAt,
        href: "docs/runtime-evidence.generated.md",
      },
      {
        label: "Frontier integrations",
        generatedAt: frontierIntegrations.generatedAt,
        href: "docs/frontier-integrations.generated.md",
      },
      {
        label: "Read-node snapshot",
        generatedAt: readNodeSnapshot.generatedAt,
        href: "docs/read-node/snapshot.generated.md",
      },
      {
        label: "Devnet service metrics",
        generatedAt: validation.generatedAt,
        href: "apps/web/src/lib/devnet-service-metrics.ts",
      },
    ],
    whatWorksNow: [
      `Hosted reads expose ${readNodeSnapshot.counts.proposals} indexed proposals across ${readNodeSnapshot.counts.uniqueDaos} DAOs through the backend-indexer path.`,
      `Diagnostics, analytics, and services remain live reviewer-visible routes starting from ${runtimeEvidence.diagnosticsPage}.`,
      `${governanceFinalizedCount}/${frontierIntegrations.simpleGovernance.txChecks.length} canonical governance lifecycle transactions are finalized in the current integrations package.`,
      `${confidentialFinalizedCount}/${frontierIntegrations.confidentialOperations.txChecks.length} confidential settlement corridor transactions are finalized in the current integrations package.`,
      `${readNodeSnapshot.overview.refheSettled} REFHE-settled and ${readNodeSnapshot.overview.magicblockSettled} MagicBlock-settled proposal paths are already reflected in the indexed source.`,
    ],
    externallyProvenNow: [
      `Runtime evidence package generated at ${runtimeEvidence.generatedAt} and published as docs/runtime-evidence.generated.md.`,
      `Frontier integrations package generated at ${frontierIntegrations.generatedAt} with reviewer entry ${frontierIntegrations.reviewerEntry}.`,
      `Read-node snapshot generated at ${readNodeSnapshot.generatedAt} on slot ${readNodeSnapshot.runtime.slot} against ${readNodeSnapshot.runtime.rpcEndpoint}.`,
      `Proposal flow health, wallet readiness, and proof freshness summaries are taken from the same devnet service metrics module used by the live app.`,
      `Unexpected runtime failures remain ${runtimeEvidence.devnetCanary.unexpectedFailures} and unexpected adversarial successes remain ${runtimeEvidence.operational.unexpectedAdversarialSuccesses}.`,
    ],
    exactBoundary: [
      "This packet does not claim live third-party analytics partnerships.",
      "It does not claim production mainnet custody or launch approval.",
      "It does not replace canonical custody proof, launch trust packet, or mainnet blockers.",
      "Pending real-device captures remain explicit and are not hidden behind aggregate metrics.",
    ],
    hostedReadProof: {
      readPath: readNodeSnapshot.readPath,
      rpcEndpoint: readNodeSnapshot.runtime.rpcEndpoint,
      slot: readNodeSnapshot.runtime.slot,
      programId: readNodeSnapshot.runtime.programId,
      commitment: readNodeSnapshot.runtime.commitment,
      proposals: readNodeSnapshot.counts.proposals,
      uniqueDaos: readNodeSnapshot.counts.uniqueDaos,
    },
    runtimeSnapshot: {
      diagnosticsPage: runtimeEvidence.diagnosticsPage,
      walletCount: runtimeEvidence.walletCount,
      unexpectedFailures: runtimeEvidence.devnetCanary.unexpectedFailures,
      fallbackRecovered: runtimeEvidence.resilience.fallbackRecovered,
      staleBlockhashRecovered: runtimeEvidence.resilience.staleBlockhashRecovered,
      pendingRealDeviceTargets: runtimeEvidence.realDevice.pendingTargets.length,
    },
    integrationsSnapshot: {
      governanceStatus: frontierIntegrations.simpleGovernance.verificationStatus,
      confidentialStatus: frontierIntegrations.confidentialOperations.status,
      governanceFinalizedCount,
      governanceTotalCount: frontierIntegrations.simpleGovernance.txChecks.length,
      confidentialFinalizedCount,
      confidentialTotalCount: frontierIntegrations.confidentialOperations.txChecks.length,
      zkAnchorsConfirmed,
      zkAnchorsTotal: frontierIntegrations.zk.anchorChecks.length,
    },
    exportReadySummaries,
    reviewerFirstPath: [
      {
        label: "Open telemetry packet",
        href: "/documents/reviewer-telemetry-packet",
        reason: "Start from the generated truth-synced packet instead of inferring readiness from multiple pages.",
      },
      {
        label: "Open diagnostics",
        href: "/diagnostics",
        reason: "Validate runtime health and reviewer-visible operational signals.",
      },
      {
        label: "Open analytics",
        href: "/analytics",
        reason: "Inspect export-ready summaries sourced from the same metrics module.",
      },
      {
        label: "Open services",
        href: "/services",
        reason: "Confirm the hosted-read and buyer-facing infrastructure route.",
      },
    ],
    bestDemoRoute: {
      start: "/services",
      sequence: ["/services", "/diagnostics", "/analytics", "/documents/reviewer-telemetry-packet"],
      explanation:
        "Lead with the buyer-visible infrastructure surface, then validate runtime health, then show export-ready analytics summaries, and finally land on the reviewer packet that binds the same truth sources together.",
    },
    linkedDocs: [
      "docs/reviewer-telemetry-packet.generated.md",
      "docs/runtime-evidence.generated.md",
      "docs/frontier-integrations.generated.md",
      "docs/read-node/snapshot.generated.md",
      "docs/launch-trust-packet.generated.md",
      "docs/canonical-custody-proof.generated.md",
    ],
    liveRoutes: [
      "https://privatedao.org/services/",
      "https://privatedao.org/diagnostics/",
      "https://privatedao.org/analytics/",
      "https://privatedao.org/documents/reviewer-telemetry-packet/",
    ],
    commands: [
      "npm run build:reviewer-telemetry-packet",
      "npm run verify:reviewer-telemetry-packet",
      "npm run build:runtime-evidence",
      "npm run verify:runtime-evidence",
      "npm run build:frontier-integrations",
      "npm run verify:frontier-integrations",
      "npm run build:read-node-snapshot",
      "npm run verify:read-node-snapshot",
    ],
  };

  fs.writeFileSync(
    path.resolve("docs/reviewer-telemetry-packet.generated.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.resolve("docs/reviewer-telemetry-packet.generated.md"),
    buildMarkdown(payload),
  );

  console.log("Wrote reviewer telemetry packet");
}

function buildMarkdown(payload: ReviewerTelemetryPacket) {
  return `# Reviewer Telemetry Packet

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- reviewer intent: ${payload.reviewerIntent}

## Truth Sources

${payload.truthSources.map((entry) => `- ${entry.label}: \`${entry.generatedAt}\` via \`${entry.href}\``).join("\n")}

## What Works Now

${payload.whatWorksNow.map((entry) => `- ${entry}`).join("\n")}

## What Is Externally Or Operationally Proven Now

${payload.externallyProvenNow.map((entry) => `- ${entry}`).join("\n")}

## Hosted-Read Proof

- read path: \`${payload.hostedReadProof.readPath}\`
- rpc endpoint: \`${payload.hostedReadProof.rpcEndpoint}\`
- slot: \`${payload.hostedReadProof.slot}\`
- program id: \`${payload.hostedReadProof.programId}\`
- commitment: \`${payload.hostedReadProof.commitment}\`
- indexed proposals: \`${payload.hostedReadProof.proposals}\`
- indexed DAOs: \`${payload.hostedReadProof.uniqueDaos}\`

## Runtime Snapshot

- diagnostics page: \`${payload.runtimeSnapshot.diagnosticsPage}\`
- wallet count: \`${payload.runtimeSnapshot.walletCount}\`
- unexpected failures: \`${payload.runtimeSnapshot.unexpectedFailures}\`
- fallback recovered: \`${payload.runtimeSnapshot.fallbackRecovered}\`
- stale blockhash recovered: \`${payload.runtimeSnapshot.staleBlockhashRecovered}\`
- pending real-device targets: \`${payload.runtimeSnapshot.pendingRealDeviceTargets}\`

## Integrations Snapshot

- governance status: \`${payload.integrationsSnapshot.governanceStatus}\`
- confidential status: \`${payload.integrationsSnapshot.confidentialStatus}\`
- governance finalized: \`${payload.integrationsSnapshot.governanceFinalizedCount}/${payload.integrationsSnapshot.governanceTotalCount}\`
- confidential finalized: \`${payload.integrationsSnapshot.confidentialFinalizedCount}/${payload.integrationsSnapshot.confidentialTotalCount}\`
- zk anchors confirmed: \`${payload.integrationsSnapshot.zkAnchorsConfirmed}/${payload.integrationsSnapshot.zkAnchorsTotal}\`

## Export-Ready Summaries

${payload.exportReadySummaries
  .map(
    (entry) =>
      `- ${entry.label}: ${entry.value} — ${entry.detail} (${entry.routeLabel}: ${entry.routeHref})`,
  )
  .join("\n")}

## Reviewer-First Path

${payload.reviewerFirstPath.map((entry, index) => `${index + 1}. ${entry.label}: ${entry.reason} (${entry.href})`).join("\n")}

## Best Demo Route

- start: \`${payload.bestDemoRoute.start}\`
- sequence: ${payload.bestDemoRoute.sequence.map((entry) => `\`${entry}\``).join(" -> ")}
- explanation: ${payload.bestDemoRoute.explanation}

## Exact Boundary

${payload.exactBoundary.map((entry) => `- ${entry}`).join("\n")}

## Linked Docs

${payload.linkedDocs.map((entry) => `- \`${entry}\``).join("\n")}

## Live Routes

${payload.liveRoutes.map((entry) => `- ${entry}`).join("\n")}

## Canonical Commands

${payload.commands.map((entry) => `- \`${entry}\``).join("\n")}
`;
}

main();
