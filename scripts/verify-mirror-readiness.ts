import fs from "fs";
import path from "path";

const ROOT_INDEX = path.resolve("index.html");
const WEB_CONFIG = path.resolve("apps/web/next.config.ts");
const SITE_URLS = path.resolve("apps/web/src/lib/site-urls.ts");
const README = path.resolve("README.md");
const DOMAIN_MIRROR = path.resolve("docs/domain-mirror.md");
const CUTOVER_CHECKLIST = path.resolve("docs/xyz-mirror-cutover-checklist.md");

function main() {
  const rootIndex = fs.readFileSync(ROOT_INDEX, "utf8");
  const webConfig = fs.readFileSync(WEB_CONFIG, "utf8");
  const siteUrls = fs.readFileSync(SITE_URLS, "utf8");
  const readme = fs.readFileSync(README, "utf8");
  const domainMirror = fs.readFileSync(DOMAIN_MIRROR, "utf8");
  const cutoverChecklist = fs.readFileSync(CUTOVER_CHECKLIST, "utf8");

  assertContains(rootIndex, "/_next/static/", "Root live surface is missing the canonical Next.js asset path.");
  assertContains(webConfig, 'output: "export"', "Next config lost static export mode.");
  assertContains(webConfig, "trailingSlash: true", "Next config lost trailing slash support.");
  assertContains(webConfig, "basePath", "Next config lost basePath support.");
  assertContains(siteUrls, "buildJudgeViewUrl", "site URLs helper is missing judge URL support.");
  assertContains(siteUrls, "/judge/", "site URLs helper is missing the canonical judge route.");

  assertContains(domainMirror, "Application-Layer Hardening Already Applied", "Domain mirror strategy is missing app-layer hardening section.");
  assertContains(cutoverChecklist, "https://privatedao.org/", "Cutover checklist is missing the canonical production target.");
  assertContains(cutoverChecklist, "/proof/?judge=1", "Cutover checklist is missing proof view validation.");
  assertContains(cutoverChecklist, "/diagnostics/", "Cutover checklist is missing diagnostics validation.");

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
