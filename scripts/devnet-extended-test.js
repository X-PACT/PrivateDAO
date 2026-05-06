"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devnet_extended_harness_1 = require("./lib/devnet-extended-harness");
async function main() {
    const phase = (process.argv[2] || "all").toLowerCase();
    switch (phase) {
        case "multi":
            await (0, devnet_extended_harness_1.runMultiProposalPhase)();
            break;
        case "race":
            await (0, devnet_extended_harness_1.runRacePhase)();
            break;
        case "all":
            await (0, devnet_extended_harness_1.runExtendedAll)();
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
