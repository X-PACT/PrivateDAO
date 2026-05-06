"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devnet_resilience_harness_1 = require("./lib/devnet-resilience-harness");
async function main() {
    const phase = (process.argv[2] || "all").toLowerCase();
    if (phase !== "all" && phase !== "resilience") {
        throw new Error(`Unsupported devnet resilience phase: ${phase}`);
    }
    await (0, devnet_resilience_harness_1.runResiliencePhase)();
    console.log("[devnet-resilience] complete");
}
main().catch((error) => {
    console.error("[devnet-resilience] failed");
    console.error(error);
    process.exit(1);
});
