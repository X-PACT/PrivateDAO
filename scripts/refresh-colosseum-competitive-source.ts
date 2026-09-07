import fs from "fs";
import path from "path";

type CopilotProjectResult = {
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
    type?: string | null;
    name?: string | null;
    placement?: number | null;
    amount?: number | null;
    trackName?: string | null;
  } | null;
  accelerator?: {
    companySlug?: string | null;
    companyName?: string | null;
    batchKey?: string | null;
    batchName?: string | null;
  } | null;
  tags?: {
    problemTags?: string[];
    solutionTags?: string[];
    primitives?: string[];
    techStack?: string[];
    targetUsers?: string[];
  } | null;
  links?: {
    github?: string | null;
    presentation?: string | null;
    technicalDemo?: string | null;
    twitter?: string | null;
    colosseum?: string | null;
  } | null;
};

type CopilotArchiveResult = {
  documentId: string;
  title: string;
  author?: string | null;
  source?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  similarity: number;
  snippet?: string | null;
};

type CopilotFilters = {
  hackathons?: Array<{
    slug: string;
    name: string;
    startDate: string;
    projectCount: number;
    winnerCount: number;
  }>;
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
  filters: CopilotFilters;
  generalProjects: CopilotProjectResult[];
  acceleratorProjects: CopilotProjectResult[];
  winnerProjects: CopilotProjectResult[];
  archives: CopilotArchiveResult[];
};

const DEFAULT_API_BASE = "https://copilot.colosseum.com/api/v1";
const SOURCE_PATH = path.resolve("docs/competitive/source.json");

async function main() {
  const apiBase = trimValue(process.env.COLOSSEUM_COPILOT_API_BASE || DEFAULT_API_BASE);
  const pat = trimValue(process.env.COLOSSEUM_COPILOT_PAT);

  if (!pat) {
    throw new Error("COLOSSEUM_COPILOT_PAT is required to refresh the Colosseum competitive source");
  }

  const generalQuery = "private governance dao privacy confidential payroll treasury";
  const archiveQuery = "private governance confidential payments dao treasury privacy";

  const filters = await getJson<CopilotFilters>(apiBase, pat, "/filters");
  const generalProjects = await searchProjects(apiBase, pat, generalQuery);
  const acceleratorProjects = await searchProjects(apiBase, pat, generalQuery, { acceleratorOnly: true });
  const winnerProjects = await searchProjects(apiBase, pat, generalQuery, { winnersOnly: true });
  const archives = await searchArchives(apiBase, pat, archiveQuery);

  const payload: CompetitiveSource = {
    project: "PrivateDAO",
    generatedAt: new Date().toISOString(),
    apiBase,
    queries: {
      generalProjects: generalQuery,
      acceleratorProjects: generalQuery,
      winnerProjects: generalQuery,
      archives: archiveQuery,
    },
    filters: {
      hackathons: Array.isArray(filters.hackathons)
        ? filters.hackathons.map((hackathon) => ({
            slug: hackathon.slug,
            name: hackathon.name,
            startDate: hackathon.startDate,
            projectCount: hackathon.projectCount,
            winnerCount: hackathon.winnerCount,
          }))
        : [],
    },
    generalProjects,
    acceleratorProjects,
    winnerProjects,
    archives,
  };

  fs.writeFileSync(SOURCE_PATH, JSON.stringify(payload, null, 2) + "\n");
  console.log("Wrote Colosseum competitive source snapshot");
}

async function searchProjects(
  apiBase: string,
  pat: string,
  query: string,
  filters?: Record<string, boolean>,
): Promise<CopilotProjectResult[]> {
  const payload = await postJson<{ results?: CopilotProjectResult[] }>(apiBase, pat, "/search/projects", {
    query,
    limit: 5,
    filters,
  });
  return Array.isArray(payload.results) ? payload.results : [];
}

async function searchArchives(
  apiBase: string,
  pat: string,
  query: string,
): Promise<CopilotArchiveResult[]> {
  const payload = await postJson<{ results?: CopilotArchiveResult[] }>(apiBase, pat, "/search/archives", {
    query,
    limit: 5,
  });
  return Array.isArray(payload.results) ? payload.results : [];
}

async function getJson<T>(apiBase: string, pat: string, pathname: string): Promise<T> {
  return requestJson<T>(apiBase, pat, pathname, "GET");
}

async function postJson<T>(apiBase: string, pat: string, pathname: string, body: unknown): Promise<T> {
  return requestJson<T>(apiBase, pat, pathname, "POST", body);
}

async function requestJson<T>(
  apiBase: string,
  pat: string,
  pathname: string,
  method: "GET" | "POST",
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${apiBase}${pathname}`, {
      method,
      headers: {
        Authorization: `Bearer ${pat}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Copilot request failed for ${pathname}: ${response.status} ${response.statusText} ${text}`.trim());
    }
    return await response.json() as T;
  } finally {
    clearTimeout(timeout);
  }
}

function trimValue(value?: string | null): string {
  return (value || "").trim();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
