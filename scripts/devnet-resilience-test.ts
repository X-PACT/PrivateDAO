import { runResiliencePhase } from "./lib/devnet-resilience-harness";

async function main() {
  const phase = (process.argv[2] || "all").toLowerCase();
  if (phase !== "all" && phase !== "resilience") {
    throw new Error(`Unsupported devnet resilience phase: ${phase}`);
  }

  await runResiliencePhase();
  console.log("[devnet-resilience] complete");
}

main().catch((error) => {
  console.error("[devnet-resilience] failed");
  console.error(error);
  process.exit(1);
});
