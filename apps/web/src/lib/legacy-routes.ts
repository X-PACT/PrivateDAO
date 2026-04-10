const legacyPageRouteMap: Record<string, string> = {
  proposals: "/",
  dashboard: "/dashboard",
  proof: "/proof",
  security: "/security",
  diagnostics: "/diagnostics",
  analytics: "/analytics",
  services: "/services",
  awards: "/awards",
  migrate: "/services",
  protocol: "/security",
  command: "/command-center",
  "command-center": "/command-center",
  documents: "/documents",
};

const curatedDocumentRouteMap: Record<string, string> = {
  "reviewer-fast-path.md": "/documents/reviewer-fast-path",
  "audit-packet.generated.md": "/documents/audit-packet",
  "test-wallet-live-proof-v3.generated.md": "/documents/live-proof-v3",
  "governance-hardening-v3.md": "/documents/governance-hardening-v3",
  "settlement-hardening-v3.md": "/documents/settlement-hardening-v3",
  "launch-trust-packet.generated.md": "/documents/launch-trust-packet",
  "mainnet-blockers.md": "/documents/mainnet-blockers",
  "trust-package.md": "/documents/trust-package",
  "pilot-program.md": "/documents/pilot-program",
  "service-level-agreement.md": "/documents/service-level-agreement",
  "pricing-model.md": "/documents/pricing-model",
  "service-catalog.md": "/documents/service-catalog",
  "production-custody-ceremony.md": "/documents/production-custody-ceremony",
  "external-audit-engagement.md": "/documents/external-audit-engagement",
  "frontier-integrations.generated.md": "/documents/frontier-integrations",
};

function normalizeDocParam(doc: string) {
  return doc.replace(/^\/+/, "").replace(/\\/g, "/");
}

function stripMarkdownExtension(pathname: string) {
  return pathname.replace(/\.md$/i, "");
}

export function legacyDocumentQueryToRoute(doc: string) {
  const normalized = normalizeDocParam(doc);
  const curated = curatedDocumentRouteMap[normalized];
  if (curated) {
    return curated;
  }

  const slug = stripMarkdownExtension(normalized)
    .split("/")
    .filter(Boolean)
    .join("/");

  return slug ? `/viewer/${slug}` : "/documents";
}

export function legacyQueryToRoute(searchParams: URLSearchParams) {
  const page = searchParams.get("page");
  if (!page) return null;

  if (page === "docs") {
    const doc = searchParams.get("doc");
    return doc ? legacyDocumentQueryToRoute(doc) : "/documents";
  }

  const mapped = legacyPageRouteMap[page];
  if (!mapped) return null;

  if (page === "proof" && searchParams.get("judge") === "1") {
    return `${mapped}?judge=1`;
  }

  return mapped;
}
