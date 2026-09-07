"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/web-next-handoff.generated.json");
    const mdPath = path_1.default.resolve("docs/web-next-handoff.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing web next handoff artifacts");
    }
    const payload = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(payload.project === "PrivateDAO", "web next handoff project mismatch");
    assert(payload.status === "live-on-root", "web next handoff status mismatch");
    assert(payload.currentLiveSurface === "repo root Next.js export", "web next handoff live surface mismatch");
    assert(payload.nextAppRoot === "apps/web", "web next handoff app root mismatch");
    assert(payload.reviewerBoundary.includes("canonical live reviewer-facing surface"), "web next handoff boundary text is too weak");
    const githubMode = payload.mirrorModes.find((entry) => entry.mode === "github");
    const rootMode = payload.mirrorModes.find((entry) => entry.mode === "root");
    assert(Boolean(githubMode), "web next handoff is missing github mirror mode");
    assert(Boolean(rootMode), "web next handoff is missing root mirror mode");
    assert(githubMode?.basePath === "/PrivateDAO", "web next handoff github base path mismatch");
    assert(githubMode?.verificationCommand === "npm run web:verify:bundle:github", "web next handoff github verification command mismatch");
    assert(rootMode?.verificationCommand === "npm run web:verify:bundle:root", "web next handoff root verification command mismatch");
    const requiredRoutes = [
        "/",
        "/command-center/",
        "/dashboard/",
        "/proof/",
        "/documents/",
        "/viewer/",
        "/security/",
        "/diagnostics/",
        "/analytics/",
        "/services/",
        "/awards/",
    ];
    for (const route of requiredRoutes) {
        assert(payload.requiredRoutes.some((entry) => entry.route === route), `web next handoff missing route: ${route}`);
    }
    for (const doc of [
        "docs/web-next-cutover.md",
        "docs/web-next-route-parity.md",
        "docs/web-next-doc-viewer-plan.generated.md",
        "docs/domain-mirror.md",
        "docs/xyz-mirror-cutover-checklist.md",
    ]) {
        assert(payload.parityDocs.includes(doc), `web next handoff missing parity doc: ${doc}`);
    }
    for (const command of [
        "npm run web:bundle:github",
        "npm run web:verify:bundle:github",
        "npm run web:publish:github",
        "npm run web:verify:live:github",
        "npm run build:web-next-handoff",
        "npm run verify:web-next-handoff",
    ]) {
        assert(payload.commands.includes(command), `web next handoff missing command: ${command}`);
    }
    for (const token of [
        "# Web Next Handoff Manifest",
        "`/proof/` -> `proof/index.html`",
        "`/documents/` -> `documents/index.html`",
        "`/viewer/` -> `viewer/index.html`",
        "`/services/` -> `services/index.html`",
        "`npm run web:verify:bundle:github`",
    ]) {
        assert(markdown.includes(token), `web next handoff markdown is missing: ${token}`);
    }
    assert(markdown.includes("current live surface: `repo root Next.js export`"), "web next handoff markdown live surface mismatch");
    console.log("Web next handoff verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
