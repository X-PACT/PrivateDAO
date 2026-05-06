"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/web-next-doc-viewer-plan.generated.json");
    const mdPath = path_1.default.resolve("docs/web-next-doc-viewer-plan.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing web next doc viewer plan artifacts");
    }
    const payload = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(payload.project === "PrivateDAO", "web next doc viewer plan project mismatch");
    assert(payload.status === "doc-viewer-parity-live", "web next doc viewer plan status mismatch");
    assert(payload.currentCanonicalViewer === "apps/web /documents + /viewer", "web next doc viewer plan canonical viewer mismatch");
    assert(payload.nextAppRoot === "apps/web", "web next doc viewer plan app root mismatch");
    const tiers = [
        "reviewer-core",
        "ops-and-readiness",
        "commercial-and-pilot",
        "deep-reference",
        "legacy-query-entrypoints",
    ];
    for (const tier of tiers) {
        assert(payload.docClasses.some((entry) => entry.tier === tier), `web next doc viewer plan missing tier: ${tier}`);
    }
    const reviewerCore = payload.docClasses.find((entry) => entry.tier === "reviewer-core");
    const docsViewerOnly = payload.docClasses.find((entry) => entry.tier === "legacy-query-entrypoints");
    assert(reviewerCore?.strategy === "surface-as-links", "web next doc viewer reviewer-core strategy mismatch");
    assert(docsViewerOnly?.strategy === "surface-as-links", "web next doc viewer canonical viewer strategy mismatch");
    assert(reviewerCore?.docs.includes("reviewer-fast-path.md"), "web next doc viewer plan missing reviewer-fast-path.md");
    assert(docsViewerOnly?.docs.includes("?page=docs&doc=reviewer-fast-path.md"), "web next doc viewer plan missing docs viewer query path");
    for (const command of [
        "npm run build:web-next-doc-viewer-plan",
        "npm run verify:web-next-doc-viewer-plan",
        "npm run build:web-next-query-strategy",
        "npm run verify:web-next-query-strategy",
    ]) {
        assert(payload.commands.includes(command), `web next doc viewer plan missing command: ${command}`);
    }
    for (const boundary of [
        "apps/web document routes are now the canonical in-app viewer surface",
        "legacy docs queries now have Next destinations through curated /documents routes or the generic /viewer route",
        "raw repository files remain authoritative even when rendered in-app",
    ]) {
        assert(payload.boundary.includes(boundary), `web next doc viewer plan missing boundary: ${boundary}`);
    }
    for (const token of [
        "# Web Next Document Viewer Parity Plan",
        "### reviewer-core",
        "### legacy-query-entrypoints",
        "- strategy: `surface-as-links`",
        "`?page=docs&doc=reviewer-fast-path.md`",
    ]) {
        assert(markdown.includes(token), `web next doc viewer markdown is missing: ${token}`);
    }
    console.log("Web next doc viewer plan verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
