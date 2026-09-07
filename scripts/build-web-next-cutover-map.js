"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mappings = [
    {
        currentEntry: "/?page=proposals",
        currentPurpose: "current live home, packs, proposal lifecycle, and product narrative",
        nextRoute: "/",
        parityStatus: "ready-for-mirror",
        note: "Use `/command-center/` for the deeper operator workflow after landing.",
    },
    {
        currentEntry: "/?page=proof",
        currentPurpose: "proof center and reviewer flow",
        nextRoute: "/proof/",
        parityStatus: "ready-for-mirror",
        note: "Judge links still need mirror-origin validation before canonical cutover.",
    },
    {
        currentEntry: "/?page=proof&judge=1",
        currentPurpose: "judge-focused review surface",
        nextRoute: "/proof/?judge=1",
        parityStatus: "ready-for-mirror",
        note: "Judge-mode query is preserved inside the Next proof surface; mirror-origin validation still remains part of cutover execution.",
    },
    {
        currentEntry: "/?page=security",
        currentPurpose: "security, V3 hardening, and launch boundary surface",
        nextRoute: "/security/",
        parityStatus: "ready-for-mirror",
        note: "Security narrative is present in apps/web and exportable today.",
    },
    {
        currentEntry: "/?page=diagnostics",
        currentPurpose: "runtime, artifact, and launch-blocker diagnostics",
        nextRoute: "/diagnostics/",
        parityStatus: "ready-for-mirror",
        note: "Diagnostics parity is UI-level; keep docs surface as the reviewer anchor until cutover.",
    },
    {
        currentEntry: "/?page=awards",
        currentPurpose: "awards and trust surface",
        nextRoute: "/awards/",
        parityStatus: "ready-for-mirror",
        note: "Awards, pitch, trust packet, and proof links exist in apps/web.",
    },
    {
        currentEntry: "/?page=migrate",
        currentPurpose: "migration and Realms-adjacent transition surface inside the current docs app",
        nextRoute: "/services/",
        parityStatus: "ready-for-mirror",
        note: "Services is the canonical migration and commercial landing surface in apps/web.",
    },
    {
        currentEntry: "/?page=protocol",
        currentPurpose: "protocol reference and system explanation",
        nextRoute: "/security/",
        parityStatus: "ready-for-mirror",
        note: "Security is now the canonical protocol and hardening surface in apps/web.",
    },
    {
        currentEntry: "/?page=docs&doc=reviewer-fast-path.md",
        currentPurpose: "document viewer entrypoint for reviewer packets",
        nextRoute: "/documents/reviewer-fast-path/",
        parityStatus: "ready-for-mirror",
        note: "Curated reviewer packets route to /documents and broader markdown parity is preserved through /viewer/.",
    },
];
function main() {
    const rootLive = detectRootLiveSurface();
    const payload = {
        project: "PrivateDAO",
        generatedAt: new Date().toISOString(),
        currentLiveSurface: rootLive ? "repo root Next.js export" : "live surface missing",
        nextSurfaceRoot: "apps/web",
        status: rootLive ? "live-cutover-map" : "staged-cutover-map",
        mappings,
        commands: [
            "npm run build:web-next-cutover-map",
            "npm run verify:web-next-cutover-map",
            "npm run web:verify:bundle:github",
            "npm run web:verify:live:github",
            "npm run verify:web-next-handoff",
        ],
        cutoverBoundary: rootLive
            ? [
                "apps/web export at the repo root is the canonical live surface",
                "preserve docs only as the archive and raw-reference surface under /docs/",
                "use /documents for curated packets and /viewer for broader repository markdown parity",
            ]
            : [
                "restore the root Next.js export before claiming complete cutover",
                "treat apps/web as the canonical live surface once the root export is restored",
                "use /documents for curated packets and /viewer for broader repository markdown parity",
            ],
    };
    fs_1.default.writeFileSync(path_1.default.resolve("docs/web-next-cutover-map.generated.json"), JSON.stringify(payload, null, 2) + "\n");
    fs_1.default.writeFileSync(path_1.default.resolve("docs/web-next-cutover-map.generated.md"), buildMarkdown(payload));
    console.log("Wrote web next cutover map");
}
function detectRootLiveSurface() {
    const rootIndex = path_1.default.resolve("index.html");
    const nextDir = path_1.default.resolve("_next");
    return fs_1.default.existsSync(rootIndex) && fs_1.default.existsSync(nextDir) && !fs_1.default.readFileSync(rootIndex, "utf8").includes("window.location.replace(target)");
}
function buildMarkdown(payload) {
    return `# Web Next Cutover Map

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- status: \`${payload.status}\`
- current live surface: \`${payload.currentLiveSurface}\`
- next surface root: \`${payload.nextSurfaceRoot}\`

## Staged Route Mapping

${payload.mappings
        .map((entry) => `### ${entry.currentEntry}

- purpose: ${entry.currentPurpose}
- next route: \`${entry.nextRoute}\`
- parity status: \`${entry.parityStatus}\`
- note: ${entry.note}`)
        .join("\n\n")}

## Commands

${payload.commands.map((entry) => `- \`${entry}\``).join("\n")}

## Cutover Boundary

${payload.cutoverBoundary.map((entry) => `- ${entry}`).join("\n")}
`;
}
main();
