import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { mergeGithubInstallationRepositories, publicGithubInstallationRecord, verifyGithubWebhook } from "../src/github-app.mjs";
import { MemoryStore } from "../src/storage.mjs";

test("GitHub webhook verification binds the signature to the exact raw body", () => {
  const secret = "webhook-test-secret";
  const rawBody = '{"action":"created","installation":{"id":164152168}}';
  const signature = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  assert.equal(verifyGithubWebhook(rawBody, signature, secret), true);
  assert.equal(verifyGithubWebhook(`${rawBody} `, signature, secret), false);
  assert.equal(verifyGithubWebhook(rawBody, signature.replace(/^sha256=/, "sha1="), secret), false);
});

test("GitHub setup claims are single-use and recover after an expired lease", async () => {
  const store = new MemoryStore();
  await store.put("Registry", "state", { id: "state", kind: "github_setup_state" });
  await store.claim("Registry", "state", { claim_started_at: new Date().toISOString(), claim_expires_at: new Date(Date.now() + 60_000).toISOString(), claim_installation_id: "164152168" });
  await assert.rejects(() => store.claim("Registry", "state", { claim_started_at: new Date().toISOString(), claim_expires_at: new Date(Date.now() + 60_000).toISOString(), claim_installation_id: "164152168" }));
  await store.update("Registry", "state", (current) => ({ ...current, claim_expires_at: new Date(Date.now() - 1_000).toISOString() }));
  await store.claim("Registry", "state", { claim_started_at: new Date().toISOString(), claim_expires_at: new Date(Date.now() + 60_000).toISOString(), claim_installation_id: "164152168" });
});

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
    owner_token_hash: "another-secret-hash",
    github_access_token_hash: "legacy-secret-hash",
    repositories: [{ id: 1, full_name: "X-PACT/private-repo", private: true }],
    status: "active",
  });
  assert.equal(safe.repository_count, 1);
  assert.equal("repositories" in safe, false);
  assert.equal("connection_token_hash" in safe, false);
  assert.equal("owner_token_hash" in safe, false);
  assert.equal("github_access_token_hash" in safe, false);
  assert.equal(JSON.stringify(safe).includes("private-repo"), false);
});
