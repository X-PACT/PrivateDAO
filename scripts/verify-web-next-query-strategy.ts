import fs from "fs";
import path from "path";

type Payload = {
  project: string;
  status: string;
  currentLiveSurface: string;
  nextSurfaceRoot: string;
  queryRules: Array<{
    query: string;
    currentBehavior: string;
    nextTarget: string;
    strategy: string;
    note: string;
  }>;
  commands: string[];
  routingBoundary: string[];
};

function main() {
  const jsonPath = path.resolve("docs/web-next-query-strategy.generated.json");
  const mdPath = path.resolve("docs/web-next-query-strategy.generated.md");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing web next query strategy artifacts");
  }

  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Payload;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(payload.project === "PrivateDAO", "web next query strategy project mismatch");
  assert(payload.status === "query-strategy-staged", "web next query strategy status mismatch");
  assert(payload.currentLiveSurface === "docs/index.html", "web next query strategy must preserve docs as live surface");
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
  assert(judge?.strategy === "preserve-on-docs", "web next query strategy judge rule mismatch");
  assert(docsViewer?.strategy === "defer-until-doc-viewer", "web next query strategy docs viewer rule mismatch");

  for (const command of [
    "npm run build:web-next-query-strategy",
    "npm run verify:web-next-query-strategy",
    "npm run build:web-next-cutover-map",
    "npm run verify:web-next-cutover-map",
  ]) {
    assert(payload.commands.includes(command), `web next query strategy missing command: ${command}`);
  }

  for (const boundary of [
    "do not rewrite docs query entrypoints in-place while docs remains canonical",
    "only map low-risk page routes to apps/web during mirror staging",
    "leave judge-mode and docs-viewer flows on docs until route-specific parity is explicit",
  ]) {
    assert(payload.routingBoundary.includes(boundary), `web next query strategy missing boundary: ${boundary}`);
  }

  for (const token of [
    "# Web Next Query Preservation Strategy",
    "### ?page=proof&judge=1",
    "- strategy: `preserve-on-docs`",
    "### ?page=docs&doc=reviewer-fast-path.md",
    "- strategy: `defer-until-doc-viewer`",
  ]) {
    assert(markdown.includes(token), `web next query strategy markdown is missing: ${token}`);
  }

  console.log("Web next query strategy verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
