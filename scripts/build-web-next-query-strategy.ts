import fs from "fs";
import path from "path";

type QueryRule = {
  query: string;
  currentBehavior: string;
  nextTarget: string;
  strategy: "preserve-on-docs" | "map-to-next-route" | "defer-until-doc-viewer";
  note: string;
};

const queryRules: QueryRule[] = [
  {
    query: "?page=proposals",
    currentBehavior: "opens the current docs home surface",
    nextTarget: "/",
    strategy: "map-to-next-route",
    note: "This becomes the primary landing route in apps/web during staged mirror rollout.",
  },
  {
    query: "?page=proof",
    currentBehavior: "opens the proof center in docs",
    nextTarget: "/proof/",
    strategy: "map-to-next-route",
    note: "The route exists in apps/web and is already exportable.",
  },
  {
    query: "?page=security",
    currentBehavior: "opens the security surface in docs",
    nextTarget: "/security/",
    strategy: "map-to-next-route",
    note: "Governance V3 and settlement V3 surfaces are available in apps/web.",
  },
  {
    query: "?page=diagnostics",
    currentBehavior: "opens diagnostics and runtime panels in docs",
    nextTarget: "/diagnostics/",
    strategy: "map-to-next-route",
    note: "Use apps/web once mirror routing is validated end-to-end.",
  },
  {
    query: "?page=awards",
    currentBehavior: "opens awards and trust material in docs",
    nextTarget: "/awards/",
    strategy: "map-to-next-route",
    note: "Awards and trust surfaces exist in apps/web.",
  },
  {
    query: "?page=proof&judge=1",
    currentBehavior: "forces judge-mode proof entry in docs",
    nextTarget: "/proof/?judge=1",
    strategy: "map-to-next-route",
    note: "The legacy entrypoint is now preserved in apps/web and keeps the reviewer intent visible inside the proof surface.",
  },
  {
    query: "?page=migrate",
    currentBehavior: "opens migration-specific surface in docs",
    nextTarget: "/services/",
    strategy: "map-to-next-route",
    note: "Services is now the canonical migration and commercial landing surface in apps/web.",
  },
  {
    query: "?page=protocol",
    currentBehavior: "opens protocol-centric narrative in docs",
    nextTarget: "/security/",
    strategy: "map-to-next-route",
    note: "Security is now the canonical protocol and hardening route in apps/web.",
  },
  {
    query: "?page=docs&doc=reviewer-fast-path.md",
    currentBehavior: "opens the docs viewer directly on reviewer-fast-path.md",
    nextTarget: "/documents/reviewer-fast-path/",
    strategy: "map-to-next-route",
    note: "Curated reviewer docs now have in-app routes, and the broader markdown corpus is available through /viewer/.",
  },
];

function main() {
  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    status: "query-strategy-next-ready",
    currentLiveSurface: "docs/index.html",
    nextSurfaceRoot: "apps/web",
    queryRules,
    commands: [
      "npm run build:web-next-query-strategy",
      "npm run verify:web-next-query-strategy",
      "npm run build:web-next-cutover-map",
      "npm run verify:web-next-cutover-map",
    ],
    routingBoundary: [
      "do not rewrite docs query entrypoints in-place while docs remains canonical",
      "map legacy query entrypoints to apps/web routes while docs remains the canonical live surface",
      "keep docs available as the authoritative archive until the mirror replaces it explicitly",
      "prefer curated document routes first and fall back to /viewer/ for broader markdown parity",
    ],
  };

  fs.writeFileSync(path.resolve("docs/web-next-query-strategy.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/web-next-query-strategy.generated.md"), buildMarkdown(payload));
  console.log("Wrote web next query strategy");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  status: string;
  currentLiveSurface: string;
  nextSurfaceRoot: string;
  queryRules: QueryRule[];
  commands: string[];
  routingBoundary: string[];
}) {
  return `# Web Next Query Preservation Strategy

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- status: \`${payload.status}\`
- current live surface: \`${payload.currentLiveSurface}\`
- next surface root: \`${payload.nextSurfaceRoot}\`

## Query Rules

${payload.queryRules
  .map(
    (entry) => `### ${entry.query}

- current behavior: ${entry.currentBehavior}
- next target: \`${entry.nextTarget}\`
- strategy: \`${entry.strategy}\`
- note: ${entry.note}`,
  )
  .join("\n\n")}

## Commands

${payload.commands.map((entry) => `- \`${entry}\``).join("\n")}

## Routing Boundary

${payload.routingBoundary.map((entry) => `- ${entry}`).join("\n")}
`;
}

main();
