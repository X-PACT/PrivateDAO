import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const commercialSources = [
  "apps/web/src/app/page.tsx",
  "apps/web/src/components/commercial-hero-copy.tsx",
  "apps/web/src/lib/site-brand.ts",
  "apps/web/src/lib/commercial-product-map.ts",
];

const requiredClaims = [
  ["Web3-native entry path", "Already in Web3?"],
  ["Web2 entry path", "Not in Web3 yet?"],
  ["Web3 capability positioning", "Web3 capability"],
  ["privacy principle", "Your private work should stay private."],
  ["proof principle", "Proof without exposure"],
];

const forbiddenClaims = [
  /guaranteed\s+(?:financial\s+)?returns?/i,
  /guaranteed\s+yield/i,
  /audited\s+by/i,
  /certified\s+by/i,
  /trusted\s+by\s+(?:leading|the\s+world)/i,
  /solana[- ]only/i,
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sources = Object.fromEntries(
  await Promise.all(commercialSources.map(async (relative) => [relative, await readFile(resolve(root, relative), "utf8")])),
);
const allCommercialCopy = Object.values(sources).join("\n");

for (const [label, phrase] of requiredClaims) {
  assert(allCommercialCopy.includes(phrase), `Missing commercial claim: ${label}`);
}

for (const [relative, content] of Object.entries(sources)) {
  for (const pattern of forbiddenClaims) {
    assert(!pattern.test(content), `Unverified commercial claim ${pattern} found in ${relative}`);
  }
}

console.log(`Commercial claim audit: PASS (${commercialSources.length} source surfaces checked)`);
