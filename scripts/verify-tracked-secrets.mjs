import { execFileSync } from "node:child_process";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const forbidden = tracked.filter((file) => {
  if (file === ".env.example" || file.endsWith("/.env.example")) return false;
  return /(^|\/)(\.env(?:\..+)?|.*\.(?:pem|p12|pfx|key)|.*(?:keypair|private-key|secret).*\.json)$/i.test(file);
});

if (forbidden.length > 0) {
  throw new Error(`Sensitive file paths are tracked in Git: ${forbidden.length}`);
}

console.log(`[tracked-secrets] PASS tracked_files=${tracked.length}`);
