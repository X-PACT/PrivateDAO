"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const realDevice = readJson("docs/runtime/real-device.generated.json");
    const monitoring = readJson("docs/monitoring-delivery.generated.json");
    const settlement = readJson("docs/settlement-receipt-closure.generated.json");
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
    fs_1.default.writeFileSync(path_1.default.resolve("docs/execution-unlock-bundle.generated.json"), JSON.stringify(payload, null, 2) + "\n");
    fs_1.default.writeFileSync(path_1.default.resolve("docs/execution-unlock-bundle.generated.md"), buildMarkdown(payload));
    console.log("Wrote execution unlock bundle");
}
function buildMarkdown(payload) {
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
function readJson(relativePath) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(relativePath), "utf8"));
}
main();
