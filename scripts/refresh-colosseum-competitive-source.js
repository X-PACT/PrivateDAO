"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DEFAULT_API_BASE = "https://copilot.colosseum.com/api/v1";
const SOURCE_PATH = path_1.default.resolve("docs/competitive/source.json");
async function main() {
    const apiBase = trimValue(process.env.COLOSSEUM_COPILOT_API_BASE || DEFAULT_API_BASE);
    const pat = trimValue(process.env.COLOSSEUM_COPILOT_PAT);
    if (!pat) {
        throw new Error("COLOSSEUM_COPILOT_PAT is required to refresh the Colosseum competitive source");
    }
    const generalQuery = "private governance dao privacy confidential payroll treasury";
    const archiveQuery = "private governance confidential payments dao treasury privacy";
    const filters = await getJson(apiBase, pat, "/filters");
    const generalProjects = await searchProjects(apiBase, pat, generalQuery);
    const acceleratorProjects = await searchProjects(apiBase, pat, generalQuery, { acceleratorOnly: true });
    const winnerProjects = await searchProjects(apiBase, pat, generalQuery, { winnersOnly: true });
    const archives = await searchArchives(apiBase, pat, archiveQuery);
    const payload = {
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
    fs_1.default.writeFileSync(SOURCE_PATH, JSON.stringify(payload, null, 2) + "\n");
    console.log("Wrote Colosseum competitive source snapshot");
}
async function searchProjects(apiBase, pat, query, filters) {
    const payload = await postJson(apiBase, pat, "/search/projects", {
        query,
        limit: 5,
        filters,
    });
    return Array.isArray(payload.results) ? payload.results : [];
}
async function searchArchives(apiBase, pat, query) {
    const payload = await postJson(apiBase, pat, "/search/archives", {
        query,
        limit: 5,
    });
    return Array.isArray(payload.results) ? payload.results : [];
}
async function getJson(apiBase, pat, pathname) {
    return requestJson(apiBase, pat, pathname, "GET");
}
async function postJson(apiBase, pat, pathname, body) {
    return requestJson(apiBase, pat, pathname, "POST", body);
}
async function requestJson(apiBase, pat, pathname, method, body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
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
        return await response.json();
    }
    finally {
        clearTimeout(timeout);
    }
}
function trimValue(value) {
    return (value || "").trim();
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
