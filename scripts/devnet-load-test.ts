import {
  createConnection,
  resolveLoadProfile,
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
  const profileName = process.argv[3] || process.env.PRIVATE_DAO_LOAD_PROFILE || "50";
  const profile = resolveLoadProfile(profileName);
  const connection = createConnection();

  switch (phase) {
    case "wallets":
      await runWalletGeneration(connection, profile.name);
      break;
    case "fund":
      await runFundingPhase(connection, profile.name);
      break;
    case "bootstrap":
      await runBootstrapPhase(connection, profile.name);
      break;
    case "commit":
      await runCommitPhase(connection, profile.name);
      break;
    case "reveal":
      await runRevealPhase(connection, profile.name);
      break;
    case "execute":
      await runExecutePhase(connection, profile.name);
      break;
    case "zk":
      await runZkPhase(connection, profile.name);
      break;
    case "adversarial":
      await runAdversarialPhase(connection, profile.name);
      break;
    case "report":
      await runReportPhase(connection, profile.name);
      break;
    case "all":
      await runAllPhases(connection, profile.name);
      break;
    default:
      throw new Error(`Unsupported devnet stress phase: ${phase}`);
  }

  console.log(`[devnet-load] ${phase} complete for profile ${profile.name}`);
}

main().catch((error) => {
  console.error("[devnet-load] failed");
  console.error(error);
  process.exit(1);
});
