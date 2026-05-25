#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const sourceRoots = ["apps/web/src", "apps/web/public", "docs", "README.md"];
const assetExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico", ".avif"]);
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".json", ".css", ".html"]);

function walk(entry, files = []) {
  if (!fs.existsSync(entry)) return files;
  const stat = fs.statSync(entry);
  if (stat.isFile()) {
    files.push(entry);
    return files;
  }
  for (const item of fs.readdirSync(entry, { withFileTypes: true })) {
    if ([".git", ".next", "dist", "node_modules", "out"].includes(item.name)) continue;
    walk(path.join(entry, item.name), files);
  }
  return files;
}

const files = sourceRoots.flatMap((entry) => walk(path.join(root, entry)));
const imageFiles = new Set(
  files
    .filter((file) => assetExtensions.has(path.extname(file).toLowerCase()))
    .map((file) => path.relative(root, file)),
);
const sourceFiles = files.filter((file) => textExtensions.has(path.extname(file).toLowerCase()));
const referencePatterns = [
  /["'`]([^"'`{}]+?\.(?:png|jpe?g|webp|svg|gif|ico|avif))(?:[?#][^"'`]*)?["'`]/gi,
  /url\(([^){}]+?\.(?:png|jpe?g|webp|svg|gif|ico|avif))(?:[?#][^)]*)?\)/gi,
];

const missing = [];
let referenceCount = 0;

for (const file of sourceFiles) {
  const relFile = path.relative(root, file);
  const body = fs.readFileSync(file, "utf8");
  for (const pattern of referencePatterns) {
    let match;
    while ((match = pattern.exec(body))) {
      const raw = match[1].trim().replace(/^["']|["']$/g, "");
      if (!raw || raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://")) continue;
      referenceCount += 1;
      const clean = raw.split("?")[0].split("#")[0];
      const candidates = clean.startsWith("/")
        ? [`apps/web/public${clean}`, clean.slice(1)]
        : [path.normalize(path.join(path.dirname(relFile), clean)), clean];
      const exists = candidates.some((candidate) => imageFiles.has(candidate) || fs.existsSync(path.join(root, candidate)));
      if (!exists) missing.push({ file: relFile, ref: raw, candidates });
    }
  }
}

const requiredPublicAssets = [
  "apps/web/public/favicon.ico",
  "apps/web/public/opengraph-image.png",
  "apps/web/public/twitter-image.png",
  "apps/web/public/assets/logo.png",
  "apps/web/public/assets/privatedao-social-card.png",
  "apps/web/public/assets/private-dao-judge-readiness-3min-poster.png",
];

for (const asset of requiredPublicAssets) {
  if (!fs.existsSync(path.join(root, asset))) missing.push({ file: "required-public-assets", ref: asset, candidates: [asset] });
}

if (missing.length > 0) {
  console.error(JSON.stringify({ ok: false, imageFiles: imageFiles.size, referenceCount, missing }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      imageFiles: imageFiles.size,
      referenceCount,
      requiredPublicAssets: requiredPublicAssets.length,
    },
    null,
    2,
  ),
);
