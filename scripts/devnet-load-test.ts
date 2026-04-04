import {
  createConnection,
  runAdversarialPhase,
  runAllPhases,
  runBootstrapPhase,
  runCommitPhase,
  runExecutePhase,
  runFundingPhase,
  runReportPhase,
  runRevealPhase,
  runWalletGeneration,
  runZkPhase,
} from "./lib/devnet-load-harness";

async function main() {
  const phase = (process.argv[2] || "all").toLowerCase();
  const connection = createConnection();

  switch (phase) {
    case "wallets":
      await runWalletGeneration(connection);
      break;
    case "fund":
      await runFundingPhase(connection);
      break;
    case "bootstrap":
      await runBootstrapPhase(connection);
      break;
    case "commit":
      await runCommitPhase(connection);
      break;
    case "reveal":
      await runRevealPhase(connection);
      break;
    case "execute":
      await runExecutePhase(connection);
      break;
    case "zk":
      await runZkPhase(connection);
      break;
    case "adversarial":
      await runAdversarialPhase(connection);
      break;
    case "report":
      await runReportPhase(connection);
      break;
    case "all":
      await runAllPhases(connection);
      break;
    default:
      throw new Error(`Unsupported devnet stress phase: ${phase}`);
  }

  console.log(`[devnet-load] ${phase} complete`);
}

main().catch((error) => {
  console.error("[devnet-load] failed");
  console.error(error);
  process.exit(1);
});

