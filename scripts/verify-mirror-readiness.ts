import fs from "fs";
import path from "path";

const ROOT_INDEX = path.resolve("index.html");
const FRONTEND = path.resolve("docs/index.html");
const README = path.resolve("README.md");
const DOMAIN_MIRROR = path.resolve("docs/domain-mirror.md");
const CUTOVER_CHECKLIST = path.resolve("docs/xyz-mirror-cutover-checklist.md");

function main() {
  const rootIndex = fs.readFileSync(ROOT_INDEX, "utf8");
  const frontend = fs.readFileSync(FRONTEND, "utf8");
  const readme = fs.readFileSync(README, "utf8");
  const domainMirror = fs.readFileSync(DOMAIN_MIRROR, "utf8");
  const cutoverChecklist = fs.readFileSync(CUTOVER_CHECKLIST, "utf8");

  assertContains(rootIndex, "window.location.replace(target);", "Root entry no longer preserves redirect through scripted replace.");
  assertContains(rootIndex, "window.location.search || ''", "Root entry no longer preserves query parameters.");
  assertContains(rootIndex, "window.location.hash || ''", "Root entry no longer preserves hash fragments.");

  assertContains(frontend, 'id="canonicalLink"', "Frontend is missing canonical link handle for mirror-safe updates.");
  assertContains(frontend, 'id="ogUrlMeta"', "Frontend is missing OG URL handle for mirror-safe updates.");
  assertContains(frontend, 'id="twitterUrlMeta"', "Frontend is missing Twitter URL handle for mirror-safe updates.");
  assertContains(frontend, "function getAppBaseUrl()", "Frontend is missing active-origin helper.");
  assertContains(frontend, "function getAbsoluteDocUrl(path)", "Frontend is missing doc URL helper.");
  assertContains(frontend, "function syncPublicUrlMetadata()", "Frontend is missing public URL metadata synchronizer.");
  assertContains(frontend, "syncPublicUrlMetadata();", "Frontend does not sync public URL metadata on load.");
  assertContains(frontend, 'href="./"', "Frontend lost the mirror-safe app home link.");

  assertContains(domainMirror, "Application-Layer Hardening Already Applied", "Domain mirror strategy is missing app-layer hardening section.");
  assertContains(cutoverChecklist, "app.privatedao.xyz", "Cutover checklist is missing the `.xyz` mirror target.");
  assertContains(cutoverChecklist, "?page=proof&judge=1", "Cutover checklist is missing proof view validation.");
  assertContains(cutoverChecklist, "?page=diagnostics", "Cutover checklist is missing diagnostics validation.");

  assertContains(readme, "docs/domain-mirror.md", "README is missing domain mirror strategy link.");
  assertContains(readme, "docs/xyz-mirror-cutover-checklist.md", "README is missing xyz mirror checklist link.");

  console.log("Mirror readiness verification: PASS");
}

function assertContains(body: string, fragment: string, message: string) {
  if (!body.includes(fragment)) {
    throw new Error(message);
  }
}

main();
