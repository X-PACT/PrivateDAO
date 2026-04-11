import fs from "node:fs";
import path from "node:path";

type FocusPayload = {
  generatedAt: string;
  title: string;
  summary: string;
  focusAreas: Array<{
    slug: string;
    title: string;
    fit: string;
    bestRoutes: string[];
  }>;
};

const repoRoot = path.resolve(__dirname, "..");
const jsonPath = path.join(repoRoot, "docs", "ecosystem-focus-alignment.generated.json");
const mdPath = path.join(repoRoot, "docs", "ecosystem-focus-alignment.generated.md");

if (!fs.existsSync(jsonPath) || !fs.existsSync(mdPath)) {
  throw new Error("Missing ecosystem focus alignment generated artifacts");
}

const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as FocusPayload;
const markdown = fs.readFileSync(mdPath, "utf8");

if (!payload.generatedAt || !payload.title || !payload.summary) {
  throw new Error("Invalid ecosystem focus payload metadata");
}

if (payload.focusAreas.length < 7) {
  throw new Error("Expected at least 7 ecosystem focus areas");
}

for (const area of payload.focusAreas) {
  if (!area.slug || !area.title || !area.fit || area.bestRoutes.length === 0) {
    throw new Error(`Invalid ecosystem focus area: ${area.slug || area.title || "unknown"}`);
  }
  if (!markdown.includes(`## ${area.title}`)) {
    throw new Error(`Missing markdown section for ${area.title}`);
  }
}

console.log("ecosystem-focus-alignment: ok");
