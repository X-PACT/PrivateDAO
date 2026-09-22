#!/usr/bin/env node

const baseUrl = (process.argv[2] ?? "https://privatedao.org").replace(/\/+$/, "");

const routes = [
  "/",
  "/thesis/",
  "/whitepaper/",
  "/contact/",
  "/payroll/",
  "/treasury/",
  "/govern/",
  "/auctions/",
  "/proof-workflows/blind-policy/",
  "/products/record-verification/",
  "/token/",
  "/agents/",
  "/documents/",
];

const crawlers = {
  telegram: "TelegramBot (like TwitterBot)",
  x: "Twitterbot/1.0",
  discord: "Mozilla/5.0 Discordbot/2.0",
  linkedin: "LinkedInBot/1.0",
};

const requestTimeoutMs = Number(process.env.PRIVADAO_SOCIAL_PREVIEW_TIMEOUT_MS || 15_000);

function requestOptions(options = {}) {
  return { ...options, signal: AbortSignal.timeout(requestTimeoutMs) };
}

function meta(html, attribute, value) {
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}=["']${value}["'][^>]*>`, "i");
  const tag = html.match(pattern)?.[0] ?? "";
  return tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "";
}

function canonical(html) {
  const tags = [...html.matchAll(/<link\s+[^>]*>/gi)].map((match) => match[0]);
  const tag = tags.find((value) => /\brel=["']canonical["']/i.test(value));
  return tag?.match(/href=["']([^"']*)["']/i)?.[1] ?? "";
}

function absoluteUrl(value) {
  return new URL(value, baseUrl).toString();
}

async function fetchPage(route, userAgent) {
  const response = await fetch(`${baseUrl}${route}`, requestOptions({
    headers: { "user-agent": userAgent, accept: "text/html" },
  }));
  const html = await response.text();
  if (!response.ok) throw new Error(`${route} returned ${response.status}`);
  return { response, html };
}

async function verifyImage(url) {
  const response = await fetch(url, requestOptions({ method: "HEAD", redirect: "follow" }));
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || !type.startsWith("image/")) {
    throw new Error(`OG image ${url} returned ${response.status} ${type}`);
  }
}

const failures = [];
const imageUrls = new Set();
let checks = 0;

for (const [crawler, userAgent] of Object.entries(crawlers)) {
  for (const route of routes) {
    try {
      const { response, html } = await fetchPage(route, userAgent);
      const required = {
        "og:title": meta(html, "property", "og:title"),
        "og:description": meta(html, "property", "og:description"),
        "og:url": meta(html, "property", "og:url"),
        "og:image": meta(html, "property", "og:image"),
        "og:type": meta(html, "property", "og:type"),
        "twitter:card": meta(html, "name", "twitter:card"),
        "twitter:title": meta(html, "name", "twitter:title"),
        "twitter:description": meta(html, "name", "twitter:description"),
        "twitter:image": meta(html, "name", "twitter:image"),
        canonical: canonical(html),
      };
      for (const [name, value] of Object.entries(required)) {
        if (!value) failures.push({ crawler, route, issue: `missing ${name}` });
      }
      const cacheHeaders = ["etag", "last-modified", "cache-control"];
      if (!cacheHeaders.some((name) => response.headers.has(name))) {
        failures.push({ crawler, route, issue: "missing cache validator headers" });
      }
      for (const value of [required["og:image"], required["twitter:image"]]) {
        if (value) imageUrls.add(absoluteUrl(value));
      }
      checks += 1;
    } catch (error) {
      failures.push({ crawler, route, issue: error instanceof Error ? error.message : String(error) });
    }
  }
}

for (const imageUrl of imageUrls) {
  try {
    await verifyImage(imageUrl);
  } catch (error) {
    failures.push({ imageUrl, issue: error instanceof Error ? error.message : String(error) });
  }
}

const result = {
  schema: "privatedao.social-preview-verification.v1",
  baseUrl,
  crawlers: Object.keys(crawlers),
  routes: routes.length,
  pageChecks: checks,
  imagesChecked: imageUrls.size,
  requestTimeoutMs,
  platformCacheRefresh: "external-to-source-verification",
  ok: failures.length === 0,
  failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length > 0) process.exit(1);
