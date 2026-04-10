import fs from "fs";
import path from "path";

type RouteEntry = {
  route: string;
  exportPath: string;
  purpose: string;
};

const routes: RouteEntry[] = [
  { route: "/", exportPath: "index.html", purpose: "buyer, judge, and operator landing surface" },
  { route: "/command-center/", exportPath: "command-center/index.html", purpose: "proposal workspace and execution journey" },
  { route: "/dashboard/", exportPath: "dashboard/index.html", purpose: "DAO, proposal, treasury, and execution overview" },
  { route: "/proof/", exportPath: "proof/index.html", purpose: "baseline proof, V3 proof, and reviewer trail" },
  { route: "/documents/", exportPath: "documents/index.html", purpose: "curated reviewer and trust document library" },
  { route: "/viewer/", exportPath: "viewer/index.html", purpose: "repository markdown viewer for broader docs parity and legacy query preservation" },
  { route: "/security/", exportPath: "security/index.html", purpose: "governance and settlement hardening surfaces" },
  { route: "/diagnostics/", exportPath: "diagnostics/index.html", purpose: "artifact health, runtime checks, and launch blockers" },
  { route: "/analytics/", exportPath: "analytics/index.html", purpose: "votes, treasury actions, and readiness analytics" },
  { route: "/services/", exportPath: "services/index.html", purpose: "commercial packs, pilot, and SLA journey" },
  { route: "/awards/", exportPath: "awards/index.html", purpose: "awards, trust links, and reviewer credibility path" },
];

function main() {
  const generatedAt = new Date().toISOString();
  const githubBundleDir = "dist/web-mirror-github";
  const githubArchive = "dist/web-mirror-github.tar.gz";
  const rootBundleDir = "dist/web-mirror-root";
  const rootArchive = "dist/web-mirror-root.tar.gz";
  const rootLive = detectRootLiveSurface();

  const payload = {
    project: "PrivateDAO",
    generatedAt,
    status: rootLive ? "live-on-root" : "staged-not-live",
    currentLiveSurface: rootLive ? "repo root Next.js export" : "docs/index.html",
    nextAppRoot: "apps/web",
    reviewerBoundary: rootLive
      ? "apps/web static export at the repo root is now the canonical live reviewer-facing surface, while docs remains the archive and raw-reference surface."
      : "docs remains the canonical live reviewer-facing surface until explicit cutover.",
    mirrorModes: [
      {
        mode: "github",
        basePath: "/PrivateDAO",
        bundleDir: githubBundleDir,
        archive: githubArchive,
        status: rootLive
          ? "published-at-root"
          : fs.existsSync(path.resolve(githubBundleDir)) && fs.existsSync(path.resolve(githubArchive))
            ? "built-and-verified"
            : "build-required",
        verificationCommand: "npm run web:verify:bundle:github",
      },
      {
        mode: "root",
        basePath: "/",
        bundleDir: rootBundleDir,
        archive: rootArchive,
        status: fs.existsSync(path.resolve(rootBundleDir)) && fs.existsSync(path.resolve(rootArchive)) ? "built-and-verified" : "planned-build",
        verificationCommand: "npm run web:verify:bundle:root",
      },
    ],
    requiredRoutes: routes,
    parityDocs: [
      "docs/web-next-cutover.md",
      "docs/web-next-route-parity.md",
      "docs/web-next-doc-viewer-plan.generated.md",
      "docs/domain-mirror.md",
      "docs/xyz-mirror-cutover-checklist.md",
    ],
    commands: [
      "npm run web:build:github",
      "npm run web:bundle:github",
      "npm run web:verify:bundle:github",
      "npm run web:publish:github",
      "npm run web:verify:live:github",
      "npm run build:web-next-handoff",
      "npm run verify:web-next-handoff",
    ],
    cutoverRule: rootLive
      ? [
          "treat the repo root Next.js export as the canonical live surface",
          "preserve docs as the archive and raw-reference surface under /docs/",
          "keep reviewer links, judge-mode proof, and legacy docs entrypoints resolving through apps/web compatibility routes",
        ]
      : [
          "do not replace docs/index.html silently",
          "do not call apps/web canonical until reviewer links, judge-mode proof, and legacy docs entrypoints resolve under the mirror origin",
          "preserve current GitHub Pages reviewer paths while the mirror is staged",
        ],
  };

  fs.writeFileSync(path.resolve("docs/web-next-handoff.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/web-next-handoff.generated.md"), buildMarkdown(payload));
  console.log("Wrote web next handoff manifest");
}

function detectRootLiveSurface() {
  const rootIndex = path.resolve("index.html");
  const nextDir = path.resolve("_next");
  const liveProofRoute = path.resolve("proof/index.html");
  const noJekyll = path.resolve(".nojekyll");

  if (!fs.existsSync(rootIndex) || !fs.existsSync(nextDir) || !fs.existsSync(liveProofRoute) || !fs.existsSync(noJekyll)) {
    return false;
  }

  const html = fs.readFileSync(rootIndex, "utf8");
  return html.includes("/_next/") && !html.includes("window.location.replace(target)");
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  status: string;
  currentLiveSurface: string;
  nextAppRoot: string;
  reviewerBoundary: string;
  mirrorModes: Array<{
    mode: string;
    basePath: string;
    bundleDir: string;
    archive: string;
    status: string;
    verificationCommand: string;
  }>;
  requiredRoutes: RouteEntry[];
  parityDocs: string[];
  commands: string[];
  cutoverRule: string[];
}) {
  return `# Web Next Handoff Manifest

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- current status: \`${payload.status}\`
- current live surface: \`${payload.currentLiveSurface}\`
- next app root: \`${payload.nextAppRoot}\`

Boundary:

- ${payload.reviewerBoundary}

## Mirror Modes

${payload.mirrorModes
  .map(
    (entry) => `### ${entry.mode}

- base path: \`${entry.basePath}\`
- bundle directory: \`${entry.bundleDir}\`
- archive: \`${entry.archive}\`
- status: \`${entry.status}\`
- verification: \`${entry.verificationCommand}\``,
  )
  .join("\n\n")}

## Required Routes

${payload.requiredRoutes
  .map(
    (entry) => `- \`${entry.route}\` -> \`${entry.exportPath}\` (${entry.purpose})`,
  )
  .join("\n")}

## Parity Documents

${payload.parityDocs.map((entry) => `- \`${entry}\``).join("\n")}

## Commands

${payload.commands.map((entry) => `- \`${entry}\``).join("\n")}

## Cutover Rule

${payload.cutoverRule.map((entry) => `- ${entry}`).join("\n")}
`;
}

main();
