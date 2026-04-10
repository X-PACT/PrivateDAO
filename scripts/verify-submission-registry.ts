import fs from "fs";
import path from "path";

type SubmissionRegistry = {
  project: string;
  programId: string;
  verificationWallet: string;
  frontend: string;
  proofCenter: string;
  judgeMode: string;
  securityPage: string;
  youtubePitch: string;
  androidGuide: string;
  awardNote: string;
  packages: Record<string, string[]>;
  gates: string[];
  status: Record<string, string>;
};

function main() {
  const registryPath = path.resolve("docs/submission-registry.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as SubmissionRegistry;

  if (registry.project !== "PrivateDAO") {
    throw new Error("submission registry project name mismatch");
  }

  if (!registry.frontend.startsWith("https://x-pact.github.io/PrivateDAO/")) {
    throw new Error("submission registry frontend URL is unexpected");
  }

  if (!registry.judgeMode.includes("/proof/?judge=1")) {
    throw new Error("submission registry judge mode URL is unexpected");
  }

  if (registry.programId !== "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx") {
    throw new Error("submission registry program id mismatch");
  }

  if (registry.verificationWallet !== "4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD") {
    throw new Error("submission registry verification wallet mismatch");
  }

  const requiredPackages = ["strategy", "security", "zk", "proof", "operations"];
  for (const pkg of requiredPackages) {
    const entries = registry.packages[pkg];
    if (!entries || entries.length === 0) {
      throw new Error(`submission registry missing package entries for ${pkg}`);
    }
    for (const entry of entries) {
      if (!fs.existsSync(path.resolve(entry))) {
        throw new Error(`submission registry references missing file: ${entry}`);
      }
    }
  }

  const requiredGates = [
    "npm run validate:ranger-strategy -- docs/ranger-strategy-config.devnet.json",
    "npm run verify:strategy-surface",
    "npm run verify:live-proof",
    "npm run verify:test-wallet-live-proof:v3",
    "npm run verify:release-manifest",
    "npm run verify:program-id-consistency",
    "npm run verify:pdao-surface",
    "npm run verify:pdao-attestation",
    "npm run verify:pdao-live",
    "npm run test:devnet:wallets",
    "npm run test:devnet:fund",
    "npm run test:devnet:bootstrap",
    "npm run test:devnet:commit",
    "npm run test:devnet:reveal",
    "npm run test:devnet:execute",
    "npm run test:devnet:zk",
    "npm run test:devnet:adversarial",
    "npm run test:devnet:report",
    "npm run test:devnet:multi",
    "npm run test:devnet:race",
    "npm run test:devnet:extended",
    "npm run test:devnet:resilience",
    "npm run test:devnet:all",
    "npm run verify:review-links",
    "npm run verify:ops-surface",
    "npm run verify:submission-registry",
    "npm run verify:registry-consistency",
    "npm run verify:generated-artifacts",
    "npm run verify:supply-chain-attestation",
    "npm run verify:release-ceremony-attestation",
    "npm run verify:operational-evidence",
    "npm run verify:real-device-runtime",
    "npm run verify:runtime-evidence",
    "npm run verify:release-drill",
    "npm run verify:artifact-freshness",
    "npm run verify:wallet-matrix",
    "npm run verify:devnet-canary",
    "npm run verify:devnet:resilience-report",
    "npm run ops:canary",
    "npm run verify:cryptographic-manifest",
    "npm run verify:mainnet-readiness-report",
    "npm run verify:deployment-attestation",
    "npm run verify:runtime-attestation",
    "npm run verify:runtime-surface",
    "npm run verify:go-live-attestation",
    "npm run verify:zk-surface",
    "npm run verify:zk-registry",
    "npm run verify:zk-docs",
    "npm run verify:zk-consistency",
    "npm run verify:zk-negative",
    "npm run verify:review-surface",
    "npm run verify:all",
  ];

  for (const gate of requiredGates) {
    if (!registry.gates.includes(gate)) {
      throw new Error(`submission registry missing gate: ${gate}`);
    }
  }

  console.log("Submission registry verification: PASS");
}

main();
