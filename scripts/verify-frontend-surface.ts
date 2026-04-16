import fs from "fs";
import path from "path";

const ROOT_INDEX = path.resolve("index.html");
const HOME_SHELL = path.resolve("apps/web/src/components/home-shell.tsx");
const SITE_HEADER = path.resolve("apps/web/src/components/site-header.tsx");
const COMMAND_CENTER = path.resolve("apps/web/src/components/command-center.tsx");
const PROOF_CENTER = path.resolve("apps/web/src/components/proof-center.tsx");
const SECURITY_CENTER = path.resolve("apps/web/src/components/security-center.tsx");
const DIAGNOSTICS_CENTER = path.resolve("apps/web/src/components/diagnostics-center.tsx");
const SERVICES_SURFACE = path.resolve("apps/web/src/components/services-surface.tsx");
const CURATED_DOCUMENTS = path.resolve("apps/web/src/lib/curated-documents.ts");
const SITE_DATA = path.resolve("apps/web/src/lib/site-data.ts");
const SITE_FOOTER = path.resolve("apps/web/src/components/site-footer.tsx");

function main() {
  const rootIndex = fs.readFileSync(ROOT_INDEX, "utf8");
  const homeShell = fs.readFileSync(HOME_SHELL, "utf8");
  const siteHeader = fs.readFileSync(SITE_HEADER, "utf8");
  const commandCenter = fs.readFileSync(COMMAND_CENTER, "utf8");
  const proofCenter = fs.readFileSync(PROOF_CENTER, "utf8");
  const securityCenter = fs.readFileSync(SECURITY_CENTER, "utf8");
  const diagnosticsCenter = fs.readFileSync(DIAGNOSTICS_CENTER, "utf8");
  const servicesSurface = fs.readFileSync(SERVICES_SURFACE, "utf8");
  const curatedDocuments = fs.readFileSync(CURATED_DOCUMENTS, "utf8");
  const siteData = fs.readFileSync(SITE_DATA, "utf8");
  const siteFooter = fs.readFileSync(SITE_FOOTER, "utf8");

  if (!homeShell.includes("Superteam Poland") && !homeShell.includes('eyebrow="Why PrivateDAO"')) {
    throw new Error("home shell is missing the achievement surface for Superteam Poland");
  }

  const checks: Array<[string, string, string]> = [
    [rootIndex, "__next_f.push", "root live surface is missing the exported Next.js app payload"],
    [siteHeader, 'href: "/documents"', "site header is missing the Documents route"],
    [siteHeader, 'href: "/learn"', "site header is missing the Learn route"],
    [siteHeader, 'href: "/story"', "site header is missing the Story route"],
    [siteHeader, 'href: "/community"', "site header is missing the Community route"],
    [siteHeader, 'href: "/products"', "site header is missing the Products route"],
    [siteHeader, 'href: "/network"', "site header is missing the Network route"],
    [homeShell, "Private governance on Solana", "home shell is missing the Solana product badge"],
    [homeShell, "ZK + REFHE + MagicBlock + Fast RPC", "home shell is missing the integrated tech badge"],
    [homeShell, "Open judge proof view", "home shell is missing the judge CTA"],
    [homeShell, "Why PrivateDAO", "home shell is missing the Solana-style value section"],
    [homeShell, "A single upload-ready reel that explains everything we offer", "home shell is missing the hosted story video section"],
    [homeShell, "Open the exact PrivateDAO surface you need without scrolling through a long landing page", "home shell is missing the focused route-entry narrative"],
    [commandCenter, "Command Center", "command center surface is missing"],
    [proofCenter, "Proof center", "proof center surface is missing"],
    [securityCenter, "Security architecture", "security center surface is missing"],
    [diagnosticsCenter, "Operational diagnostics", "diagnostics center surface is missing"],
    [servicesSurface, "Commercial services", "services surface is missing"],
    [siteData, "Governance Hardening V3", "site data is missing Governance V3"],
    [siteData, "Settlement Hardening V3", "site data is missing Settlement V3"],
    [siteData, "Frontier integrations", "site data is missing Frontier integrations"],
    [siteData, "Pilot Program", "site data is missing the Pilot Program surface"],
    [siteData, "Pricing Model", "site data is missing the Pricing Model surface"],
    [siteData, "REFHE", "site data is missing REFHE"],
    [siteData, "MagicBlock", "site data is missing MagicBlock"],
    [siteData, "Fast RPC", "site data is missing Fast RPC"],
    [siteData, "https://www.youtube.com/@privatedao", "site data is missing the official YouTube channel"],
    [curatedDocuments, 'slug: "reviewer-fast-path"', "curated documents are missing reviewer-fast-path"],
    [curatedDocuments, 'slug: "audit-packet"', "curated documents are missing the audit packet"],
    [curatedDocuments, 'slug: "live-proof-v3"', "curated documents are missing live proof V3"],
    [curatedDocuments, 'slug: "trust-package"', "curated documents are missing trust package"],
    [curatedDocuments, 'slug: "service-catalog"', "curated documents are missing service catalog"],
    [curatedDocuments, 'slug: "frontier-integrations"', "curated documents are missing frontier integrations"],
    [siteFooter, "https://discord.gg/PbM8BC2A", "site footer is missing the Discord server link"],
    [siteFooter, "https://www.youtube.com/@privatedao", "site footer is missing the YouTube channel"],
  ];

  const hasGithubPagesPrefix = rootIndex.includes("/PrivateDAO/_next/");
  const hasRootDomainPrefix = rootIndex.includes("/_next/");
  if (!hasGithubPagesPrefix && !hasRootDomainPrefix) {
    throw new Error("root live surface is missing both root-domain and GitHub Pages Next asset prefixes");
  }

  for (const [body, fragment, message] of checks) {
    if (!body.includes(fragment)) {
      throw new Error(message);
    }
  }

  console.log("Frontend surface verification: PASS");
}

main();
