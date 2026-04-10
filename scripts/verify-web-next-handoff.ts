import fs from "fs";
import path from "path";

type Handoff = {
  project: string;
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
  requiredRoutes: Array<{
    route: string;
    exportPath: string;
    purpose: string;
  }>;
  parityDocs: string[];
  commands: string[];
  cutoverRule: string[];
};

function main() {
  const jsonPath = path.resolve("docs/web-next-handoff.generated.json");
  const mdPath = path.resolve("docs/web-next-handoff.generated.md");

  if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
    throw new Error("missing web next handoff artifacts");
  }

  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Handoff;
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(payload.project === "PrivateDAO", "web next handoff project mismatch");
  assert(payload.status === "staged-not-live", "web next handoff must remain staged-not-live");
  assert(payload.currentLiveSurface === "docs/index.html", "web next handoff must preserve docs/index.html as the live surface");
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
    "npm run build:web-next-handoff",
    "npm run verify:web-next-handoff",
  ]) {
    assert(payload.commands.includes(command), `web next handoff missing command: ${command}`);
  }

  for (const token of [
    "# Web Next Handoff Manifest",
    "current live surface: `docs/index.html`",
    "docs remains the canonical live reviewer-facing surface until explicit cutover.",
    "`/proof/` -> `proof/index.html`",
    "`/documents/` -> `documents/index.html`",
    "`/viewer/` -> `viewer/index.html`",
    "`/services/` -> `services/index.html`",
    "`npm run web:verify:bundle:github`",
  ]) {
    assert(markdown.includes(token), `web next handoff markdown is missing: ${token}`);
  }

  console.log("Web next handoff verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

main();
