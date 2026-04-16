export const siteName = "PrivateDAO";
export const siteNameArabic = "برايفيت داو";
export const siteNameArabicAlt = "برايفت داو";
export const siteTitle = "PrivateDAO | Private Governance, Confidential Treasury, and Solana Runtime Trust";
export const siteDescription =
  "PrivateDAO is a Solana public-good governance and treasury platform for private voting, confidential payouts, live proof, reviewer-visible trust packets, and operator-grade runtime evidence.";
export const siteUrl = process.env.NEXT_PUBLIC_LIVE_SITE_URL?.replace(/\/+$/, "") ?? "https://privatedao.org";
export const defaultOgImage = "/opengraph-image.png";

export const siteKeywords = [
  "PrivateDAO",
  "Private DAO",
  "برايفيت داو",
  "برايفت داو",
  "حوكمة خاصة",
  "خزانة سرية",
  "private governance",
  "confidential treasury",
  "private voting",
  "Solana governance",
  "Solana treasury",
  "Token-2022",
  "MagicBlock",
  "REFHE",
  "ZK",
  "Fast RPC",
];

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: [siteNameArabic, siteNameArabicAlt, "Private DAO"],
    url: siteUrl,
    logo: `${siteUrl}/assets/logo.png`,
    sameAs: [
      "https://github.com/X-PACT/PrivateDAO",
      "https://www.youtube.com/@privatedao",
      "https://discord.gg/PbM8BC2A",
      "https://x.com/FahdX369",
    ],
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: [siteNameArabic, siteNameArabicAlt, "Private DAO"],
    url: siteUrl,
    inLanguage: ["en", "ar"],
  };
}
