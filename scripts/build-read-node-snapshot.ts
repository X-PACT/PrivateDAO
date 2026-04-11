// SPDX-License-Identifier: AGPL-3.0-or-later
import fs from "fs";
import path from "path";
import { PrivateDaoReadNode } from "./lib/read-node";

type ProposalReportEntry = {
  label: string;
  recipient?: string;
  proposalPublicKey: string;
  proposalId?: string;
  createProposalTx?: string;
  commitTxs?: string[];
  revealTxs?: string[];
  finalizeTx?: string;
  executeTx?: string;
};

type DevnetMultiProposalReport = {
  proposals?: ProposalReportEntry[];
};

type TxCheck = {
  label: string;
  signature: string;
  endpoint: string;
  status: string;
  slot: number;
  confirmed: boolean;
};

type FrontierIntegrations = {
  confidentialOperations?: {
    status?: string;
    txChecks?: TxCheck[];
  };
};

type PresentationStatus =
  | "Live voting"
  | "Ready to reveal"
  | "Timelocked"
  | "Execution ready"
  | "Evidence gated"
  | "Executed";

type FeaturedProposalContexts = ReturnType<typeof buildFeaturedProposalContexts>;

type ProposalRegistryEntry = {
  id: string;
  title: string;
  type: string;
  status: PresentationStatus;
  quorum: string;
  window: string;
  treasury: string;
  privacy: string;
  tech: string[];
  summary: string;
  execution: FeaturedProposalContexts[keyof FeaturedProposalContexts];
};

const ROOT = path.resolve(__dirname, "..");
const JSON_PATH = path.join(ROOT, "docs/read-node/snapshot.generated.json");
const MD_PATH = path.join(ROOT, "docs/read-node/snapshot.generated.md");
const FRONTEND_TS_PATH = path.join(ROOT, "apps/web/src/lib/read-node-proposal-context.generated.ts");

const FEATURED_PROPOSAL_KEYS = {
  payroll: "52UpWHJodPWQzpR8u2qqpgwo3jRB7mvjgwCnf8oSJuXX",
  gaming: "QwRmN5WFDL7AxXT8fjcZNhy53cgLk7UWnJ5qB2CmRaJ",
  grant: "A5Hd89vpCTVPALhuwurLQvyAkHyrNGhvZtAcJvBmuJ9U",
} as const;

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filePath), "utf8")) as T;
}

function formatLamportsToSol(lamports: number) {
  return Number((lamports / 1_000_000_000).toFixed(4));
}

