"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/web-next-cutover-map.generated.json");
    const mdPath = path_1.default.resolve("docs/web-next-cutover-map.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing web next cutover map artifacts");
    }
    const payload = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(payload.project === "PrivateDAO", "web next cutover map project mismatch");
    assert(payload.status === "live-cutover-map", "web next cutover map status mismatch");
    assert(payload.currentLiveSurface === "repo root Next.js export", "web next cutover map live surface mismatch");
    assert(payload.nextSurfaceRoot === "apps/web", "web next cutover map next surface root mismatch");
    for (const entry of [
        "/?page=proposals",
        "/?page=proof",
        "/?page=proof&judge=1",
        "/?page=security",
        "/?page=diagnostics",
        "/?page=awards",
        "/?page=migrate",
        "/?page=protocol",
        "/?page=docs&doc=reviewer-fast-path.md",
    ]) {
        assert(payload.mappings.some((item) => item.currentEntry === entry), `web next cutover map missing entry: ${entry}`);
    }
    const proposals = payload.mappings.find((item) => item.currentEntry === "/?page=proposals");
    const judge = payload.mappings.find((item) => item.currentEntry === "/?page=proof&judge=1");
    const docsViewer = payload.mappings.find((item) => item.currentEntry === "/?page=docs&doc=reviewer-fast-path.md");
    assert(proposals?.nextRoute === "/", "web next cutover map proposals route mismatch");
    assert(proposals?.parityStatus === "ready-for-mirror", "web next cutover map proposals parity mismatch");
    assert(judge?.nextRoute === "/proof/?judge=1", "web next cutover map judge target mismatch");
    assert(judge?.parityStatus === "ready-for-mirror", "web next cutover map judge parity mismatch");
    assert(docsViewer?.nextRoute === "/documents/reviewer-fast-path/", "web next cutover map docs viewer target mismatch");
    assert(docsViewer?.parityStatus === "ready-for-mirror", "web next cutover map docs viewer parity mismatch");
    for (const command of [
        "npm run build:web-next-cutover-map",
        "npm run verify:web-next-cutover-map",
        "npm run web:verify:bundle:github",
        "npm run web:verify:live:github",
        "npm run verify:web-next-handoff",
    ]) {
        assert(payload.commands.includes(command), `web next cutover map missing command: ${command}`);
    }
    assert(payload.cutoverBoundary.includes("use /documents for curated packets and /viewer for broader repository markdown parity"), "web next cutover map missing documents/viewer boundary");
    for (const token of [
        "# Web Next Cutover Map",
        "### /?page=proposals",
        "### /?page=proof&judge=1",
        "### /?page=docs&doc=reviewer-fast-path.md",
        "- next route: `/proof/?judge=1`",
        "- next route: `/documents/reviewer-fast-path/`",
    ]) {
        assert(markdown.includes(token), `web next cutover markdown is missing: ${token}`);
    }
    console.log("Web next cutover map verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
