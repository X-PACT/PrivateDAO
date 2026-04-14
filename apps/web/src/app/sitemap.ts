import type { MetadataRoute } from "next";

import { getCuratedDocuments } from "@/lib/curated-documents";
import { siteUrl } from "@/lib/site-brand";

export const dynamic = "force-static";

const coreRoutes = [
  "",
  "/start",
  "/govern",
  "/live",
  "/trust",
  "/demo",
  "/services",
  "/command-center",
  "/proof",
  "/security",
  "/analytics",
  "/diagnostics",
  "/network",
  "/products",
  "/community",
  "/android",
  "/engage",
  "/documents",
  "/custody",
  "/awards",
  "/tracks",
  "/search",
  "/assistant",
  "/story",
  "/developers",
  "/dashboard",
  "/learn",
  "/intelligence",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const coreEntries: MetadataRoute.Sitemap = coreRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/start" || path === "/services" || path === "/proof" ? 0.9 : 0.7,
  }));

  const documentEntries: MetadataRoute.Sitemap = getCuratedDocuments().map((document) => ({
    url: `${siteUrl}/documents/${document.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: document.category === "Reviewer core" || document.category === "Trust" ? 0.8 : 0.6,
  }));

  return [...coreEntries, ...documentEntries];
}
