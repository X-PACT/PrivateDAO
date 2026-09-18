import type { Metadata } from "next";

import { supportedLocales } from "@/lib/i18n";
import { defaultOgImage, siteDescription, siteKeywords, siteName, siteTitle } from "@/lib/site-brand";

type BuildRouteMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
  image?: string;
};

const productOgImages: Record<string, string> = {
  "/payroll": "/assets/social/payroll.png",
  "/treasury": "/assets/social/treasury.png",
  "/govern": "/assets/social/governance.png",
  "/auctions": "/assets/social/auctions.png",
  "/proof-workflows": "/assets/social/verification.png",
  "/proof-workflows/blind-policy": "/assets/social/verification.png",
  "/products/record-verification": "/assets/record-verification-og.png",
  "/thesis": "/assets/social/thesis.png",
  "/whitepaper": "/assets/social/whitepaper.png",
  "/investors": "/assets/social/investors.png",
  "/token": "/assets/social/pdao.png",
};

export function buildRouteMetadata({
  title,
  description,
  path,
  keywords = [],
  index = true,
  image,
}: BuildRouteMetadataInput): Metadata {
  const urlPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalPath = urlPath === "/" ? "/" : `${urlPath.replace(/\/+$/, "")}/`;
  const fullTitle = `${title} | ${siteName}`;
  const languageCodes = supportedLocales.map((locale) => locale.code).join(", ");
  const socialImage = image ?? productOgImages[urlPath] ?? defaultOgImage;

  return {
    title: fullTitle,
    description,
    keywords: [
      ...siteKeywords,
      ...keywords,
    ],
    alternates: {
      canonical: canonicalPath,
      languages: Object.fromEntries(
        supportedLocales.map((locale) => [locale.code, `${canonicalPath}?lang=${locale.code}`]),
      ),
    },
    robots: index
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: true,
        },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalPath,
      siteName,
      type: "website",
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [socialImage],
    },
    category: "technology",
    applicationName: siteName,
    other: {
      "content-language": languageCodes,
      "ai-crawl": "allowed",
      "llms-txt": "/llms.txt",
      "llms-full": "/llms-full.txt",
      "ai-manifest": "/ai.json",
      "evidence-manifest": "/evidence.json",
      "ownership-manifest": "/ownership.json",
      "rights-notice": "/rights.txt",
      "ai-guide-summary": "/judge-ai",
      "product-surface":
        "PrivateDAO sells Proof Workflows, Private Governance, and Treasury Coordination for organizations that need private decisions and verifiable outcomes.",
    },
  };
}

export function buildBrandHomeMetadata(): Metadata {
  const languageCodes = supportedLocales.map((locale) => locale.code).join(", ");

  return {
    title: siteTitle,
    description: siteDescription,
    keywords: siteKeywords,
    alternates: {
      canonical: "/",
      languages: Object.fromEntries(
        supportedLocales.map((locale) => [locale.code, `/?lang=${locale.code}`]),
      ),
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      siteName,
      type: "website",
      url: "/",
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [defaultOgImage],
    },
    category: "technology",
    applicationName: siteName,
    other: {
      "content-language": languageCodes,
      "ai-crawl": "allowed",
      "llms-txt": "/llms.txt",
      "ai-manifest": "/ai.json",
      "evidence-manifest": "/evidence.json",
      "ownership-manifest": "/ownership.json",
      "rights-notice": "/rights.txt",
      "ai-guide-summary": "/judge-ai",
      "product-surface":
        "PrivateDAO helps organizations prove workflows, make private decisions, and coordinate treasury approvals without exposing sensitive data.",
    },
  };
}
