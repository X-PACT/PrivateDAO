import fs from "fs";
import path from "path";

const EXPECTED_PROGRAM_ID = "EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva";

type Report = {
  project: string;
  cluster: string;
  expectedProgramId: string;
  posture: string;
  endpointChecks: Array<{
    label: string;
    provider: string;
    path: string;
    status: "pass" | "warn" | "fail";
    httpStatus: number;
  }>;
};

function main() {
  const jsonPath = path.resolve("docs/backend-provider-readiness-2026-05-24.json");
  const mdPath = path.resolve("docs/backend-provider-readiness-2026-05-24.md");
  assert(fs.existsSync(jsonPath), "missing backend provider readiness JSON");
  assert(fs.existsSync(mdPath), "missing backend provider readiness markdown");

  const report = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Report;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(report.project === "PrivateDAO", "backend readiness project mismatch");
  assert(report.cluster === "solana-testnet", "backend readiness cluster mismatch");
  assert(report.expectedProgramId === EXPECTED_PROGRAM_ID, "backend readiness program mismatch");
  assert(report.posture === "backend-production-candidate", "backend readiness posture mismatch");
  assert(report.endpointChecks.length >= 8, "backend readiness is missing provider checks");
  assert(!report.endpointChecks.some((entry) => entry.status === "fail"), "backend readiness contains failed checks");

  for (const required of [
    "AWS same-domain read node",
    "QuickNode Testnet RPC",
    "QuickNode stream intake",
    "MagicBlock receipt proof",
    "Ika Solana pre-alpha readiness",
    "REFHE payroll proof route",
    "Supabase visitor counters",
    "QVAC sovereign AI proof",
    "Umbra relayer health",
  ]) {
    assert(report.endpointChecks.some((entry) => entry.label === required), `backend readiness missing ${required}`);
  }

  assert(markdown.includes(EXPECTED_PROGRAM_ID), "backend readiness markdown missing current Testnet program");
  assert(markdown.includes("/api-status"), "backend readiness markdown missing API status route");
  assert(markdown.includes("/rpc-services"), "backend readiness markdown missing RPC services route");
  console.log("Backend provider readiness verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main();
