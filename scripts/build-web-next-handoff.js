"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const routes = [
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
        currentLiveSurface: rootLive ? "repo root Next.js export" : "live surface missing",
        nextAppRoot: "apps/web",
        reviewerBoundary: rootLive
            ? "apps/web static export at the repo root is now the canonical live reviewer-facing surface, while docs remains the archive and raw-reference surface."
            : "the root Next.js export is missing and must be restored before claiming the live reviewer-facing surface is complete.",
        mirrorModes: [
            {
                mode: "github",
                basePath: "/PrivateDAO",
                bundleDir: githubBundleDir,
                archive: githubArchive,
                status: rootLive
                    ? "published-at-root"
                    : fs_1.default.existsSync(path_1.default.resolve(githubBundleDir)) && fs_1.default.existsSync(path_1.default.resolve(githubArchive))
                        ? "built-and-verified"
                        : "build-required",
                verificationCommand: "npm run web:verify:bundle:github",
            },
            {
                mode: "root",
                basePath: "/",
                bundleDir: rootBundleDir,
                archive: rootArchive,
                status: fs_1.default.existsSync(path_1.default.resolve(rootBundleDir)) && fs_1.default.existsSync(path_1.default.resolve(rootArchive)) ? "built-and-verified" : "planned-build",
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
                "restore the root Next.js export before claiming complete cutover",
                "do not treat archived docs as the live reviewer-facing surface again",
                "preserve reviewer links, judge-mode proof, and legacy docs entrypoints through the Next root once restored",
            ],
    };
    fs_1.default.writeFileSync(path_1.default.resolve("docs/web-next-handoff.generated.json"), JSON.stringify(payload, null, 2) + "\n");
    fs_1.default.writeFileSync(path_1.default.resolve("docs/web-next-handoff.generated.md"), buildMarkdown(payload));
    console.log("Wrote web next handoff manifest");
}
function detectRootLiveSurface() {
    const rootIndex = path_1.default.resolve("index.html");
    const nextDir = path_1.default.resolve("_next");
    const liveProofRoute = path_1.default.resolve("proof/index.html");
    const noJekyll = path_1.default.resolve(".nojekyll");
    if (!fs_1.default.existsSync(rootIndex) || !fs_1.default.existsSync(nextDir) || !fs_1.default.existsSync(liveProofRoute) || !fs_1.default.existsSync(noJekyll)) {
        return false;
    }
    const html = fs_1.default.readFileSync(rootIndex, "utf8");
    return html.includes("/_next/") && !html.includes("window.location.replace(target)");
}
function buildMarkdown(payload) {
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
        .map((entry) => `### ${entry.mode}

- base path: \`${entry.basePath}\`
- bundle directory: \`${entry.bundleDir}\`
- archive: \`${entry.archive}\`
- status: \`${entry.status}\`
- verification: \`${entry.verificationCommand}\``)
        .join("\n\n")}

## Required Routes

${payload.requiredRoutes
        .map((entry) => `- \`${entry.route}\` -> \`${entry.exportPath}\` (${entry.purpose})`)
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
