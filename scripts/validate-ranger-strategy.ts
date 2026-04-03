import fs from "fs";
import path from "path";

type YieldSource =
  | "basis"
  | "delta_neutral"
  | "funding_rate"
  | "rwa"
  | "market_making"
  | "dex_lp"
  | "junior_tranche"
  | "ponzi_like_ybs"
  | "looping";

type StrategyConfig = {
  name: string;
  trackTargets: string[];
  baseAsset: string;
  targetApyPercent: number;
  tenorMonths: number;
  rollingTenor: boolean;
  yieldSources: YieldSource[];
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

type Finding = {
  severity: "error" | "warning" | "info";
  message: string;
};

function main() {
  const configPath = getConfigPath(process.argv.slice(2));
  const raw = fs.readFileSync(configPath, "utf8");
  const config = JSON.parse(raw) as StrategyConfig;
  const findings = validate(config);

  console.log(`Ranger strategy validation: ${path.basename(configPath)}`);
  console.log("");

  for (const finding of findings) {
    const tag = finding.severity.toUpperCase().padEnd(7);
    console.log(`[${tag}] ${finding.message}`);
  }

  const errorCount = findings.filter((f) => f.severity === "error").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;

  console.log("");
  console.log(`Summary: ${errorCount} error(s), ${warningCount} warning(s)`);

  if (errorCount > 0) {
    process.exitCode = 1;
  }
}

function getConfigPath(args: string[]): string {
  const explicit = args.find((arg) => !arg.startsWith("--"));
  return explicit
    ? path.resolve(explicit)
    : path.resolve("docs/ranger-strategy-config.devnet.json");
}

function validate(config: StrategyConfig): Finding[] {
  const findings: Finding[] = [];

  if (config.baseAsset !== "USDC") {
    findings.push(error("Vault base asset must be USDC for Ranger prize eligibility."));
  } else {
    findings.push(info("Base asset is USDC."));
  }

  if (config.targetApyPercent < 10) {
    findings.push(error("Target APY must be at least 10%."));
  } else {
    findings.push(info(`Target APY is ${config.targetApyPercent}%.`));
  }

  if (config.tenorMonths !== 3 || !config.rollingTenor) {
    findings.push(error("Tenor must be 3 months and rolling."));
  } else {
    findings.push(info("Tenor matches the 3-month rolling requirement."));
  }

  if (config.yieldSources.includes("ponzi_like_ybs")) {
    findings.push(error("Ponzi-like yield-bearing stable exposure is disqualifying."));
  }
  if (config.yieldSources.includes("junior_tranche")) {
    findings.push(error("Junior tranche / insurance pool exposure is disqualifying."));
  }
  if (config.yieldSources.includes("dex_lp")) {
    findings.push(error("DEX LP vault exposure is disqualifying."));
  }
  if (config.yieldSources.includes("looping") && (config.leverageHealthRateFloor ?? 0) < 1.05) {
    findings.push(error("High-leverage looping below a 1.05 health-rate floor is disqualifying."));
  }

  if (!config.onChainVerification.walletAddress && !config.onChainVerification.vaultAddress) {
    findings.push(error("Provide either a wallet address or a vault address for on-chain verification."));
  } else {
    findings.push(info("On-chain verification address is present."));
  }

  if (!config.evidence.pitchVideoProvided) {
    findings.push(error("Pitch video is required for submission."));
  }
  if (!config.evidence.strategyDocumentationProvided) {
    findings.push(error("Strategy documentation is required for submission."));
  }
  if (!config.evidence.codeRepositoryProvided) {
    findings.push(error("Verifiable code repository is required for submission."));
  }

  if (!config.evidence.livePerformanceProvided && !config.evidence.backtestProvided) {
    findings.push(error("Provide either live performance during the hackathon window or backtest evidence."));
  }

  if (!config.riskManagement.emergencyStop) {
    findings.push(warning("Emergency-stop path is missing from the declared risk model."));
  }
  if (config.riskManagement.maxDrawdownPercent > 15) {
    findings.push(warning("Max drawdown threshold looks high for a seeded-strategy review."));
  }
  if (config.riskManagement.maxPositionPercent > 35) {
    findings.push(warning("Max position size concentration looks aggressive."));
  }
  if (config.riskManagement.maxVenueExposurePercent > 60) {
    findings.push(warning("Venue concentration looks high."));
  }

  if (config.trackTargets.includes("drift-side-track") && !config.driftIntegrated) {
    findings.push(error("Drift Side Track target requires explicit Drift integration evidence."));
  }

  if (!config.onChainVerification.buildWindowVerified) {
    findings.push(warning("Build-window verification flag is not yet marked true."));
  }

  findings.push(info("Use this validator to catch eligibility failures before final submission."));
  return findings;
}

function error(message: string): Finding {
  return { severity: "error", message };
}

function warning(message: string): Finding {
  return { severity: "warning", message };
}

function info(message: string): Finding {
  return { severity: "info", message };
}

main();
