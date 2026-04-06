import fs from "fs";
import path from "path";

type ProjectResult = {
  slug: string;
  name: string;
  oneLiner: string | null;
  similarity: number;
  hackathon?: {
    name: string;
    slug: string;
    startDate?: string;
  } | null;
  prize?: {
    name?: string | null;
    placement?: number | null;
    amount?: number | null;
    trackName?: string | null;
  } | null;
  accelerator?: {
    companySlug?: string | null;
    companyName?: string | null;
    batchName?: string | null;
  } | null;
  tags?: {
    problemTags?: string[];
    solutionTags?: string[];
    primitives?: string[];
    techStack?: string[];
    targetUsers?: string[];
  } | null;
};

type ArchiveResult = {
  documentId: string;
  title: string;
  author?: string | null;
  source?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  similarity: number;
  snippet?: string | null;
};

type CompetitiveSource = {
  project: string;
  generatedAt: string;
  apiBase: string;
  queries: {
    generalProjects: string;
    acceleratorProjects: string;
    winnerProjects: string;
    archives: string;
  };
  filters: {
    hackathons?: Array<{
      slug: string;
      name: string;
      startDate: string;
      projectCount: number;
      winnerCount: number;
    }>;
  };
  generalProjects: ProjectResult[];
  acceleratorProjects: ProjectResult[];
  winnerProjects: ProjectResult[];
  archives: ArchiveResult[];
};

function main() {
  const source = readJson<CompetitiveSource>("docs/colosseum-competitive-source.json");
  const generatedAt = new Date().toISOString();
  const overview = buildOverview(source);

  const payload = {
    project: source.project,
    generatedAt,
    sourceGeneratedAt: source.generatedAt,
    apiBase: source.apiBase,
    queries: source.queries,
    overview,
    generalProjects: source.generalProjects.slice(0, 5),
    acceleratorProjects: source.acceleratorProjects.slice(0, 5),
    winnerProjects: source.winnerProjects.slice(0, 5),
    archives: source.archives.slice(0, 5),
    recommendedTracks: [
      {
        track: "100xDevs",
        rationale: "Strong execution, complete product surface, and real Solana utility fit this open-ended builder-first track.",
      },
      {
        track: "RPC Fast",
        rationale: "PrivateDAO is read-heavy and operationally sensitive, so reliable low-latency RPC and backend indexing materially improve UX and reviewer trust.",
      },
      {
        track: "MagicBlock Privacy",
        rationale: "MagicBlock private payment corridors now gate confidential token payouts, making privacy execution part of the actual treasury boundary rather than a future idea.",
      },
      {
        track: "Encrypt",
        rationale: "REFHE and encrypted payout orchestration align with confidential capital market narratives better than generic private-wallet positioning.",
      },
    ],
    differentiation: [
      "PrivateDAO is not only a privacy primitive. It joins private governance, confidential payroll, treasury release, runtime evidence, and reviewer-visible operator flows in one product.",
      "Comparable governance projects emphasize anonymous voting or workflow automation, while payment privacy projects emphasize invoices or privacy pools. PrivateDAO bridges both into organizational operations.",
      "The repo exposes a live frontend, Anchor program, backend read node, generated manifests, and submission-ready review artifacts instead of relying on a single demo narrative.",
    ],
    honestBoundary: [
      "As of 2026-04-06, PrivateDAO is strongest where privacy, governance discipline, and operational reviewability intersect.",
      "It is less comparable to trading-focused privacy systems than to governance or treasury operating systems with confidential execution paths.",
      "Some remaining mainnet steps still require external runtime captures and audit closure, and the analysis does not overstate those as solved.",
    ],
  };

  fs.writeFileSync(path.resolve("docs/colosseum-competitive-analysis.generated.json"), JSON.stringify(payload, null, 2) + "\n");
  fs.writeFileSync(path.resolve("docs/colosseum-competitive-analysis.generated.md"), buildMarkdown(payload));
  console.log("Wrote Colosseum competitive analysis");
}

function buildOverview(source: CompetitiveSource) {
  const latestHackathon = (source.filters.hackathons || []).slice(-1)[0] || null;
  const preferredArchive = source.archives.find((archive) => !/arrow-up-right|hashtag|circle-info/i.test(archive.title))
    || source.archives[0]
    || null;
  return {
    generalResultCount: source.generalProjects.length,
    acceleratorResultCount: source.acceleratorProjects.length,
    winnerResultCount: source.winnerProjects.length,
    archiveResultCount: source.archives.length,
    latestHackathon: latestHackathon
      ? `${latestHackathon.name} (${latestHackathon.startDate})`
      : "unknown",
    strongestComparableSlug: source.generalProjects[0]?.slug || null,
    strongestWinnerSlug: source.winnerProjects[0]?.slug || null,
    strongestArchiveTitle: preferredArchive?.title || null,
  };
}

