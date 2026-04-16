import fs from "node:fs";
import path from "node:path";

type FrontierIntegrationsJson = {
  generatedAt: string;
  reviewerEntry: string;
  simpleGovernance: {
    proposal: string;
    verificationStatus: string;
    txChecks: Array<{
      label: string;
      signature: string;
      status: string;
      slot: number;
      confirmed: boolean;
    }>;
  };
  confidentialOperations: {
    proposal: string;
    verificationStatus: string;
    txChecks: Array<{
      label: string;
      signature: string;
      status: string;
      slot: number;
      confirmed: boolean;
    }>;
  };
};

type RuntimeEvidenceJson = {
  generatedAt: string;
  walletCount: number;
  realDevice: {
    status: string;
    completedTargetCount: number;
    targetCount: number;
  };
  operational: {
    totalTxCount: number;
    totalAttemptCount: number;
    adversarialScenarioCount: number;
    unexpectedAdversarialSuccesses: number;
  };
};

type TestWalletProofV3Json = {
  generatedAt: string;
  mode: string;
  governanceV3: {
    proposal: string;
    transactions: Record<string, string>;
    invariants: {
      status: string;
      isExecuted: boolean;
    };
  };
  settlementV3: {
    proposal: string;
    transactions: Record<string, string>;
    invariants: {
      status: string;
      evidenceConsumed: boolean;
    };
  };
};

type AgenticMicropaymentRailJson = {
  generatedAt: string;
  assetMode: "SOL" | "SPL";
  settlementAssetSymbol: string;
  transferCount: number;
  successfulTransferCount: number;
  targetCount: number;
  totalAmountDisplay: string;
  executionWallet: string;
  reportPath: string;
  transfers: Array<{
    batchIndex: number;
    action: string;
    recipient: string;
    amountDisplay: string;
    signature: string;
    explorerUrl: string;
    status: string;
    slot?: number;
  }>;
};

export type JudgeLogEntry = {
  label: string;
  signature: string;
  status: string;
  slot?: number;
};

export type JudgeRuntimeLogsSnapshot = {
  freshness: string;
  reviewerEntry: string;
  governance: {
    proposal: string;
    verificationStatus: string;
    entries: JudgeLogEntry[];
  };
  confidential: {
    proposal: string;
    verificationStatus: string;
    entries: JudgeLogEntry[];
  };
  v3Hardening: {
    mode: string;
    governanceProposal: string;
    governanceExecuted: boolean;
    settlementProposal: string;
    settlementEvidenceConsumed: boolean;
    governanceEntries: JudgeLogEntry[];
    settlementEntries: JudgeLogEntry[];
  };
  runtime: {
    walletCoverage: string;
    txSuccessRate: string;
    adversarialSummary: string;
  };
  agenticMicropayments: {
    available: boolean;
    freshness?: string;
    assetMode?: "SOL" | "SPL";
    settlementAssetSymbol?: string;
    transferCount?: number;
    successfulTransferCount?: number;
    targetCount?: number;
    totalAmountDisplay?: string;
    executionWallet?: string;
    reportPath?: string;
    entries: JudgeLogEntry[];
  };
};

function readJson<T>(relativePath: string): T {
  const filePath = path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "..",
    "..",
    relativePath,
  );
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function readOptionalJson<T>(relativePath: string): T | null {
  try {
    return readJson<T>(relativePath);
  } catch {
    return null;
  }
}

function formatFreshness(...isoTimestamps: string[]) {
  const latest = isoTimestamps
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0];
  if (!latest) return "freshness unknown";
  const ageHours = Math.max(0, Math.round((Date.now() - latest) / (1000 * 60 * 60)));
  if (ageHours < 1) return "updated this hour";
  if (ageHours < 24) return `${ageHours}h old`;
  return `${Math.round(ageHours / 24)}d old`;
}

