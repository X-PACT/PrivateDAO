import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = path.join(repoRoot, "apps", "web", "out");
const nextRoot = path.join(repoRoot, "apps", "web", ".next");
const defaultRoot = fs.existsSync(outRoot) ? outRoot : nextRoot;
const root = path.resolve(process.env.PRIVATE_DAO_NEXT_DIST_DIR || defaultRoot);
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

// Static export does not execute Next middleware. Keep legacy entrypoints
// compatible by turning them into lightweight redirects after export.
const redirects = {
  "/deck": "/investors",
  "/reviewer": "/investors",
  "/judge": "/whitepaper",
  "/judges": "/whitepaper",
  "/judge-ai": "/whitepaper",
  "/review": "/whitepaper",
  "/awards": "/thesis",
  "/colosseum": "/thesis",
  "/frontier": "/products",
  "/submission": "/products",
  "/tracks": "/products",
  "/demo": "/payroll",
  "/dao-ui-template": "/govern",
  "/governance-template": "/govern",
  "/payment-template": "/treasury",
  "/runtime-template": "/whitepaper",
  "/wallet-template": "/contact",
  "/whiteprint": "/whitepaper",
  "/rpc-services": "/whitepaper",
  "/api-status": "/whitepaper",
  "/diagnostics": "/whitepaper",
  "/command-center": "/treasury",
  "/network": "/whitepaper",
  "/android": "/products",
  "/benefit": "/products",
  "/versus": "/products",
  "/revenue": "/thesis",
  "/services": "/products",
  "/engage": "/contact",
  "/analytics": "/govern",
  "/custody": "/treasury",
  "/live": "/govern",
  "/execute": "/treasury",
  "/txline-settlement": "/treasury",
  "/services/umbra-private-payments": "/treasury",
  "/services/umbra-confidential-payout": "/treasury",
  "/services/devnet-billing-rehearsal": "/contact",
  "/business-model": "/thesis",
  "/community": "/contact",
  "/compliance": "/whitepaper",
  "/enterprise": "/contact",
  "/futardio": "/products",
  "/inteligence": "/govern",
  "/intelignce": "/govern",
  "/intelligence": "/govern",
  "/inttelignce": "/govern",
  "/matrix": "/products",
  "/onboard": "/contact",
  "/payment-gate": "/contact",
  "/pilots": "/contact",
  "/pricing": "/contact",
  "/start": "/products",
  "/story": "/thesis",
  "/submission": "/products",
  "/trust": "/whitepaper",
  "/try": "/payroll",
  "/value": "/thesis",
};

function redirectHtml(destination) {
  const target = `${basePath}${destination}/`;
  const escaped = target.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"><title>PrivateDAO</title></head><body><p>PrivateDAO is taking you to the current commercial page.</p><script>location.replace('${escaped}'+location.search+location.hash)</script></body></html>`;
}

let compacted = 0;
for (const [source, destination] of Object.entries(redirects)) {
  const file = path.join(root, source.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) continue;
  fs.writeFileSync(file, redirectHtml(destination));
  compacted += 1;
}

console.log(`commercial export surface: compacted ${compacted} legacy entrypoints`);
