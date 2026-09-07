"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function main() {
    const jsonPath = path_1.default.resolve("docs/web-next-query-strategy.generated.json");
    const mdPath = path_1.default.resolve("docs/web-next-query-strategy.generated.md");
    if (!fs_1.default.existsSync(jsonPath) || !fs_1.default.existsSync(mdPath)) {
        throw new Error("missing web next query strategy artifacts");
    }
    const payload = JSON.parse(fs_1.default.readFileSync(jsonPath, "utf8"));
    const markdown = fs_1.default.readFileSync(mdPath, "utf8");
    assert(payload.project === "PrivateDAO", "web next query strategy project mismatch");
    assert(payload.status === "query-strategy-live", "web next query strategy status mismatch");
    assert(payload.currentLiveSurface === "repo root Next.js export", "web next query strategy live surface mismatch");
    assert(payload.nextSurfaceRoot === "apps/web", "web next query strategy next surface root mismatch");
    for (const query of [
        "?page=proposals",
        "?page=proof",
        "?page=security",
        "?page=diagnostics",
        "?page=awards",
        "?page=proof&judge=1",
        "?page=migrate",
        "?page=protocol",
        "?page=docs&doc=reviewer-fast-path.md",
    ]) {
        assert(payload.queryRules.some((entry) => entry.query === query), `web next query strategy missing query: ${query}`);
    }
    const proposals = payload.queryRules.find((entry) => entry.query === "?page=proposals");
    const judge = payload.queryRules.find((entry) => entry.query === "?page=proof&judge=1");
    const docsViewer = payload.queryRules.find((entry) => entry.query === "?page=docs&doc=reviewer-fast-path.md");
    assert(proposals?.strategy === "map-to-next-route", "web next query strategy proposals rule mismatch");
    assert(judge?.strategy === "map-to-next-route", "web next query strategy judge rule mismatch");
    assert(judge?.nextTarget === "/proof/?judge=1", "web next query strategy judge target mismatch");
    assert(docsViewer?.strategy === "map-to-next-route", "web next query strategy docs viewer rule mismatch");
    assert(docsViewer?.nextTarget === "/documents/reviewer-fast-path/", "web next query strategy docs viewer target mismatch");
    const migrate = payload.queryRules.find((entry) => entry.query === "?page=migrate");
    const protocol = payload.queryRules.find((entry) => entry.query === "?page=protocol");
    assert(migrate?.strategy === "map-to-next-route", "web next query strategy migrate rule mismatch");
    assert(protocol?.strategy === "map-to-next-route", "web next query strategy protocol rule mismatch");
    for (const command of [
        "npm run build:web-next-query-strategy",
        "npm run verify:web-next-query-strategy",
        "npm run build:web-next-cutover-map",
        "npm run verify:web-next-cutover-map",
        "npm run web:verify:live:github",
    ]) {
        assert(payload.commands.includes(command), `web next query strategy missing command: ${command}`);
    }
    assert(payload.routingBoundary.includes("prefer curated document routes first and fall back to /viewer/ for broader markdown parity"), "web next query strategy missing documents/viewer boundary");
    for (const token of [
        "# Web Next Query Preservation Strategy",
        "### ?page=proof&judge=1",
        "- strategy: `map-to-next-route`",
        "### ?page=docs&doc=reviewer-fast-path.md",
        "- next target: `/documents/reviewer-fast-path/`",
    ]) {
        assert(markdown.includes(token), `web next query strategy markdown is missing: ${token}`);
    }
    console.log("Web next query strategy verification: PASS");
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
main();
