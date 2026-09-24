const repositoryPattern = /^https:\/\/github\.com\/([A-Za-z0-9_.-]{1,100})\/([A-Za-z0-9_.-]{1,100})(?:\/)?$/;

export function githubProviderStatus(config) {
  const appConfigured = Boolean(config.githubAppId && config.githubAppPrivateKey);
  const webhookConfigured = Boolean(config.githubWebhookSecret);
  return {
    provider: "github",
    status: appConfigured || config.githubToken || config.githubRepository ? "configured" : "public-read-only",
    role: "repository-provenance-and-release-evidence",
    app_configured: appConfigured,
    installation_authentication: appConfigured,
    oauth_required: false,
    webhook_configured: webhookConfigured,
    credentials_exposed: false,
  };
}

export async function repositoryEvidence(config, input = {}) {
  const url = String(input.repository || input.repo || config.githubRepository || "").trim();
  const match = repositoryPattern.exec(url);
  if (!match) throw new Error("public GitHub repository URL is required");
  const [, owner, repo] = match;
  const api = `${config.githubApiUrl.replace(/\/$/, "")}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const headers = { accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28" };
  if (config.githubToken) headers.authorization = `Bearer ${config.githubToken}`;
  const response = await fetch(api, { headers, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`GitHub repository API HTTP ${response.status}`);
  const body = await response.json();
  return {
    provider: "github",
    evidence_confidence: "github-api-confirmed",
    repository: body.html_url || url,
    full_name: body.full_name || `${owner}/${repo}`,
    default_branch: body.default_branch || null,
    archived: Boolean(body.archived),
    fork: Boolean(body.fork),
    visibility: body.visibility || null,
    pushed_at: body.pushed_at || null,
    updated_at: body.updated_at || null,
    open_issues: body.open_issues_count ?? null,
    license: body.license?.spdx_id || null,
    observed_at: new Date().toISOString(),
  };
}
