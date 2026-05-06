import { supportedLocales } from "@/lib/i18n";

export const siteName = "PrivateDAO";
export const siteNameArabic = "برايفيت داو";
export const siteNameArabicAlt = "برايفت داو";
export const siteTitle = "PrivateDAO | Private Financial OS for Solana DAOs";
export const siteDescription =
  "PrivateDAO is a wallet-first Solana financial OS for private governance, confidential treasury execution, local-first QVAC intelligence, live Testnet proof, and reviewer-visible trust packets.";
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
  "Anchor 1",
  "QVAC",
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
    inLanguage: supportedLocales.map((locale) => locale.code),
  };
}
