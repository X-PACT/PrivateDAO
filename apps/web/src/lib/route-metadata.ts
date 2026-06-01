import type { Metadata } from "next";

import { supportedLocales } from "@/lib/i18n";
import { defaultOgImage, siteDescription, siteKeywords, siteName, siteTitle } from "@/lib/site-brand";

type BuildRouteMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
};

export function buildRouteMetadata({
  title,
  description,
  path,
  keywords = [],
  index = true,
}: BuildRouteMetadataInput): Metadata {
  const urlPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalPath = urlPath === "/" ? "/" : `${urlPath.replace(/\/+$/, "")}/`;
  const fullTitle = `${title} | ${siteName}`;
  const languageCodes = supportedLocales.map((locale) => locale.code).join(", ");

  return {
    title: fullTitle,
    description,
    keywords: [
      ...siteKeywords,
      ...keywords,
    ],
    alternates: {
      canonical: canonicalPath,
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
          url: defaultOgImage,
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
      "ai-judge-summary": "/judge-ai",
      "product-surface":
        "PrivateDAO wallet-first Solana Testnet governance, private rooms, encrypted treasury, confidential payroll, intelligence, and proof routes.",
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
      "ai-judge-summary": "/judge-ai",
      "product-surface":
        "PrivateDAO is the operating system for everything that happens after governance on Solana: review, approve, execute, and audit with privacy.",
    },
  };
}