function formatRawUnits(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatTimelockLabel(seconds: number | null | undefined) {
  if (typeof seconds !== "number" || Number.isNaN(seconds) || seconds <= 0) {
    return "Execution delay is not available from the indexed DAO record";
  }

  if (seconds < 60) {
    return `${seconds} second on-chain execution delay from the indexed DAO record`;
  }

  if (seconds < 3600) {
    const minutes = Number((seconds / 60).toFixed(1));
    return `${minutes} minute on-chain execution delay from the indexed DAO record`;
  }

  const hours = Number((seconds / 3600).toFixed(2));
  return `${hours} hour on-chain execution delay from the indexed DAO record`;
}

function formatSourceLabel(title: string, phase: string) {
  return `Backend-indexed proposal record: ${title} (${phase})`;
}

function mapIndexedPhaseToPresentationStatus(
  phase: string,
  options?: {
    hasConfidentialPayout?: boolean;
    payoutFunded?: boolean;
    payoutSettled?: boolean;
  },
): PresentationStatus {
  if (phase === "Executed") {
    return "Executed";
  }

  if (phase === "Executable") {
    return "Execution ready";
  }

  if (phase === "Timelocked") {
    return "Timelocked";
  }

  if (phase === "Reveal") {
    return "Ready to reveal";
  }

  if (phase === "Voting") {
    return "Live voting";
  }

  if (
    phase === "Finalized" &&
    options?.hasConfidentialPayout &&
    (!options.payoutFunded || !options.payoutSettled)
  ) {
    return "Evidence gated";
  }

  if (phase === "Finalized") {
    return "Timelocked";
  }

  return "Evidence gated";
}

function buildWindowSummary(phase: string, status: PresentationStatus) {
  if (status === "Executed") {
    return "Commit closed · Reveal complete · Executed on devnet";
  }

  if (status === "Execution ready") {
    return "Commit closed · Reveal complete · Timelock cleared";
  }

  if (status === "Timelocked") {
    return "Voting closed · Finalized on devnet · Timelock still active";
  }

  if (status === "Ready to reveal") {
    return "Commit closed · Reveal window is open";
  }

  if (status === "Live voting") {
    return "Commit window still open on the indexed proposal record";
  }

  if (phase === "Finalized") {
    return "Voting closed · Finalized on devnet · Settlement evidence still incomplete";
  }

  return "Execution boundary still depends on explicit evidence completion";
}

function buildTreasurySummary(
  proposal: Awaited<ReturnType<PrivateDaoReadNode["fetchProposals"]>>[number],
  status: PresentationStatus,
) {
  if (proposal.treasuryAction) {
    const amount = formatLamportsToSol(proposal.treasuryAction.amountLamports);
    const asset = proposal.treasuryAction.tokenMint ? "SPL token" : "SOL";
    const recipient = `${proposal.treasuryAction.recipient.slice(0, 4)}…${proposal.treasuryAction.recipient.slice(-4)}`;
    const verb = status === "Executed" ? "sent" : status === "Execution ready" ? "ready to send" : "queued to send";
    return `${amount} ${asset} ${verb} to ${recipient}`;
  }

  if (proposal.confidentialPayoutPlan) {
    const recipient = `${proposal.confidentialPayoutPlan.settlementRecipient.slice(0, 4)}…${proposal.confidentialPayoutPlan.settlementRecipient.slice(-4)}`;
    const mint = proposal.confidentialPayoutPlan.tokenMint
      ? `${proposal.confidentialPayoutPlan.tokenMint.slice(0, 4)}…${proposal.confidentialPayoutPlan.tokenMint.slice(-4)}`
      : "native asset";
    const statusLead =
      status === "Executed"
        ? "Confidential payout executed"
        : status === "Evidence gated"
          ? "Confidential payout still gated"
          : "Confidential payout prepared";
    return `${statusLead} for ${formatRawUnits(proposal.confidentialPayoutPlan.totalAmount)} units to ${recipient} via mint ${mint}`;
  }

  return "Treasury action is still pending explicit indexing in the current proposal record";
}

function buildQuorumSummary(
  proposal: Awaited<ReturnType<PrivateDaoReadNode["fetchProposals"]>>[number],
) {
  if (!proposal.daoDetails) {
    return "Indexed DAO quorum is still unavailable in the current proposal record";
  }

  return `${proposal.daoDetails.quorumPercentage}% quorum · governance token requirement ${proposal.daoDetails.governanceTokenRequired}`;
}

function buildPrivacySummary(
  proposal: Awaited<ReturnType<PrivateDaoReadNode["fetchProposals"]>>[number],
) {
  if (proposal.refheEnvelope) {
    return "Commit-reveal + REFHE envelope";
  }

  if (proposal.magicblockCorridor) {
    return "Commit-reveal + MagicBlock settlement";
  }

  if (proposal.treasuryAction) {
    return "Commit-reveal + indexed treasury action";
  }

  return "Commit-reveal governance path";
}

function buildTechSummary(
  proposal: Awaited<ReturnType<PrivateDaoReadNode["fetchProposals"]>>[number],
) {
  const tech = new Set<string>();
  if (proposal.zkMode && proposal.zkMode !== "Disabled") {
    tech.add("ZK");
  }
  if (proposal.refheEnvelope) {
    tech.add("REFHE");
  }
  if (proposal.magicblockCorridor) {
    tech.add("MagicBlock");
  }
  tech.add("Fast RPC");
  return Array.from(tech);
}

function buildRegistrySummary(
  proposal: Awaited<ReturnType<PrivateDaoReadNode["fetchProposals"]>>[number],
  status: PresentationStatus,
) {
  const base = proposal.description.trim() || proposal.title;
  if (status === "Executed") {
    return `${base} This indexed proposal already executed on devnet and should be reviewed as proof, not as a pending signature flow.`;
  }
  if (status === "Evidence gated") {
    return `${base} The governance phase is complete, but settlement evidence still gates the commercial trust surface.`;
  }
  if (status === "Execution ready") {
    return `${base} The governance lifecycle is complete enough that the treasury path is ready to execute once the operator reviews the final packet.`;
  }
  return base;
}

function buildFeaturedProposalContexts(
  proposals: Awaited<ReturnType<PrivateDaoReadNode["fetchProposals"]>>,
  report: DevnetMultiProposalReport,
  integrations: FrontierIntegrations,
) {
  const proposalByPubkey = new Map(proposals.map((proposal) => [proposal.pubkey, proposal]));
  const reportByPubkey = new Map((report.proposals ?? []).map((proposal) => [proposal.proposalPublicKey, proposal]));
  const confidentialExecute = integrations.confidentialOperations?.txChecks?.find((entry) => entry.label === "magicblock-execute");

  const payroll = proposalByPubkey.get(FEATURED_PROPOSAL_KEYS.payroll);
  const gaming = proposalByPubkey.get(FEATURED_PROPOSAL_KEYS.gaming);
  const grant = proposalByPubkey.get(FEATURED_PROPOSAL_KEYS.grant);

  if (!payroll || !payroll.confidentialPayoutPlan) {
    throw new Error("featured payroll proposal missing from read-node snapshot");
  }

  if (!gaming || !gaming.confidentialPayoutPlan) {
    throw new Error("featured gaming proposal missing from read-node snapshot");
  }

  if (!grant || !grant.treasuryAction) {
    throw new Error("featured grant proposal missing treasury action in read-node snapshot");
  }

  const grantReport = reportByPubkey.get(grant.pubkey);
  const payrollStatus = mapIndexedPhaseToPresentationStatus(payroll.phase, {
    hasConfidentialPayout: true,
    payoutFunded: payroll.confidentialPayoutPlan.status === "Funded",
    payoutSettled: payroll.magicblockCorridor?.status === "Settled",
  });
  const gamingStatus = mapIndexedPhaseToPresentationStatus(gaming.phase, {
    hasConfidentialPayout: true,
    payoutFunded: gaming.confidentialPayoutPlan.status === "Funded",
    payoutSettled: gaming.magicblockCorridor?.status === "Settled",
  });
  const grantStatus = mapIndexedPhaseToPresentationStatus(grant.phase);

  return {
    payroll: {
      sourceType: "runtime-indexed",
      sourceLabel: formatSourceLabel(payroll.title, payroll.phase),
      indexedPhase: payroll.phase,
      proposalAccount: payroll.pubkey,
      daoAccount: payroll.dao,
      executionTarget: "Aggregate payroll payout to the confidential settlement wallet after governance clearance.",
      recipient: payroll.confidentialPayoutPlan.settlementRecipient,
      recipientLabel: "Confidential settlement wallet",
      recipientKnown: true,
      amount: payroll.confidentialPayoutPlan.totalAmount,
      amountDisplay: `${formatRawUnits(payroll.confidentialPayoutPlan.totalAmount)} raw token units`,
      mintSymbol: "SPL token",
      mintAddress: payroll.confidentialPayoutPlan.tokenMint,
      timelockHours:
        typeof payroll.daoDetails?.executionDelaySeconds === "number"
          ? Number((payroll.daoDetails.executionDelaySeconds / 3600).toFixed(6))
          : null,
      timelockLabel: formatTimelockLabel(payroll.daoDetails?.executionDelaySeconds),
      historicalUseCount: 1,
      repeatedAttempts: payroll.phase === "Executed" ? 0 : 1,
      baselineAmount: payroll.confidentialPayoutPlan.totalAmount,
      presentationStatus: payrollStatus,
      presentationWindow: buildWindowSummary(payroll.phase, payrollStatus),
      presentationTreasury: buildTreasurySummary(payroll, payrollStatus),
      phaseMappingLabel: `${payroll.phase} indexed phase maps to ${payrollStatus} in the product surface`,
      txContext: {
        proofStatus: integrations.confidentialOperations?.status ?? "runtime-indexed-confidential-path",
        evidenceRoute: "/proof/?judge=1",
        executeSignature: confidentialExecute?.signature,
      },
    },
    gaming: {
      sourceType: "runtime-indexed",
      sourceLabel: formatSourceLabel(gaming.title, gaming.phase),
      indexedPhase: gaming.phase,
      proposalAccount: gaming.pubkey,
      daoAccount: gaming.dao,
      executionTarget: "MagicBlock reward corridor with settlement gating before final distribution.",
      recipient: gaming.magicblockCorridor?.settlementWallet ?? gaming.confidentialPayoutPlan.settlementRecipient,
      recipientLabel: "MagicBlock settlement corridor",
      recipientKnown: true,
      amount: gaming.confidentialPayoutPlan.totalAmount,
      amountDisplay: `${formatRawUnits(gaming.confidentialPayoutPlan.totalAmount)} raw token units`,
      mintSymbol: "SPL token",
      mintAddress: gaming.confidentialPayoutPlan.tokenMint,
      timelockHours:
        typeof gaming.daoDetails?.executionDelaySeconds === "number"
          ? Number((gaming.daoDetails.executionDelaySeconds / 3600).toFixed(6))
          : null,
      timelockLabel: formatTimelockLabel(gaming.daoDetails?.executionDelaySeconds),
      historicalUseCount: 1,
      repeatedAttempts: gaming.phase === "Executed" ? 0 : 1,
      baselineAmount: gaming.confidentialPayoutPlan.totalAmount,
      presentationStatus: gamingStatus,
      presentationWindow: buildWindowSummary(gaming.phase, gamingStatus),
      presentationTreasury: buildTreasurySummary(gaming, gamingStatus),
      phaseMappingLabel: `${gaming.phase} indexed phase maps to ${gamingStatus} in the product surface`,
      txContext: {
        proofStatus: gaming.magicblockCorridor?.status === "Settled" ? "runtime-indexed-confidential-path" : "runtime-indexed-settlement-pending",
        evidenceRoute: "/proof/?judge=1",
      },
    },
    grant: {
      sourceType: "runtime-indexed",
      sourceLabel: formatSourceLabel(grant.title, grant.phase),
      indexedPhase: grant.phase,
      proposalAccount: grant.pubkey,
      daoAccount: grant.dao,
      executionTarget: "Send treasury funds to the approved beneficiary after governance finalization and unlock.",
      recipient: grant.treasuryAction.recipient,
      recipientLabel: "Treasury beneficiary",
      recipientKnown: true,
      amount: formatLamportsToSol(grant.treasuryAction.amountLamports),
      amountDisplay: `${formatLamportsToSol(grant.treasuryAction.amountLamports)} SOL`,
      mintSymbol: grant.treasuryAction.tokenMint ? "SPL token" : "SOL",
      mintAddress: grant.treasuryAction.tokenMint,
      timelockHours:
        typeof grant.daoDetails?.executionDelaySeconds === "number"
          ? Number((grant.daoDetails.executionDelaySeconds / 3600).toFixed(6))
          : null,
      timelockLabel: formatTimelockLabel(grant.daoDetails?.executionDelaySeconds),
      historicalUseCount: 1,
      repeatedAttempts: grantReport?.executeTx ? 0 : 1,
      baselineAmount: formatLamportsToSol(grant.treasuryAction.amountLamports),
      presentationStatus: grantStatus,
      presentationWindow: buildWindowSummary(grant.phase, grantStatus),
      presentationTreasury: buildTreasurySummary(grant, grantStatus),
      phaseMappingLabel: `${grant.phase} indexed phase maps to ${grantStatus} in the product surface`,
      txContext: {
        proofStatus: grantReport?.executeTx ? "verified-devnet-governance-path" : "runtime-indexed-governance-path",
        evidenceRoute: "/documents/reviewer-fast-path",
        createProposalSignature: grantReport?.createProposalTx,
        commitSignature: grantReport?.commitTxs?.[0],
        revealSignature: grantReport?.revealTxs?.[0],
        finalizeSignature: grantReport?.finalizeTx,
        executeSignature: grantReport?.executeTx,
      },
    },
  } as const;
}

function buildFeaturedProposalRegistry(
  proposals: Awaited<ReturnType<PrivateDaoReadNode["fetchProposals"]>>,
  contexts: FeaturedProposalContexts,
): ProposalRegistryEntry[] {
  const proposalByPubkey = new Map(proposals.map((proposal) => [proposal.pubkey, proposal]));
  const registrySpec = [
    { key: "payroll" as const, id: "PDAO-104", type: "Enterprise DAO", pubkey: FEATURED_PROPOSAL_KEYS.payroll },
    { key: "gaming" as const, id: "PDAO-105", type: "Gaming DAO", pubkey: FEATURED_PROPOSAL_KEYS.gaming },
    { key: "grant" as const, id: "PDAO-106", type: "Grant Committee", pubkey: FEATURED_PROPOSAL_KEYS.grant },
  ];

  return registrySpec.map((spec) => {
    const proposal = proposalByPubkey.get(spec.pubkey);
    if (!proposal) {
      throw new Error(`featured registry proposal missing from read-node snapshot: ${spec.pubkey}`);
    }

    const execution = contexts[spec.key];
    const status = execution.presentationStatus ?? "Evidence gated";

    return {
      id: spec.id,
      title: proposal.title,
      type: spec.type,
      status,
      quorum: buildQuorumSummary(proposal),
      window: execution.presentationWindow ?? buildWindowSummary(proposal.phase, status),
      treasury: execution.presentationTreasury ?? buildTreasurySummary(proposal, status),
      privacy: buildPrivacySummary(proposal),
      tech: buildTechSummary(proposal),
      summary: buildRegistrySummary(proposal, status),
      execution,
    };
  });
}

async function main() {
  const readNode = new PrivateDaoReadNode();
  const [runtime, proposals] = await Promise.all([
    readNode.getRuntimeSnapshot(false),
    readNode.fetchProposals({ force: false }),
  ]);
  const report = readJson<DevnetMultiProposalReport>("docs/devnet-multi-proposal-report.json");
  const integrations = readJson<FrontierIntegrations>("docs/frontier-integrations.generated.json");
  const profiles = readNode.getLoadProfiles();

  const counts = {
    proposals: proposals.length,
    executed: proposals.filter((proposal) => proposal.phase === "Executed").length,
    executable: proposals.filter((proposal) => proposal.phase === "Executable").length,
    timelocked: proposals.filter((proposal) => proposal.phase === "Timelocked").length,
    zkEnforced: proposals.filter((proposal) => proposal.zkMode === "ZkEnforced").length,
    confidentialPayouts: proposals.filter((proposal) => Boolean(proposal.confidentialPayoutPlan)).length,
    uniqueDaos: new Set(proposals.map((proposal) => proposal.dao)).size,
  };
  const overview = {
    generatedAt: new Date().toISOString(),
    proposals: proposals.length,
    uniqueDaos: counts.uniqueDaos,
    zkEnforced: counts.zkEnforced,
    confidentialPayouts: counts.confidentialPayouts,
    magicblockConfigured: proposals.filter((proposal) => Boolean(proposal.magicblockCorridor)).length,
    magicblockSettled: proposals.filter((proposal) => proposal.magicblockCorridor?.status === "Settled").length,
    refheConfigured: proposals.filter((proposal) => Boolean(proposal.refheEnvelope)).length,
    refheSettled: proposals.filter((proposal) => proposal.refheEnvelope?.status === "Settled").length,
    refheWithVerifier: proposals.filter((proposal) => Boolean(proposal.refheEnvelope?.verifierProgram)).length,
    executableConfidential: proposals.filter(
      (proposal) => Boolean(proposal.confidentialPayoutPlan) && proposal.phase === "Executable",
    ).length,
  };
  const featuredProposalContexts = buildFeaturedProposalContexts(proposals, report, integrations);
  const featuredProposalRegistry = buildFeaturedProposalRegistry(proposals, featuredProposalContexts);

  const payload = {
    generatedAt: new Date().toISOString(),
    readPath: "backend-indexer",
    runtime,
    cache: readNode.cacheStats(),
    counts,
    overview,
    profiles,
    featuredProposalContexts,
    featuredProposalRegistry,
    sample: proposals.slice(0, 5).map((proposal) => ({
      pubkey: proposal.pubkey,
      title: proposal.title,
      phase: proposal.phase,
      zkMode: proposal.zkMode,
      confidentialPayout: Boolean(proposal.confidentialPayoutPlan),
      dao: proposal.dao,
    })),
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(
    MD_PATH,
    `# Read Node Snapshot

- Generated at: \`${payload.generatedAt}\`
- Read path: \`${payload.readPath}\`
- RPC endpoint: \`${runtime.rpcEndpoint}\`
- RPC pool size: \`${runtime.rpcPoolSize}\`
- Cache entries: \`${payload.cache.entryCount}\`
- Cache TTL ms: \`${payload.cache.ttlMs}\`
- Program ID: \`${runtime.programId}\`
- Slot: \`${runtime.slot}\`
- Solana core: \`${runtime.solanaCore}\`
- Feature set: \`${runtime.featureSet}\`

## Proposal Coverage

- Proposals indexed: \`${counts.proposals}\`
- Unique DAOs: \`${counts.uniqueDaos}\`
- Executed proposals: \`${counts.executed}\`
- Executable proposals: \`${counts.executable}\`
- Timelocked proposals: \`${counts.timelocked}\`
- ZK-enforced proposals: \`${counts.zkEnforced}\`
- Confidential payout proposals: \`${counts.confidentialPayouts}\`
- REFHE-configured proposals: \`${overview.refheConfigured}\`
- REFHE-settled proposals: \`${overview.refheSettled}\`
- REFHE proposals with verifier binding: \`${overview.refheWithVerifier}\`
- Executable confidential proposals: \`${overview.executableConfidential}\`

## Devnet Load Profiles

${profiles.map((profile) => `- \`${profile.name}\` | wallets=\`${profile.walletCount}\` | waves=\`${profile.waveCount}\` | wave-size=\`${profile.waveSize}\` | funding-wave=\`${profile.fundingWaveSize}\` | target-pdao-ui=\`${profile.targetPdaoUi}\` | negative=\`${profile.negativeScenarios.join(", ")}\``).join("\n")}

## Sample

${payload.sample.map((proposal) => `- \`${proposal.title}\` | phase=\`${proposal.phase}\` | zk=\`${proposal.zkMode}\` | payout=\`${proposal.confidentialPayout}\` | dao=\`${proposal.dao}\``).join("\n")}

## Featured Proposal Contexts

- \`payroll\` | phase=\`${featuredProposalContexts.payroll.indexedPhase}\` | proposal=\`${featuredProposalContexts.payroll.proposalAccount}\` | recipient=\`${featuredProposalContexts.payroll.recipientLabel}\` | mint=\`${featuredProposalContexts.payroll.mintAddress ?? featuredProposalContexts.payroll.mintSymbol}\`
- \`gaming\` | phase=\`${featuredProposalContexts.gaming.indexedPhase}\` | proposal=\`${featuredProposalContexts.gaming.proposalAccount}\` | recipient=\`${featuredProposalContexts.gaming.recipientLabel}\` | mint=\`${featuredProposalContexts.gaming.mintAddress ?? featuredProposalContexts.gaming.mintSymbol}\`
- \`grant\` | phase=\`${featuredProposalContexts.grant.indexedPhase}\` | proposal=\`${featuredProposalContexts.grant.proposalAccount}\` | recipient=\`${featuredProposalContexts.grant.recipient}\` | mint=\`${featuredProposalContexts.grant.mintAddress ?? featuredProposalContexts.grant.mintSymbol}\`

## Featured Proposal Registry

${featuredProposalRegistry.map((proposal) => `- \`${proposal.id}\` | \`${proposal.title}\` | status=\`${proposal.status}\` | treasury=\`${proposal.treasury}\``).join("\n")}
`,
  );

  const frontendFile = `// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 X-PACT. AGPL-3.0-or-later.
// Generated by scripts/build-read-node-snapshot.ts. Do not edit manually.

export const READ_NODE_FEATURED_PROPOSAL_CONTEXTS = ${JSON.stringify(featuredProposalContexts, null, 2)} as const;
export const READ_NODE_FEATURED_PROPOSAL_REGISTRY = ${JSON.stringify(featuredProposalRegistry, null, 2)} as const;

export type ReadNodeFeaturedProposalContextKey = keyof typeof READ_NODE_FEATURED_PROPOSAL_CONTEXTS;
`;

  fs.writeFileSync(FRONTEND_TS_PATH, frontendFile);

  console.log(`Wrote read-node snapshot: ${path.relative(process.cwd(), JSON_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
