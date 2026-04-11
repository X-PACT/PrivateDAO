import fs from "node:fs";
import path from "node:path";

export type EcosystemFocusArea = {
  slug: string;
  title: string;
  fit: "strong" | "moderate" | "selective";
  whatWorksNow: string;
  whyItMatters: string;
  exactGap: string;
  bestRoutes: string[];
};

type EcosystemFocusPayload = {
  generatedAt: string;
  title: string;
  summary: string;
  focusAreas: EcosystemFocusArea[];
};

function readJson<T>(relativePath: string): T {
  const filePath = path.resolve(process.cwd(), "..", "..", relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function getEcosystemFocusAlignment() {
  return readJson<EcosystemFocusPayload>("docs/ecosystem-focus-alignment.generated.json");
}
