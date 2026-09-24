import assert from "node:assert/strict";
import test from "node:test";
import { mergeGithubInstallationRepositories, publicGithubInstallationRecord } from "../src/github-app.mjs";

test("installation repository webhook deltas preserve existing access and apply additions/removals", () => {
  const merged = mergeGithubInstallationRepositories(
    [
      { id: 1, full_name: "X-PACT/PrivateDAO", private: true, default_branch: "main" },
      { id: 2, full_name: "X-PACT/old", private: false, default_branch: "main" },
    ],
    [{ id: 3, full_name: "X-PACT/new", private: true, default_branch: "master" }],
    [{ id: 2, full_name: "X-PACT/old" }],
  );
  assert.deepEqual(merged, [
    { id: 3, full_name: "X-PACT/new", private: true, default_branch: "master" },
    { id: 1, full_name: "X-PACT/PrivateDAO", private: true, default_branch: "main" },
  ]);
});

test("installation repository webhook ignores legacy removed markers and malformed deltas", () => {
  const merged = mergeGithubInstallationRepositories(
    [{ id: 1, full_name: "X-PACT/old", removed: true }, { id: 2, full_name: "X-PACT/keep" }],
    [{ full_name: "X-PACT/no-id" }, { id: 3, full_name: "X-PACT/new" }],
    [],
  );
  assert.deepEqual(merged, [
    { id: 2, full_name: "X-PACT/keep", private: false, default_branch: null },
    { id: 3, full_name: "X-PACT/new", private: false, default_branch: null },
  ]);
});

test("public installation metadata never exposes repository names or credential hashes", () => {
  const safe = publicGithubInstallationRecord({
    id: "github_installation_164152168",
    kind: "github_installation",
    connection_token_hash: "secret-hash",
    repositories: [{ id: 1, full_name: "X-PACT/private-repo", private: true }],
    status: "active",
  });
  assert.equal(safe.repository_count, 1);
  assert.equal("repositories" in safe, false);
  assert.equal("connection_token_hash" in safe, false);
  assert.equal(JSON.stringify(safe).includes("private-repo"), false);
});
