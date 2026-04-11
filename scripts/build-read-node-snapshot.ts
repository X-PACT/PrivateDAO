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

  const payload = {
    generatedAt: new Date().toISOString(),
    readPath: "backend-indexer",
    runtime,
    cache: readNode.cacheStats(),
    counts,
    overview,
    profiles,
    featuredProposalContexts,
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
`,
  );

  const frontendFile = `// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 X-PACT. AGPL-3.0-or-later.
// Generated by scripts/build-read-node-snapshot.ts. Do not edit manually.

export const READ_NODE_FEATURED_PROPOSAL_CONTEXTS = ${JSON.stringify(featuredProposalContexts, null, 2)} as const;

export type ReadNodeFeaturedProposalContextKey = keyof typeof READ_NODE_FEATURED_PROPOSAL_CONTEXTS;
`;

  fs.writeFileSync(FRONTEND_TS_PATH, frontendFile);

  console.log(`Wrote read-node snapshot: ${path.relative(process.cwd(), JSON_PATH)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
