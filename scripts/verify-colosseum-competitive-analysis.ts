import fs from "fs";
import path from "path";

function main() {
  const sourcePath = path.resolve("docs/colosseum-competitive-source.json");
  const jsonPath = path.resolve("docs/colosseum-competitive-analysis.generated.json");
  const mdPath = path.resolve("docs/colosseum-competitive-analysis.generated.md");

  assert(fs.existsSync(sourcePath), "missing Colosseum competitive source snapshot");
  assert(fs.existsSync(jsonPath), "missing generated Colosseum competitive analysis JSON");
  assert(fs.existsSync(mdPath), "missing generated Colosseum competitive analysis markdown");

  const json = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
    project: string;
    overview: {
      generalResultCount: number;
      acceleratorResultCount: number;
      winnerResultCount: number;
      archiveResultCount: number;
    };
    generalProjects: Array<{ slug: string }>;
    acceleratorProjects: Array<{ slug: string }>;
    winnerProjects: Array<{ slug: string }>;
    archives: Array<{ title: string }>;
    recommendedTracks: Array<{ track: string }>;
    differentiation: string[];
    honestBoundary: string[];
  };
  const markdown = fs.readFileSync(mdPath, "utf8");

  assert(json.project === "PrivateDAO", "competitive analysis project mismatch");
  assert(json.overview.generalResultCount >= 1, "competitive analysis general result count is too low");
  assert(json.overview.archiveResultCount >= 1, "competitive analysis archive result count is too low");
  assert(json.generalProjects.some((entry) => entry.slug === "privment"), "competitive analysis missing privment reference");
  assert(json.generalProjects.some((entry) => entry.slug === "privatevote-dao"), "competitive analysis missing privatevote-dao reference");
  assert(json.winnerProjects.some((entry) => entry.slug === "cloak-or-solana-privacy-layer"), "competitive analysis missing Cloak winner reference");
  assert(json.recommendedTracks.some((entry) => entry.track === "RPC Fast"), "competitive analysis missing RPC Fast recommendation");
  assert(json.recommendedTracks.some((entry) => entry.track === "MagicBlock Privacy"), "competitive analysis missing MagicBlock recommendation");
  assert(json.differentiation.length >= 3, "competitive analysis differentiation is too thin");
  assert(json.honestBoundary.length >= 3, "competitive analysis honest boundary is too thin");
  assert(markdown.includes("# Colosseum Competitive Analysis"), "competitive analysis markdown missing title");
  assert(markdown.includes("General Comparables"), "competitive analysis markdown missing comparables section");
  assert(markdown.includes("Archive Framing"), "competitive analysis markdown missing archive section");
  assert(markdown.includes("Recommended Tracks"), "competitive analysis markdown missing track section");
  assert(markdown.includes("Differentiation"), "competitive analysis markdown missing differentiation section");
  assert(markdown.includes("Honest Boundary"), "competitive analysis markdown missing honest boundary section");

  console.log("Colosseum competitive analysis verification: PASS");
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

main();
