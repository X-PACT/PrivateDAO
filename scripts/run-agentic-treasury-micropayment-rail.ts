import { parseArgs } from "./utils";
import { runAgenticMicropaymentRail } from "./lib/micropayment-engine";

async function main() {
  const args = parseArgs();
  const report = await runAgenticMicropaymentRail({
    transferTarget:
      typeof args.transferTarget === "number"
        ? args.transferTarget
        : typeof args.count === "number"
          ? args.count
          : 50,
    targetCount:
      typeof args.targetCount === "number"
        ? args.targetCount
        : 10,
    stableMint: typeof args.mint === "string" ? args.mint : undefined,
    stableSymbol: typeof args.symbol === "string" ? args.symbol : undefined,
    walletPath: typeof args.wallet === "string" ? args.wallet : undefined,
  });

  console.log(JSON.stringify({
    generatedAt: report.generatedAt,
    network: report.network,
    assetMode: report.assetMode,
    settlementAssetSymbol: report.settlementAssetSymbol,
    transferCount: report.transferCount,
    successfulTransferCount: report.successfulTransferCount,
    batchCount: report.batchCount,
    targetCount: report.targetCount,
    executionWallet: report.executionWallet,
    totalAmountDisplay: report.totalAmountDisplay,
    reportPath: report.reportPath,
    firstSignature: report.transfers[0]?.signature ?? null,
    lastSignature: report.transfers.at(-1)?.signature ?? null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
