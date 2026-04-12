import type { Metadata } from "next";

import { defaultOgImage, siteDescription, siteKeywords, siteName } from "@/lib/site-brand";

type BuildRouteMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export function buildRouteMetadata({
  title,
  description,
  path,
  keywords = [],
}: BuildRouteMetadataInput): Metadata {
  const urlPath = path.startsWith("/") ? path : `/${path}`;
  const fullTitle = `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      ...siteKeywords,
      ...keywords,
    ],
    alternates: {
      canonical: urlPath,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: urlPath,
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
  };
}

export function buildBrandHomeMetadata(): Metadata {
  return {
    title: siteName,
    description: siteDescription,
    keywords: siteKeywords,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: siteName,
      description: siteDescription,
      siteName,
      type: "website",
      url: "/",
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: [defaultOgImage],
    },
    category: "technology",
    applicationName: siteName,
  };
}
