import type { Metadata } from "next";

const siteName = "PrivateDAO";
const defaultImage = "/opengraph-image.png";

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
      "PrivateDAO",
      "Solana governance",
      "confidential treasury",
      "private voting",
      "ZK",
      "REFHE",
      "MagicBlock",
      "Fast RPC",
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
          url: defaultImage,
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
      images: [defaultImage],
    },
  };
}
