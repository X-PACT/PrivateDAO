import { supportedLocales } from "@/lib/i18n";

export const siteName = "PrivateDAO";
export const siteTitle = "PrivateDAO - Private Decisions. Verifiable Outcomes.";
export const siteDescription =
  "PrivateDAO helps organizations verify sensitive records, govern privately, and coordinate treasury work with evidence others can trust.";
export const siteUrl = process.env.NEXT_PUBLIC_LIVE_SITE_URL?.replace(/\/+$/, "") ?? "https://privatedao.org";
export const defaultOgImage = `${siteUrl}/assets/privatedao-social-card.png?v=20260820-brand-card`;

export const siteKeywords = [
  "PrivateDAO",
  "Private DAO",
  "private decision platform",
  "verifiable records",
  "proof workflows",
  "private decisions",
  "verifiable outcomes",
  "audit-ready workflow",
  "private governance",
  "treasury coordination",
  "confidential coordination infrastructure",
  "public receipt verification",
  "evidence packages",
  "policy-based claims",
  "reviews and approvals",
  "review committees",
  "vendor reviews",
  "confidential treasury",
  "confidential treasury request",
  "treasury policy",
  "API integration",
  "SDK integration",
  "organization workflows",
  "on-chain verification",
  "حوكمة خاصة",
  "تصويت خاص",
  "خزينة مشفرة",
  "برايفيت داو",
];

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: ["Private DAO"],
    url: siteUrl,
    logo: `${siteUrl}/assets/logo.png`,
    sameAs: [
      "https://github.com/X-PACT/PrivateDAO",
      "https://www.youtube.com/@privatedao",
      "https://discord.gg/GjJykUtTTt",
      "https://discord.gg/dpD5c7Gfcc",
      "https://discord.gg/PRcD9nFeVf",
      "https://x.com/privateDAOOS",
      "https://t.me/privateDAOOS",
      "https://t.me/PrivateDAOO",
      "https://t.me/Fahdkotb",
    ],
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: ["Private DAO"],
    url: siteUrl,
    inLanguage: supportedLocales.map((locale) => locale.code),
    keywords: siteKeywords,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    alternateName: ["Private DAO", "PrivateDAO Solana"],
    url: siteUrl,
    codeRepository: "https://github.com/X-PACT/PrivateDAO",
    applicationCategory: "Organizational Workflow Verification Software",
    operatingSystem: "Web, Android",
    description:
      "PrivateDAO helps organizations make private decisions, coordinate treasury actions, and prove operational workflows without exposing sensitive data.",
    copyrightYear: 2026,
    copyrightHolder: {
      "@type": "Person",
      name: "Fahd Kotb / Eslam Kotb",
    },
    creator: {
      "@type": "Person",
      name: "Fahd Kotb",
    },
    maintainer: {
      "@type": "Organization",
      name: "X-PACT",
      url: "https://github.com/X-PACT",
    },
    license: "https://github.com/X-PACT/PrivateDAO/blob/main/LICENSE",
    keywords: siteKeywords.join(", "),
    softwareHelp: `${siteUrl}/learn/`,
    featureList: [
      "Record Verification for critical records and public receipts",
      "Proof Workflows for private claims and approvals",
      "Private Governance for proposals, rooms, and organizational decisions",
      "Treasury Coordination for requests, approvals, and evidence",
      "API and SDK integration surfaces",
      "Walletless public receipt verification",
    ],
    sameAs: [
      "https://github.com/X-PACT/PrivateDAO",
      "https://x.com/privateDAOOS",
      "https://www.youtube.com/@privatedao",
      "https://discord.gg/GjJykUtTTt",
      "https://discord.gg/dpD5c7Gfcc",
      "https://discord.gg/PRcD9nFeVf",
      "https://t.me/privateDAOOS",
      "https://t.me/PrivateDAOO",
      "https://t.me/Fahdkotb",
    ],
  };
}