function buildMarkdown(payload: {
  project: string;
  generatedAt: string;
  sourceGeneratedAt: string;
  apiBase: string;
  queries: CompetitiveSource["queries"];
  overview: {
    generalResultCount: number;
    acceleratorResultCount: number;
    winnerResultCount: number;
    archiveResultCount: number;
    latestHackathon: string;
    strongestComparableSlug: string | null;
    strongestWinnerSlug: string | null;
    strongestArchiveTitle: string | null;
  };
  generalProjects: ProjectResult[];
  acceleratorProjects: ProjectResult[];
  winnerProjects: ProjectResult[];
  archives: ArchiveResult[];
  recommendedTracks: Array<{ track: string; rationale: string }>;
  differentiation: string[];
  honestBoundary: string[];
}) {
  return `# Colosseum Competitive Analysis

## Overview

- project: \`${payload.project}\`
- generated at: \`${payload.generatedAt}\`
- source snapshot: \`${payload.sourceGeneratedAt}\`
- API base: \`${payload.apiBase}\`
- general result count: \`${payload.overview.generalResultCount}\`
- accelerator result count: \`${payload.overview.acceleratorResultCount}\`
- winner result count: \`${payload.overview.winnerResultCount}\`
- archive result count: \`${payload.overview.archiveResultCount}\`
- latest indexed hackathon in the filters snapshot: \`${payload.overview.latestHackathon}\`
- strongest comparable slug: \`${payload.overview.strongestComparableSlug || "none"}\`
- strongest winner slug: \`${payload.overview.strongestWinnerSlug || "none"}\`
- strongest archive title: \`${payload.overview.strongestArchiveTitle || "none"}\`

## General Comparables

${payload.generalProjects.map((project) => formatProject(project)).join("\n")}

## Accelerator Comparables

${payload.acceleratorProjects.length
    ? payload.acceleratorProjects.map((project) => formatProject(project)).join("\n")
    : "- none returned from the accelerator-filtered query snapshot"}

## Winner Comparables

${payload.winnerProjects.length
    ? payload.winnerProjects.map((project) => formatProject(project)).join("\n")
    : "- none returned from the winners-filtered query snapshot"}

## Archive Framing

${payload.archives.map((archive) => formatArchive(archive)).join("\n")}

## Recommended Tracks

${payload.recommendedTracks.map((entry) => `- ${entry.track}: ${entry.rationale}`).join("\n")}

## Differentiation

${payload.differentiation.map((entry) => `- ${entry}`).join("\n")}

## Honest Boundary

${payload.honestBoundary.map((entry) => `- ${entry}`).join("\n")}

## Query Record

- general projects: \`${payload.queries.generalProjects}\`
- accelerator projects: \`${payload.queries.acceleratorProjects}\`
- winner projects: \`${payload.queries.winnerProjects}\`
- archives: \`${payload.queries.archives}\`
`;
}

function formatProject(project: ProjectResult): string {
  const hackathon = project.hackathon?.name && project.hackathon?.startDate
    ? `${project.hackathon.name} (${project.hackathon.startDate})`
    : (project.hackathon?.name || "unknown hackathon");
  const prize = project.prize?.name
    ? `${project.prize.name}${project.prize.trackName ? ` · ${project.prize.trackName}` : ""}`
    : "none";
  const accelerator = project.accelerator?.companyName
    ? `${project.accelerator.companyName}${project.accelerator.batchName ? ` · ${project.accelerator.batchName}` : ""}`
    : "none";
  return `- \`${project.slug}\` — ${project.name}: ${project.oneLiner || "no one-liner"} | hackathon: \`${hackathon}\` | prize: \`${prize}\` | accelerator: \`${accelerator}\``;
}

function formatArchive(archive: ArchiveResult): string {
  const author = archive.author || "unknown author";
  const publishedAt = archive.publishedAt || "unknown date";
  const source = archive.source || "unknown source";
  const snippet = trimText(archive.snippet || "", 180);
  return `- \`${sanitizeArchiveTitle(archive.title)}\` by ${author} (${publishedAt}, ${source})${archive.url ? ` — ${archive.url}` : ""}${snippet ? ` | ${snippet}` : ""}`;
}

function trimText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

function sanitizeArchiveTitle(title: string): string {
  const normalized = title.replace(/\s+/g, " ").trim();
  const noisy = /arrow-up-right|circle-info|circle-exclamation|chevron-left|hashtag/i.test(normalized);
  if (!noisy) return normalized;
  if (/spl-governance/i.test(normalized)) {
    return "SPL Governance / Realms documentation";
  }
  return normalized.replace(/(arrow-up-right|circle-info|circle-exclamation|chevron-left|hashtag)+/gi, " ").replace(/\s+/g, " ").trim();
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8")) as T;
}

main();
