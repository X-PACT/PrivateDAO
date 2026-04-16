import fs from "fs";
import path from "path";

type StrategyConfig = {
  name: string;
  trackTargets: string[];
  baseAsset: string;
  targetApyPercent: number;
  tenorMonths: number;
  rollingTenor: boolean;
  yieldSources: string[];
  leverageHealthRateFloor?: number;
  driftIntegrated: boolean;
  onChainVerification: {
    walletAddress?: string;
    vaultAddress?: string;
    buildWindowVerified: boolean;
  };
  riskManagement: {
    maxDrawdownPercent: number;
    maxPositionPercent: number;
    maxVenueExposurePercent: number;
    rebalanceCadence: string;
    emergencyStop: boolean;
  };
  evidence: {
    livePerformanceProvided: boolean;
    backtestProvided: boolean;
    strategyDocumentationProvided: boolean;
    pitchVideoProvided: boolean;
    codeRepositoryProvided: boolean;
  };
};

function main() {
  const [configArg, outArg] = process.argv.slice(2);
  const configPath = path.resolve(configArg || "docs/ranger-strategy-config.devnet.json");
  const outPath = path.resolve(outArg || "docs/ranger-submission-bundle.generated.md");

  const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as StrategyConfig;
  const markdown = render(config, path.basename(configPath));
  fs.writeFileSync(outPath, markdown);

  console.log(`Wrote Ranger submission bundle: ${path.relative(process.cwd(), outPath)}`);
}

function render(config: StrategyConfig, configName: string): string {
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
