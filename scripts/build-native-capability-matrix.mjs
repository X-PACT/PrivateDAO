import { writeFile } from "node:fs/promises";
import { buildNativeCapabilityRegistry } from "../packages/privatedao-runtime/src/index.ts";

const outputPath = "docs/generated/native-capability-matrix-20260911.json";
const entries = buildNativeCapabilityRegistry();
const payload = {
  schema: "privatedao.native-capability-matrix.v1",
  generatedAt: new Date().toISOString(),
  bridgeFree: true,
  entries,
};

await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(JSON.stringify({
  outputPath,
  entries: entries.length,
  testnetVerified: entries.filter((entry) => entry.status === "testnet_verified").length,
  devnetVerified: entries.filter((entry) => entry.status === "devnet_verified").length,
  mainnetLive: entries.filter((entry) => entry.status === "mainnet_live").length,
  bridgeFree: payload.bridgeFree,
}, null, 2));
