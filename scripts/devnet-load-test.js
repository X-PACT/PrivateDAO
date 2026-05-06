"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devnet_load_harness_1 = require("./lib/devnet-load-harness");
async function main() {
    const phase = (process.argv[2] || "all").toLowerCase();
    const profileName = process.argv[3] || process.env.PRIVATE_DAO_LOAD_PROFILE || "50";
    const profile = (0, devnet_load_harness_1.resolveLoadProfile)(profileName);
    const connection = (0, devnet_load_harness_1.createConnection)();
    switch (phase) {
        case "wallets":
            await (0, devnet_load_harness_1.runWalletGeneration)(connection, profile.name);
            break;
        case "fund":
            await (0, devnet_load_harness_1.runFundingPhase)(connection, profile.name);
            break;
        case "bootstrap":
            await (0, devnet_load_harness_1.runBootstrapPhase)(connection, profile.name);
            break;
        case "commit":
            await (0, devnet_load_harness_1.runCommitPhase)(connection, profile.name);
            break;
        case "reveal":
            await (0, devnet_load_harness_1.runRevealPhase)(connection, profile.name);
            break;
        case "execute":
            await (0, devnet_load_harness_1.runExecutePhase)(connection, profile.name);
            break;
        case "zk":
            await (0, devnet_load_harness_1.runZkPhase)(connection, profile.name);
            break;
        case "adversarial":
            await (0, devnet_load_harness_1.runAdversarialPhase)(connection, profile.name);
            break;
        case "report":
            await (0, devnet_load_harness_1.runReportPhase)(connection, profile.name);
            break;
        case "all":
            await (0, devnet_load_harness_1.runAllPhases)(connection, profile.name);
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
