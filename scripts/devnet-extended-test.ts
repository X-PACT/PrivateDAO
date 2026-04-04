import {
  runExtendedAll,
  runMultiProposalPhase,
  runRacePhase,
} from "./lib/devnet-extended-harness";

async function main() {
  const phase = (process.argv[2] || "all").toLowerCase();

  switch (phase) {
    case "multi":
      await runMultiProposalPhase();
      break;
    case "race":
      await runRacePhase();
      break;
    case "all":
      await runExtendedAll();
      break;
    default:
      throw new Error(`Unsupported extended devnet phase: ${phase}`);
  }

  console.log(`[devnet-extended] ${phase} complete`);
}

main().catch((error) => {
  console.error("[devnet-extended] failed");
  console.error(error);
  process.exit(1);
});
