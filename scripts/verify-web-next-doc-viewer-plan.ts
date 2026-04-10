import fs from "fs";
import path from "path";

type Payload = {
  project: string;
  status: string;
  currentCanonicalViewer: string;
  nextAppRoot: string;
  docClasses: Array<{
    tier: string;
    docs: string[];
    nextSurface: string;
    strategy: string;
    rationale: string;
  }>;
  nextStepPhases: string[];
  commands: string[];
  boundary: string[];
};

function main() {
  const jsonPath = path.resolve("docs/web-next-doc-viewer-plan.generated.json");
  const mdPath = path.resolve("docs/web-next-doc-viewer-plan.generated.md");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing web next doc viewer plan artifacts");
  }

  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Payload;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(payload.project === "PrivateDAO", "web next doc viewer plan project mismatch");
  assert(payload.status === "doc-viewer-parity-next-ready", "web next doc viewer plan status mismatch");
  assert(payload.currentCanonicalViewer === "docs/index.html?page=docs&doc=...", "web next doc viewer plan canonical viewer mismatch");
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
    "docs remains the canonical live surface until cutover is explicit",
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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
