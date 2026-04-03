import fs from "fs";
import path from "path";

const FRONTEND = path.resolve("docs/index.html");

function main() {
  const body = fs.readFileSync(FRONTEND, "utf8");

  const requiredFragments = [
    "Zero-Knowledge Layer Live",
    "Real Groth16 overlay live",
    "Connect a Solana wallet such as Phantom, Solflare, or Backpack on Devnet.",
    "window.backpack?.solana",
    "window.solflare?.solflare",
    "walletProviderName",
    "custom-cursor-enabled",
    "requestAnimationFrame(renderCursor)",
    "verify:all",
    "zk-layer.md",
    "Artifact Integrity",
    "cryptographic-integrity.md",
    "cryptographic-manifest.generated.json",
    "verify:cryptographic-manifest",
    "SUPPORTED DEVNET WALLETS",
    "Phantom",
    "Solflare",
    "Backpack",
    "Glow",
    "toggleWalletPanel",
    "Security Evidence",
  ];

  for (const fragment of requiredFragments) {
    assertContains(body, fragment, `frontend surface is missing required fragment: ${fragment}`);
  }

  assertNotContains(body, "setInterval(() => {\n  rx +=", "frontend still uses the old interval-based cursor loop");
  assertNotContains(body, "Tracks, sponsors,<br>and ecosystem fit.", "low-signal hackathon context section still exists on the main surface");
  assertNotContains(body, "Install Phantom or Solflare to sign transactions.", "frontend still shows the outdated wallet-install guidance");

  console.log("Frontend surface verification: PASS");
}

function assertContains(body: string, fragment: string, message: string) {
  if (!body.includes(fragment)) {
    throw new Error(message);
  }
}

function assertNotContains(body: string, fragment: string, message: string) {
  if (body.includes(fragment)) {
    throw new Error(message);
  }
}

main();
