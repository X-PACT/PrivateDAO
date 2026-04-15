import fs from "fs";
import path from "path";

type RealDeviceEvidence = {
  status: string;
  summary: {
    targetCount: number;
    completedTargetCount: number;
    pendingTargets: string[];
  };
};

type MonitoringEvidence = {
  status: string;
  summary: {
    ownerCount: number;
    ownerAssignedCount: number;
    deliveryRequirementCount: number;
    closedRequirementCount: number;
    transcriptRequirementCount: number;
  };
};

type SettlementEvidence = {
  status: string;
  summary: {
    requirementCount: number;
    closedRequirementCount: number;
    supportingArtifactCount: number;
  };
};

function main() {
  const realDevice = readJson<RealDeviceEvidence>("docs/runtime/real-device.generated.json");
  const monitoring = readJson<MonitoringEvidence>("docs/monitoring-delivery.generated.json");
  const settlement = readJson<SettlementEvidence>("docs/settlement-receipt-closure.generated.json");

  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    summary: {
      realDeviceStatus: realDevice.status,
      monitoringStatus: monitoring.status,
      settlementStatus: settlement.status,
      realDeviceCompletion: `${realDevice.summary.completedTargetCount}/${realDevice.summary.targetCount}`,
      monitoringCompletion: `${monitoring.summary.closedRequirementCount}/${monitoring.summary.deliveryRequirementCount}`,
      settlementCompletion: `${settlement.summary.closedRequirementCount}/${settlement.summary.requirementCount}`,
    },
    routes: [
      "/security#real-device-capture-readiness",
      "/security#monitoring-delivery-readiness",
      "/services#settlement-receipt-readiness",
      "/tracks/startup-accelerator",
      "/tracks/poland-grants",
    ],
    documents: [
      "docs/real-device-capture-closure-packet.md",
      "docs/monitoring-delivery-closure-packet.md",
      "docs/settlement-receipt-closure-packet.md",
      "docs/monitoring-delivery.generated.md",
      "docs/settlement-receipt-closure.generated.md",
      "docs/runtime/real-device.generated.md",
    ],
    commands: [
      "npm run build:execution-unlock-bundle",
      "npm run verify:execution-unlock-bundle",
      "npm run build:real-device-runtime",
      "npm run build:monitoring-delivery",
      "npm run build:settlement-receipt-closure",
    ],
  };

  fs.writeFileSync(path.resolve("docs/execution-unlock-bundle.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/execution-unlock-bundle.generated.md"), buildMarkdown(payload));
  console.log("Wrote execution unlock bundle");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  summary: {
    realDeviceStatus: string;
    monitoringStatus: string;
    settlementStatus: string;
    realDeviceCompletion: string;
    monitoringCompletion: string;
    settlementCompletion: string;
  };
  routes: string[];
  documents: string[];
  commands: string[];
}) {
  return `# Execution Unlock Bundle

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- real-device status: \`${payload.summary.realDeviceStatus}\`
- real-device completion: \`${payload.summary.realDeviceCompletion}\`
- monitoring status: \`${payload.summary.monitoringStatus}\`
- monitoring completion: \`${payload.summary.monitoringCompletion}\`
- settlement receipt status: \`${payload.summary.settlementStatus}\`
- settlement receipt completion: \`${payload.summary.settlementCompletion}\`

## Why This Bundle Exists

This bundle compresses the three highest-value remaining operational closures into one reviewer-safe packet:

1. real-device wallet closure
2. monitoring delivery closure
3. settlement receipt closure

## Best Routes

${payload.routes.map((item) => `- \`${item}\``).join("\n")}

## Included Documents

${payload.documents.map((item) => `- \`${item}\``).join("\n")}

## Commands

${payload.commands.map((item) => `- \`${item}\``).join("\n")}
`;
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
