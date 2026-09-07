"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const [configArg, outArg] = process.argv.slice(2);
    const configPath = path_1.default.resolve(configArg || "docs/ranger-strategy-config.devnet.json");
    const outPath = path_1.default.resolve(outArg || "docs/ranger-submission-bundle.generated.md");
    const config = JSON.parse(fs_1.default.readFileSync(configPath, "utf8"));
    const markdown = render(config, path_1.default.basename(configPath));
    fs_1.default.writeFileSync(outPath, markdown);
    console.log(`Wrote Ranger submission bundle: ${path_1.default.relative(process.cwd(), outPath)}`);
}
function render(config, configName) {
    const verificationAddress = config.onChainVerification.vaultAddress || config.onChainVerification.walletAddress;
    if (!verificationAddress) {
        throw new Error("Ranger submission bundle requires a real walletAddress or vaultAddress for on-chain verification.");
    }
    return `# Ranger Submission Bundle

## Strategy Identity

- Name: ${config.name}
- Tracks: ${config.trackTargets.join(", ")}
- Base asset: ${config.baseAsset}
- Target APY: ${config.targetApyPercent}%
- Tenor: ${config.tenorMonths} months${config.rollingTenor ? " rolling" : ""}
- Yield sources: ${config.yieldSources.join(", ")}

## Governance-Control Plane

PrivateDAO provides the governance and risk-control layer for this strategy:

- private committee approvals
- commit-reveal voting
- timelocked execution
- veto and cancellation paths
- explorer-verifiable governance proof

## Risk Controls

- Max drawdown: ${config.riskManagement.maxDrawdownPercent}%
- Max position size: ${config.riskManagement.maxPositionPercent}%
- Max venue exposure: ${config.riskManagement.maxVenueExposurePercent}%
- Rebalance cadence: ${config.riskManagement.rebalanceCadence}
- Emergency stop: ${config.riskManagement.emergencyStop ? "enabled" : "not declared"}
${config.leverageHealthRateFloor ? `- Health-rate floor: ${config.leverageHealthRateFloor}` : ""}

## Evidence Surface

- Pitch video: ${config.evidence.pitchVideoProvided ? "provided" : "missing"}
- Strategy documentation: ${config.evidence.strategyDocumentationProvided ? "provided" : "missing"}
- Code repository: ${config.evidence.codeRepositoryProvided ? "provided" : "missing"}
- Live performance: ${config.evidence.livePerformanceProvided ? "provided" : "not provided"}
- Backtest evidence: ${config.evidence.backtestProvided ? "provided" : "not provided"}

## On-chain Verification

- Verification address: ${verificationAddress}
- Build-window verified: ${config.onChainVerification.buildWindowVerified ? "yes" : "no"}
- Live governance proof: docs/live-proof.md
- Additive V3 governance + settlement proof: docs/test-wallet-live-proof-v3.generated.md
- V3 hardening docs: docs/governance-hardening-v3.md, docs/settlement-hardening-v3.md
- Program: https://solscan.io/account/5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx?cluster=devnet
- Live app: https://privatedao.org/

## Supporting Docs

- Config source: ${configName}
- Ranger strategy documentation: docs/ranger-strategy-documentation.md
- Ranger checklist: docs/ranger-submission-checklist.md
- Judge audit note: docs/judge-technical-audit.md
- Main Track memo: docs/ranger-main-track.md
- Drift Track memo: docs/ranger-drift-track.md

## Notes

This generated bundle is meant to reduce inconsistency between strategy claims, risk framing, and proof links. It should be regenerated whenever the strategy config changes.
`;
}
main();