function pickEntries(
  entries: Array<{ label: string; signature: string; status: string; slot?: number; confirmed?: boolean }>,
  preferredOrder: string[],
) {
  const byLabel = new Map(entries.map((entry) => [entry.label, entry]));
  return preferredOrder
    .map((label) => byLabel.get(label))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .map((entry) => ({
      label: entry.label,
      signature: entry.signature,
      status: entry.confirmed === false ? `unconfirmed · ${entry.status}` : entry.status,
      slot: entry.slot,
    }));
}

export function getJudgeRuntimeLogsSnapshot(): JudgeRuntimeLogsSnapshot {
  const frontier = readJson<FrontierIntegrationsJson>("docs/frontier-integrations.generated.json");
  const runtime = readJson<RuntimeEvidenceJson>("docs/runtime-evidence.generated.json");
  const v3 = readJson<TestWalletProofV3Json>("docs/test-wallet-live-proof-v3.generated.json");
  const micropayments = readOptionalJson<AgenticMicropaymentRailJson>("docs/agentic-treasury-micropayment-rail.generated.json");

  return {
    freshness: formatFreshness(frontier.generatedAt, runtime.generatedAt, v3.generatedAt),
    reviewerEntry: frontier.reviewerEntry,
    governance: {
      proposal: frontier.simpleGovernance.proposal,
      verificationStatus: frontier.simpleGovernance.verificationStatus,
      entries: pickEntries(frontier.simpleGovernance.txChecks, [
        "create-dao",
        "deposit",
        "create-proposal",
        "commit",
        "reveal",
        "finalize",
        "execute",
      ]),
    },
    confidential: {
      proposal: frontier.confidentialOperations.proposal,
      verificationStatus: frontier.confidentialOperations.verificationStatus,
      entries: pickEntries(frontier.confidentialOperations.txChecks, [
        "magicblock-deposit",
        "magicblock-private-transfer",
        "magicblock-withdraw",
        "magicblock-settle",
        "magicblock-execute",
      ]),
    },
    v3Hardening: {
      mode: v3.mode,
      governanceProposal: v3.governanceV3.proposal,
      governanceExecuted: v3.governanceV3.invariants.isExecuted,
      settlementProposal: v3.settlementV3.proposal,
      settlementEvidenceConsumed: v3.settlementV3.invariants.evidenceConsumed,
      governanceEntries: Object.entries(v3.governanceV3.transactions).map(([label, signature]) => ({
        label,
        signature,
        status: "captured-devnet-proof",
      })),
      settlementEntries: Object.entries(v3.settlementV3.transactions).map(([label, signature]) => ({
        label,
        signature,
        status: "captured-devnet-proof",
      })),
    },
    runtime: {
      walletCoverage: `${runtime.realDevice.completedTargetCount}/${runtime.realDevice.targetCount} real-device targets completed`,
      txSuccessRate: `${runtime.operational.totalTxCount}/${runtime.operational.totalAttemptCount} tx outcomes captured`,
      adversarialSummary: `${runtime.operational.adversarialScenarioCount} adversarial scenarios · ${runtime.operational.unexpectedAdversarialSuccesses} unexpected successes`,
    },
    agenticMicropayments: micropayments
      ? {
          available: true,
          freshness: formatFreshness(micropayments.generatedAt),
          assetMode: micropayments.assetMode,
          settlementAssetSymbol: micropayments.settlementAssetSymbol,
          transferCount: micropayments.transferCount,
          successfulTransferCount: micropayments.successfulTransferCount,
          targetCount: micropayments.targetCount,
          totalAmountDisplay: micropayments.totalAmountDisplay,
          executionWallet: micropayments.executionWallet,
          reportPath: micropayments.reportPath,
          entries: micropayments.transfers
            .filter((entry) => entry.action !== "recipient-activation")
            .slice(0, 8)
            .map((entry) => ({
            label: `${entry.action} #${entry.batchIndex + 1}`,
            signature: entry.signature,
            status: `${entry.amountDisplay} · ${entry.status}`,
            slot: entry.slot,
            })),
        }
      : {
          available: false,
          entries: [],
        },
  };
}
