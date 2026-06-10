import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-brand";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/llms.txt",
          "/ai.json",
          "/evidence.json",
          "/ownership.json",
          "/rights.txt",
          "/judge-ai",
          "/proof/",
          "/judge",
          "/judges",
          "/deck",
          "/investors",
          "/thesis",
          "/legal",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).host,
  };
}
