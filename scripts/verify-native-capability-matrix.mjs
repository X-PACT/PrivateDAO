import { readFile } from "node:fs/promises";
import { buildNativeCapabilityRegistry } from "../packages/privatedao-runtime/src/index.ts";

const generatedPath = "docs/generated/native-capability-matrix-20260911.json";
const generated = JSON.parse(await readFile(generatedPath, "utf8"));
const expectedEntries = buildNativeCapabilityRegistry();

if (generated.schema !== "privatedao.native-capability-matrix.v1") {
  throw new Error(`unexpected capability matrix schema: ${generated.schema}`);
}
if (generated.bridgeFree !== true) throw new Error("capability matrix must remain bridge-free");
if (!generated.generatedAt || Number.isNaN(Date.parse(generated.generatedAt))) {
  throw new Error("capability matrix generatedAt is invalid");
}
if (JSON.stringify(generated.entries) !== JSON.stringify(expectedEntries)) {
  throw new Error("generated native capability matrix is out of sync with the runtime registry");
}

console.log(JSON.stringify({
  path: generatedPath,
  entries: generated.entries.length,
  testnetVerified: generated.entries.filter((entry) => entry.status === "testnet_verified").length,
  devnetVerified: generated.entries.filter((entry) => entry.status === "devnet_verified").length,
  mainnetLive: generated.entries.filter((entry) => entry.status === "mainnet_live").length,
  bridgeFree: generated.bridgeFree,
  synchronized: true,
}, null, 2));
