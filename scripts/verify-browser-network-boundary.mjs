import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const sourceRoots = ["apps/web/src/app", "apps/web/src/components", "apps/web/src/lib"];
const allowedFiles = new Set([
  "apps/web/src/lib/network-adapters/solana-browser.ts",
  "apps/web/src/lib/network-adapters/magicblock-browser.ts",
]);
const forbiddenPatterns = [
  /\b(?:sendTransaction|confirmTransaction|getLatestBlockhash|getBalance|getAccountInfo|getSignatureStatuses|getParsedTransaction)\s*\(/g,
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path)));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

const violations = [];
for (const root of sourceRoots) {
  for (const path of await collectFiles(root)) {
    const displayPath = relative(process.cwd(), path);
    if (allowedFiles.has(displayPath)) continue;
    const source = await readFile(path, "utf8");
    for (const pattern of forbiddenPatterns) {
      for (const match of source.matchAll(pattern)) {
        const line = source.slice(0, match.index).split("\n").length;
        violations.push(`${displayPath}:${line}: direct Solana provider call ${match[0].trim()}`);
      }
    }
  }
}

if (violations.length) {
  console.error("[browser-network-boundary] FAIL");
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("[browser-network-boundary] PASS direct provider calls are confined to network adapters");
