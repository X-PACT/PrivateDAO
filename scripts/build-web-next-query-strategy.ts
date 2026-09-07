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
    currentBehavior: "legacy query entry preserved by the root Next.js surface",
    nextTarget: "/",
    strategy: "map-to-next-route",
    note: "This becomes the primary landing route in apps/web during staged mirror rollout.",
  },
  {
    query: "?page=proof",
    currentBehavior: "legacy proof query preserved by the root Next.js surface",
    nextTarget: "/proof/",
    strategy: "map-to-next-route",
    note: "The route exists in apps/web and is already exportable.",
  },
  {
    query: "?page=security",
    currentBehavior: "legacy security query preserved by the root Next.js surface",
    nextTarget: "/security/",
    strategy: "map-to-next-route",
    note: "Governance V3 and settlement V3 surfaces are available in apps/web.",
  },
  {
    query: "?page=diagnostics",
    currentBehavior: "legacy diagnostics query preserved by the root Next.js surface",
    nextTarget: "/diagnostics/",
    strategy: "map-to-next-route",
    note: "Use apps/web once mirror routing is validated end-to-end.",
  },
  {
    query: "?page=awards",
    currentBehavior: "legacy awards query preserved by the root Next.js surface",
    nextTarget: "/awards/",
    strategy: "map-to-next-route",
    note: "Awards and trust surfaces exist in apps/web.",
  },
  {
    query: "?page=proof&judge=1",
    currentBehavior: "forces judge-mode proof entry through the root Next.js surface",
    nextTarget: "/proof/?judge=1",
    strategy: "map-to-next-route",
    note: "The legacy entrypoint is now preserved in apps/web and keeps the reviewer intent visible inside the proof surface.",
  },
  {
    query: "?page=migrate",
    currentBehavior: "legacy migration query preserved by the root Next.js surface",
    nextTarget: "/services/",
    strategy: "map-to-next-route",
    note: "Services is now the canonical migration and commercial landing surface in apps/web.",
  },
  {
    query: "?page=protocol",
    currentBehavior: "legacy protocol query preserved by the root Next.js surface",
    nextTarget: "/security/",
    strategy: "map-to-next-route",
    note: "Security is now the canonical protocol and hardening route in apps/web.",
  },
  {
    query: "?page=docs&doc=reviewer-fast-path.md",
    currentBehavior: "legacy docs-viewer query preserved by the root Next.js surface",
    nextTarget: "/documents/reviewer-fast-path/",
    strategy: "map-to-next-route",
    note: "Curated reviewer docs now have in-app routes, and the broader markdown corpus is available through /viewer/.",
  },
];

function main() {
  const rootLive = detectRootLiveSurface();
  const payload = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    status: rootLive ? "query-strategy-live" : "query-strategy-incomplete",
    currentLiveSurface: rootLive ? "repo root Next.js export" : "live surface missing",
    nextSurfaceRoot: "apps/web",
    queryRules,
    commands: [
      "npm run build:web-next-query-strategy",
      "npm run verify:web-next-query-strategy",
      "npm run build:web-next-cutover-map",
      "npm run verify:web-next-cutover-map",
      "npm run web:verify:live:github",
    ],
    routingBoundary: rootLive
      ? [
          "preserve legacy query entrypoints through the apps/web root route",
          "keep docs available only as the archive and raw-reference surface under /docs/",
          "prefer curated document routes first and fall back to /viewer/ for broader markdown parity",
        ]
      : [
          "restore the repo root Next.js export before claiming complete cutover",
          "legacy query entrypoints should resolve through the Next root rather than the archived docs surface",
          "keep docs available only as the archive and raw-reference surface once root publication is restored",
          "prefer curated document routes first and fall back to /viewer/ for broader markdown parity",
        ],
  };

  fs.writeFileSync(path.resolve("docs/web-next-query-strategy.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/web-next-query-strategy.generated.md"), buildMarkdown(payload));
  console.log("Wrote web next query strategy");
}

function detectRootLiveSurface() {
  const rootIndex = path.resolve("index.html");
  const nextDir = path.resolve("_next");
  return fs.existsSync(rootIndex) && fs.existsSync(nextDir) && !fs.readFileSync(rootIndex, "utf8").includes("window.location.replace(target)");
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
