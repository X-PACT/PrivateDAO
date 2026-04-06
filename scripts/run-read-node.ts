// SPDX-License-Identifier: AGPL-3.0-or-later
import * as http from "http";
import { URL } from "url";
import { PrivateDaoReadNode } from "./lib/read-node";

const host = process.env.PRIVATE_DAO_READ_NODE_HOST || "127.0.0.1";
const port = Number(process.env.PRIVATE_DAO_READ_NODE_PORT || 8787);
const allowedOrigin = process.env.PRIVATE_DAO_READ_ALLOWED_ORIGIN || "*";
const rateWindowMs = Number(process.env.PRIVATE_DAO_READ_RATE_WINDOW_MS || 60_000);
const rateLimit = Number(process.env.PRIVATE_DAO_READ_RATE_LIMIT || 180);
const readNode = new PrivateDaoReadNode();

const rateMap = new Map<string, { count: number; resetAt: number }>();
const serverStartedAt = new Date().toISOString();
const metrics = {
  requestsTotal: 0,
  requestsFailed: 0,
  rateLimited: 0,
  routeHits: new Map<string, number>(),
};

function writeJson(res: http.ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload, null, 2));
}

function normalizeIp(req: http.IncomingMessage): string {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

function markRoute(pathname: string) {
  metrics.requestsTotal += 1;
  metrics.routeHits.set(pathname, (metrics.routeHits.get(pathname) || 0) + 1);
}

function enforceRateLimit(req: http.IncomingMessage): string | null {
  const ip = normalizeIp(req);
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateMap.set(ip, { count: 1, resetAt: now + rateWindowMs });
    return null;
  }
  if (entry.count >= rateLimit) {
    return ip;
  }
  entry.count += 1;
  return null;
}

function routeNotFound(res: http.ServerResponse, pathname: string) {
  writeJson(res, 404, { ok: false, error: `Unknown route: ${pathname}` });
}

async function handle(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method === "OPTIONS") {
    writeJson(res, 200, { ok: true });
    return;
  }

  if (req.method !== "GET") {
    writeJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  const limitedIp = enforceRateLimit(req);
  if (limitedIp) {
    metrics.rateLimited += 1;
    writeJson(res, 429, { ok: false, error: `Rate limit exceeded for ${limitedIp}` });
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || `${host}:${port}`}`);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  markRoute(pathname);

  try {
    if (pathname === "/healthz") {
      const runtime = await readNode.getRuntimeSnapshot();
      writeJson(res, 200, { ok: true, health: "healthy", runtime });
      return;
    }

    if (pathname === "/api/v1/runtime") {
      const runtime = await readNode.getRuntimeSnapshot(url.searchParams.get("refresh") === "1");
      writeJson(res, 200, { ok: true, runtime });
      return;
    }

    if (pathname === "/api/v1/config") {
      writeJson(res, 200, {
        ok: true,
        config: {
          host,
          port,
          allowedOrigin,
          readPath: "backend-indexer",
          programId: readNode.programId.toBase58(),
          rpcEndpoints: readNode.rpcEndpoints,
          cacheTtlMs: readNode.cacheTtlMs,
        },
      });
      return;
    }

    if (pathname === "/api/v1/ops/overview") {
      const overview = await readNode.getOpsOverview(url.searchParams.get("refresh") === "1");
      writeJson(res, 200, { ok: true, source: "backend-indexer", overview });
      return;
    }

    if (pathname === "/api/v1/ops/snapshot") {
      const force = url.searchParams.get("refresh") === "1";
      const [runtime, overview] = await Promise.all([
        readNode.getRuntimeSnapshot(force),
        readNode.getOpsOverview(force),
      ]);
      const profiles = readNode.getLoadProfiles();
      writeJson(res, 200, {
        ok: true,
        source: "backend-indexer",
        snapshot: {
          generatedAt: new Date().toISOString(),
          runtime,
          overview,
          profiles,
          metrics: {
            startedAt: serverStartedAt,
            requestsTotal: metrics.requestsTotal,
            requestsFailed: metrics.requestsFailed,
            rateLimited: metrics.rateLimited,
            routeHits: Object.fromEntries(metrics.routeHits.entries()),
          },
          deployment: {
            sameDomainRecommended: true,
            sameDomainGuide: "docs/read-node-same-domain-deploy.md",
            readApiPath: "/api/v1",
          },
        },
      });
      return;
    }

    if (pathname === "/api/v1/devnet/profiles") {
      const profiles = readNode.getLoadProfiles();
      writeJson(res, 200, { ok: true, source: "backend-indexer", profiles });
      return;
    }

    if (pathname === "/api/v1/metrics") {
      writeJson(res, 200, {
        ok: true,
        metrics: {
          startedAt: serverStartedAt,
          requestsTotal: metrics.requestsTotal,
          requestsFailed: metrics.requestsFailed,
          rateLimited: metrics.rateLimited,
          routeHits: Object.fromEntries(metrics.routeHits.entries()),
          rpcPoolSize: readNode.rpcEndpoints.length,
          cache: readNode.cacheStats(),
          programId: readNode.programId.toBase58(),
        },
      });
      return;
    }

    if (pathname === "/api/v1/proposals") {
      const dao = url.searchParams.get("dao") || undefined;
      const proposals = await readNode.fetchProposals({
        dao: dao || undefined,
        force: url.searchParams.get("refresh") === "1",
      });
      writeJson(res, 200, {
        ok: true,
        source: "backend-indexer",
        count: proposals.length,
        proposals,
      });
      return;
    }

    const proposalMatch = pathname.match(/^\/api\/v1\/proposals\/([^/]+)$/);
    if (proposalMatch) {
      const proposal = await readNode.fetchProposal(proposalMatch[1]);
      writeJson(res, 200, { ok: true, source: "backend-indexer", proposal });
      return;
    }

    const daoMatch = pathname.match(/^\/api\/v1\/daos\/([^/]+)$/);
    if (daoMatch) {
      const dao = await readNode.fetchDao(daoMatch[1]);
      writeJson(res, 200, { ok: true, source: "backend-indexer", dao });
      return;
    }

    const readinessMatch = pathname.match(/^\/api\/v1\/daos\/([^/]+)\/wallets\/([^/]+)\/readiness$/);
    if (readinessMatch) {
      const readiness = await readNode.fetchWalletReadiness(readinessMatch[1], readinessMatch[2]);
      writeJson(res, 200, { ok: true, source: "backend-indexer", readiness });
      return;
    }

    routeNotFound(res, pathname);
  } catch (error) {
    metrics.requestsFailed += 1;
    writeJson(res, 500, {
      ok: false,
      error: String((error as Error)?.message || error || "Unhandled read node error"),
      source: "backend-indexer",
    });
  }
}

const server = http.createServer((req, res) => {
  void handle(req, res);
});

server.listen(port, host, () => {
  console.log(`PrivateDAO read node listening on http://${host}:${port}`);
  console.log(`Program ID: ${readNode.programId.toBase58()}`);
  console.log(`RPC pool: ${readNode.rpcEndpoints.join(", ")}`);
});
