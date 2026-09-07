import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

const port = 8896;
const dataDir = await mkdtemp(`${tmpdir()}/privatedao-rbac-`);
const child = spawn("node", ["services/private-engine/src/server.mjs"], { cwd: process.cwd(), env: { ...process.env, PORT: String(port), PRIVADAO_DATA_DIR: dataDir, PRIVADAO_ALLOW_DEV_LICENSE: "true", PRIVADAO_AUTH_MODE: "development" }, stdio: ["ignore", "pipe", "pipe"] });
let output = "";
child.stdout.on("data", (chunk) => { output += chunk.toString(); });
child.stderr.on("data", (chunk) => { output += chunk.toString(); });
function assert(condition, message) { if (!condition) throw new Error(message); }
try {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline && !output.includes("PrivateDAO local proof engine listening")) {
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  assert(output.includes("PrivateDAO local proof engine listening"), `engine did not start: ${output.slice(-1000)}`);
  const viewer = await fetch(`http://127.0.0.1:${port}/v1/license/activate`, { method: "POST", headers: { "content-type": "application/json", "x-privatedao-role": "viewer" }, body: "{}" });
  assert(viewer.status === 403, "viewer was allowed to activate a license");
  const admin = await fetch(`http://127.0.0.1:${port}/v1/license/activate`, { method: "POST", headers: { "content-type": "application/json", "x-privatedao-role": "admin" }, body: "{}" });
  assert(admin.status !== 403, "admin was blocked by the role gate");
  console.log("Private engine RBAC test: PASS (viewer denied, admin reached endpoint)");
} finally {
  child.kill("SIGTERM");
  await new Promise((resolve) => setTimeout(resolve, 500));
  child.kill("SIGKILL");
  await Promise.race([new Promise((resolve) => child.once("exit", resolve)), new Promise((resolve) => setTimeout(resolve, 1000))]);
  await rm(dataDir, { recursive: true, force: true });
}
