import { execFileSync } from "node:child_process";

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const currentBranch = git("branch", "--show-current");
if (currentBranch !== "main") {
  throw new Error(`Canonical source must be checked out on main, found ${currentBranch || "detached HEAD"}.`);
}

const mainSha = git("rev-parse", "refs/heads/main");
const canonicalLiveSha = git("rev-parse", "refs/remotes/origin/canonical-live");
if (mainSha !== canonicalLiveSha) {
  throw new Error(`main and origin/canonical-live diverged: ${mainSha} != ${canonicalLiveSha}`);
}

const activeBranches = git("for-each-ref", "--format=%(refname:short)", "refs/heads/")
  .split("\n")
  .filter(Boolean);
const unexpectedBranches = activeBranches.filter(
  (branch) => branch !== "main" && branch !== "canonical-live" && !branch.startsWith("dependabot/"),
);
if (unexpectedBranches.length > 0) {
  throw new Error(`Unexpected active product branches: ${unexpectedBranches.join(", ")}`);
}

const archiveTags = git("tag", "--list", "archive-*").split("\n").filter(Boolean);
if (archiveTags.length === 0) throw new Error("No archive-* recovery tags were found.");

console.log(`[canonical-repository] PASS branch=main sha=${mainSha}`);
console.log(`[canonical-repository] PASS synchronized_ref=origin/canonical-live`);
console.log(`[canonical-repository] PASS active_branches=${activeBranches.length}`);
console.log(`[canonical-repository] PASS archive_tags=${archiveTags.length}`);
