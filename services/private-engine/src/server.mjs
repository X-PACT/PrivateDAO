import { createServer } from "node:http";
import { createPublicKey, createVerify } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { controlPlanePayload, ENGINE_VERSION, installationId, loadLicense, publicLicenseStatus, verifyLicense } from "./license.mjs";
import { proveBlindPolicy, provePlugin, verifyBlindPolicy, verifyPlugin } from "./proof.mjs";
import { LocalDatabase } from "./db.mjs";
import { CONDITION_FIELDS, MARKETPLACE_TEMPLATES, PLUGIN_REGISTRY, compilePolicy, getPlugin, getTemplate } from "./plugins.mjs";

const port = Number(process.env.PORT || 8787);
const rootDir = process.env.PRIVATEDAO_ARTIFACT_ROOT || join(process.cwd(), "../..");
const dataDir = process.env.PRIVATEDAO_DATA_DIR || join(process.cwd(), "data");
const receiptsDir = join(dataDir, "receipts");
await mkdir(receiptsDir, { recursive: true });
const database = new LocalDatabase(dataDir);
let oidcJwksCache = { expiresAt: 0, keys: new Map() };

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": process.env.PRIVATEDAO_CORS_ORIGIN || "*" });
  res.end(JSON.stringify(body));
}

async function body(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 512 * 1024) throw new Error("Request body exceeds 512KB.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function currentLicense() {
  return loadLicense(dataDir);
}

function requestRole(req) {
  if (req.privatedaoRole) return req.privatedaoRole;
  const configured = String(req.headers["x-privatedao-role"] || "").trim().toLowerCase();
  if (configured) return configured;
  return (process.env.PRIVADAO_AUTH_MODE || "development") === "development" ? "admin" : "viewer";
}

async function authenticateOidc(req) {
  if ((process.env.PRIVADAO_AUTH_MODE || "development") === "development") {
    req.privatedaoRole = requestRole(req);
    return req.privatedaoRole;
  }
  const authorization = String(req.headers.authorization || "");
  if (!authorization.startsWith("Bearer ")) throw Object.assign(new Error("Bearer OIDC token is required."), { statusCode: 401 });
  const token = authorization.slice(7).trim();
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) throw Object.assign(new Error("Malformed OIDC token."), { statusCode: 401 });
  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch { throw Object.assign(new Error("OIDC token claims are not valid JSON."), { statusCode: 401 }); }
  if (header.alg !== "RS256" || !header.kid) throw Object.assign(new Error("Only RS256 OIDC tokens with kid are accepted."), { statusCode: 401 });
  const jwksUrl = process.env.PRIVADAO_OIDC_JWKS_URL?.trim();
  if (!jwksUrl) throw Object.assign(new Error("PRIVADAO_OIDC_JWKS_URL is not configured."), { statusCode: 503 });
  if (oidcJwksCache.expiresAt < Date.now() || !oidcJwksCache.keys.has(header.kid)) {
    const response = await fetch(jwksUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw Object.assign(new Error("OIDC JWKS endpoint is unavailable."), { statusCode: 503 });
    const jwks = await response.json();
    oidcJwksCache = { expiresAt: Date.now() + 10 * 60_000, keys: new Map((jwks.keys || []).map((key) => [key.kid, key])) };
  }
  const jwk = oidcJwksCache.keys.get(header.kid);
  if (!jwk) throw Object.assign(new Error("OIDC signing key was not found."), { statusCode: 401 });
  const publicKey = createPublicKey({ key: jwk, format: "jwk" }).export({ format: "pem", type: "spki" });
  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();
  if (!verifier.verify(publicKey, Buffer.from(encodedSignature, "base64url"))) throw Object.assign(new Error("OIDC token signature is invalid."), { statusCode: 401 });
  const issuer = process.env.PRIVADAO_OIDC_ISSUER?.trim();
  const audience = process.env.PRIVADAO_OIDC_AUDIENCE?.trim();
  if (issuer && payload.iss !== issuer) throw Object.assign(new Error("OIDC issuer mismatch."), { statusCode: 401 });
  if (audience && !(Array.isArray(payload.aud) ? payload.aud.includes(audience) : payload.aud === audience)) throw Object.assign(new Error("OIDC audience mismatch."), { statusCode: 401 });
  if (!payload.exp || Number(payload.exp) <= Math.floor(Date.now() / 1000)) throw Object.assign(new Error("OIDC token is expired."), { statusCode: 401 });
  const claims = payload["https://privatedao.org/roles"] || payload.roles || payload.role || "viewer";
  req.privatedaoRole = Array.isArray(claims) ? String(claims[0] || "viewer").toLowerCase() : String(claims).toLowerCase();
  return req.privatedaoRole;
}

async function requireRole(req, allowed) {
  const role = await authenticateOidc(req);
  if (!allowed.includes(role)) {
    const error = new Error(`Role ${role} is not allowed to perform this action.`);
    error.statusCode = 403;
    throw error;
  }
  return role;
}

async function enforceRouteRole(req, pathname) {
  if (req.method !== "POST" || !pathname.startsWith("/v1/")) return;
  const policyAdmin = pathname === "/v1/policies" || pathname.endsWith("/approve") || pathname.endsWith("/versions");
  const adminOnly = pathname === "/v1/license/activate" || pathname.startsWith("/v1/organizations");
  await requireRole(req, adminOnly || policyAdmin ? ["admin", "compliance"] : ["admin", "compliance", "operator"]);
}

function requireEntitlement({ mutating = false, organizationId = "", userId = "" } = {}) {
  const license = currentLicense();
  if (!license.ok) {
    const error = new Error(`Enterprise license unavailable: ${license.status}`);
    error.statusCode = 402;
    throw error;
  }
  if (mutating && license.status === "offline-grace") {
    const error = new Error("License expired. Existing workflows and receipts remain readable, but new proofs require renewal.");
    error.statusCode = 402;
    throw error;
  }
  if (organizationId && license.payload.organizationId && organizationId !== license.payload.organizationId) {
    const error = new Error("Organization is not covered by this license.");
    error.statusCode = 403;
    throw error;
  }
  return license;
}

async function enforceSeatLimit(license, userId) {
  if (!userId || !license.payload?.seatLimit) return;
  const workflows = await database.list("workflows");
  const users = new Set(workflows.map((workflow) => workflow.createdBy).filter(Boolean));
  users.add(userId);
  if (users.size > Number(license.payload.seatLimit)) {
    const error = new Error("Seat limit reached. Renew or increase the organization license.");
    error.statusCode = 402;
    throw error;
  }
}

async function audit(type, details = {}) {
  const event = { type, createdAt: new Date().toISOString(), ...details };
  await database.insert("events", event);
  return event;
}

async function organizationHierarchy() {
  const snapshot = await database.read();
  const license = currentLicense();
  const organizations = snapshot.organizations.length || !license.payload?.organizationId
    ? snapshot.organizations
    : [{ organizationId: license.payload.organizationId, name: license.payload.organizationId, status: "licensed", source: "license" }];
  return {
    organizations,
    departments: snapshot.departments,
    teams: snapshot.teams,
    users: snapshot.users,
    roles: snapshot.roles,
  };
}

function licenseCenter(license, snapshot) {
  return {
    ...publicLicenseStatus(license, dataDir),
    activation: { endpoint: "/v1/license/activate", requiresSignedEnvelope: true, mode: "online-or-offline-file" },
    renewal: { endpoint: "/v1/license/sync", controlPlane: process.env.PRIVATEDAO_LICENSE_CONTROL_URL || null },
    usage: {
      organizations: new Set(snapshot.workflows.map((workflow) => workflow.organizationId).filter(Boolean)).size,
      seats: new Set(snapshot.workflows.map((workflow) => workflow.createdBy).filter(Boolean)).size,
      workflows: snapshot.workflows.length,
      proofs: snapshot.events.filter((event) => event.type === "proof-generated").length,
      receipts: snapshot.receipts.length,
    },
  };
}

async function saveReceipt(publicProofPackage, verification) {
  const receipt = {
    schema: "privatedao.local-receipt.v1",
    createdAt: new Date().toISOString(),
    proofId: publicProofPackage.proofId,
    proofHash: publicProofPackage.originalProofHash,
    policyCommitment: publicProofPackage.policyCommitment,
    inputCommitment: publicProofPackage.inputCommitment,
    circuitVersion: publicProofPackage.circuitVersion,
    policyVersion: publicProofPackage.policyVersion,
    verification,
    storageMode: "local-file-receipt",
  };
  await writeFile(join(receiptsDir, `${publicProofPackage.proofId}.json`), JSON.stringify(receipt, null, 2));
  await database.insert("receipts", receipt);
  return receipt;
}

async function listReceiptSummaries() {
  const receipts = await database.list("receipts");
  return receipts.map(({ proofId, proofHash, policyCommitment, inputCommitment, circuitVersion, policyVersion, createdAt, storageMode, verification }) => ({ proofId, proofHash, policyCommitment, inputCommitment, circuitVersion, policyVersion, createdAt, storageMode, verified: verification?.ok === true }));
}

function privacyBoundary() {
  return {
    executionMode: "on-premise-local",
    privateInputsLeaveDeployment: false,
    witnessGeneratedInDeployment: true,
    groth16ProvedInDeployment: true,
    controlPlaneReceives: ["installationId", "licenseId", "organizationId", "plan", "engineVersion", "feature flags"],
    controlPlaneNeverReceives: ["privateInputs", "witness", "raw records", "subject identity", "risk score", "liability values"],
    offlineSupported: true,
  };
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": process.env.PRIVATEDAO_CORS_ORIGIN || "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" });
    res.end();
    return;
  }
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  try {
    await enforceRouteRole(req, url.pathname);
    if (req.method === "GET" && url.pathname === "/health") return json(res, 200, { ok: true, service: "privatedao-private-engine", engineVersion: ENGINE_VERSION, installationId: installationId(), mode: "on-premise-local" });
    if (req.method === "GET" && url.pathname === "/v1/privacy") return json(res, 200, { ok: true, ...privacyBoundary() });
    if (req.method === "GET" && url.pathname === "/v1/license/status") return json(res, 200, publicLicenseStatus(currentLicense(), dataDir));
    if (req.method === "GET" && url.pathname === "/v1/license/center") {
      return json(res, 200, { ok: true, center: licenseCenter(currentLicense(), await database.read()) });
    }
    if (req.method === "GET" && url.pathname === "/v1/license/usage") {
      const snapshot = await database.read();
      return json(res, 200, { ok: true, usage: licenseCenter(currentLicense(), snapshot).usage });
    }
    if (req.method === "POST" && url.pathname === "/v1/license/activate") {
      const input = await body(req);
      const envelope = input.license || input;
      const checked = verifyLicense(envelope, process.env.PRIVATEDAO_LICENSE_PUBLIC_KEY_PEM, installationId());
      if (!checked.ok) return json(res, 422, { ok: false, status: "license-rejected", reason: checked.error || checked.status });
      const licensePath = process.env.PRIVATEDAO_LICENSE_FILE?.trim() || join(dataDir, "license.json");
      await writeFile(licensePath, JSON.stringify(envelope, null, 2), { mode: 0o600 });
      await audit("license-activated", { licenseId: checked.payload.licenseId, organizationId: checked.payload.organizationId, plan: checked.payload.plan });
      return json(res, 200, { ok: true, status: "license-activated", license: publicLicenseStatus(loadLicense(dataDir), dataDir) });
    }
    if (req.method === "GET" && url.pathname === "/v1/plugins") return json(res, 200, { ok: true, plugins: PLUGIN_REGISTRY, conditionFields: CONDITION_FIELDS });
    if (req.method === "GET" && url.pathname === "/v1/marketplace") return json(res, 200, { ok: true, templates: MARKETPLACE_TEMPLATES });
    if (req.method === "GET" && url.pathname === "/v1/organizations") return json(res, 200, { ok: true, hierarchy: await organizationHierarchy() });
    if (req.method === "POST" && url.pathname === "/v1/organizations") {
      const input = await body(req);
      const license = requireEntitlement({ mutating: true, organizationId: input.organizationId, userId: input.createdBy });
      const existing = await database.list("organizations");
      if (license.payload.organizationLimit && existing.length >= Number(license.payload.organizationLimit)) return json(res, 402, { ok: false, error: "Organization limit reached." });
      const organization = { organizationId: String(input.organizationId || `org_${Date.now().toString(36)}`).slice(0, 120), name: String(input.name || input.organizationId || "Organization").slice(0, 120), createdAt: new Date().toISOString(), status: "active" };
      await database.insert("organizations", organization);
      await audit("organization-created", { organizationId: organization.organizationId, createdBy: input.createdBy || "local-admin" });
      return json(res, 201, { ok: true, organization });
    }
    if (req.method === "POST" && url.pathname === "/v1/organizations/users") {
      const input = await body(req);
      const license = requireEntitlement({ mutating: true, organizationId: input.organizationId, userId: input.createdBy });
      await enforceSeatLimit(license, input.userId);
      const user = { userId: String(input.userId || `user_${Date.now().toString(36)}`).slice(0, 120), organizationId: license.payload.organizationId, departmentId: input.departmentId || null, teamId: input.teamId || null, role: input.role || "viewer", createdAt: new Date().toISOString(), status: "active" };
      await database.insert("users", user);
      await audit("user-added", { organizationId: user.organizationId, userId: user.userId, role: user.role });
      return json(res, 201, { ok: true, user });
    }
    if (req.method === "GET" && url.pathname === "/v1/rbac") return json(res, 200, { ok: true, roles: (await database.list("roles")), permissions: ["admin", "auditor", "compliance", "operator", "viewer"] });
    if (req.method === "GET" && url.pathname === "/v1/audit/timeline") {
      await requireRole(req, ["admin", "auditor", "compliance"]);
      const workflowId = url.searchParams.get("workflowId");
      const events = await database.list("events");
      return json(res, 200, { ok: true, timeline: (workflowId ? events.filter((event) => event.workflowId === workflowId) : events).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))) });
    }
    if (req.method === "GET" && url.pathname === "/v1/admin/overview") {
      await requireRole(req, ["admin", "auditor", "compliance"]);
      const license = currentLicense();
      const databaseSnapshot = await database.read();
      return json(res, 200, {
        ok: true,
        service: "privatedao-private-engine",
        engineVersion: ENGINE_VERSION,
        license: publicLicenseStatus(license, dataDir),
        workflows: { total: databaseSnapshot.workflows.length, active: databaseSnapshot.workflows.filter((workflow) => workflow.status === "active").length },
        receipts: { total: databaseSnapshot.receipts.length, verified: databaseSnapshot.receipts.filter((receipt) => receipt.verification?.ok === true).length },
        events: databaseSnapshot.events.slice(-20).reverse(),
        privacy: privacyBoundary(),
      });
    }
    if (req.method === "GET" && url.pathname === "/v1/workflows") {
      return json(res, 200, { ok: true, workflows: await database.list("workflows") });
    }
    if (req.method === "GET" && url.pathname === "/v1/policies") return json(res, 200, { ok: true, policies: await database.list("policies") });
    if (req.method === "GET" && url.pathname.startsWith("/v1/policies/")) {
      const policyId = decodeURIComponent(url.pathname.slice("/v1/policies/".length));
      const policy = await database.find("policies", (item) => item.policyId === policyId);
      return policy ? json(res, 200, { ok: true, policy }) : json(res, 404, { ok: false, error: "Policy not found." });
    }
    if (req.method === "GET" && url.pathname === "/v1/receipts") return json(res, 200, { ok: true, receipts: await listReceiptSummaries() });
    if (req.method === "GET" && url.pathname.startsWith("/v1/receipts/")) {
      const proofId = decodeURIComponent(url.pathname.slice("/v1/receipts/".length));
      const receipt = await database.find("receipts", (item) => item.proofId === proofId);
      return receipt ? json(res, 200, { ok: true, receipt }) : json(res, 404, { ok: false, error: "Receipt not found." });
    }
    if (req.method === "POST" && url.pathname === "/v1/workflows") {
      const input = await body(req);
      const license = requireEntitlement({ mutating: true, organizationId: input.organizationId, userId: input.createdBy });
      await enforceSeatLimit(license, input.createdBy);
      const plugin = getPlugin(input.pluginId || "blind-policy");
      if (!plugin) return json(res, 422, { ok: false, error: "Unknown proof plugin." });
      const template = input.templateId ? getTemplate(input.templateId) : null;
      const workflow = {
        workflowId: `wf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        organizationId: license.payload.organizationId,
        name: String(input.name || "Blind Policy Workflow").slice(0, 120),
        template: String(input.template || template?.name || "blind-policy").slice(0, 80),
        templateId: template?.id || input.templateId || null,
        pluginId: plugin.id,
        pluginStatus: plugin.status,
        proofReady: plugin.proofReady,
        policyId: input.policyId || null,
        policyVersionId: input.policyVersionId || null,
        createdBy: String(input.createdBy || "local-admin").slice(0, 120),
        createdAt: new Date().toISOString(),
        status: "active",
      };
      await database.insert("workflows", workflow);
      await audit("workflow-created", { workflowId: workflow.workflowId, organizationId: workflow.organizationId, pluginId: workflow.pluginId, templateId: workflow.templateId });
      return json(res, 201, { ok: true, workflow });
    }
    if (req.method === "POST" && url.pathname.startsWith("/v1/workflows/") && url.pathname.endsWith("/archive")) {
      const workflowId = decodeURIComponent(url.pathname.slice("/v1/workflows/".length, -"/archive".length));
      const input = await body(req);
      const workflow = await database.find("workflows", (item) => item.workflowId === workflowId);
      if (!workflow) return json(res, 404, { ok: false, error: "Workflow not found." });
      requireEntitlement({ mutating: true, organizationId: workflow.organizationId, userId: input.updatedBy });
      const archived = await database.update("workflows", (item) => item.workflowId === workflowId, (item) => ({ ...item, status: "archived", archivedAt: new Date().toISOString(), archivedBy: input.updatedBy || "local-admin" }));
      await audit("workflow-archived", { workflowId, organizationId: workflow.organizationId, archivedBy: input.updatedBy || "local-admin" });
      return json(res, 200, { ok: true, workflow: archived });
    }
    if (req.method === "POST" && url.pathname === "/v1/policies") {
      const input = await body(req);
      const license = requireEntitlement({ mutating: true, organizationId: input.organizationId, userId: input.createdBy });
      const plugin = getPlugin(input.pluginId || "blind-policy");
      if (!plugin) return json(res, 422, { ok: false, error: "Unknown proof plugin." });
      const template = input.templateId ? getTemplate(input.templateId) : null;
      const ast = compilePolicy({ conditions: input.conditions || template?.conditions, logic: input.logic, action: input.action });
      const now = new Date().toISOString();
      const policy = {
        policyId: `pol_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        organizationId: license.payload.organizationId,
        name: String(input.name || template?.name || "Untitled policy").slice(0, 120),
        pluginId: plugin.id,
        templateId: template?.id || input.templateId || null,
        createdBy: String(input.createdBy || "local-admin").slice(0, 120),
        createdAt: now,
        versions: [{ versionId: "v1", version: 1, status: "draft", createdAt: now, createdBy: String(input.createdBy || "local-admin"), approvedBy: null, approvedAt: null, ast, compiledCircuit: plugin.circuitId }],
      };
      await database.insert("policies", policy);
      await audit("policy-created", { policyId: policy.policyId, organizationId: policy.organizationId, pluginId: plugin.id, policyVersionId: "v1", createdBy: policy.createdBy });
      return json(res, 201, { ok: true, policy });
    }
    if (req.method === "POST" && url.pathname.startsWith("/v1/policies/") && url.pathname.endsWith("/versions")) {
      const policyId = decodeURIComponent(url.pathname.slice("/v1/policies/".length, -"/versions".length));
      const input = await body(req);
      const existing = await database.find("policies", (item) => item.policyId === policyId);
      if (!existing) return json(res, 404, { ok: false, error: "Policy not found." });
      const ast = compilePolicy(input);
      const nextVersion = (existing.versions?.length || 0) + 1;
      const version = { versionId: `v${nextVersion}`, version: nextVersion, status: "draft", createdAt: new Date().toISOString(), createdBy: String(input.createdBy || "local-admin"), approvedBy: null, approvedAt: null, ast, compiledCircuit: getPlugin(existing.pluginId)?.circuitId || null };
      const policy = await database.update("policies", (item) => item.policyId === policyId, (item) => ({ ...item, versions: [...(item.versions || []), version] }));
      await audit("policy-version-created", { policyId, policyVersionId: version.versionId, createdBy: version.createdBy });
      return json(res, 201, { ok: true, policy });
    }
    if (req.method === "POST" && url.pathname.startsWith("/v1/policies/") && url.pathname.endsWith("/approve")) {
      const policyId = decodeURIComponent(url.pathname.slice("/v1/policies/".length, -"/approve".length));
      const input = await body(req);
      const existing = await database.find("policies", (item) => item.policyId === policyId);
      if (!existing) return json(res, 404, { ok: false, error: "Policy not found." });
      const versionId = input.versionId || existing.versions?.at(-1)?.versionId;
      const approvedAt = new Date().toISOString();
      const policy = await database.update("policies", (item) => item.policyId === policyId, (item) => ({ ...item, versions: item.versions.map((version) => version.versionId === versionId ? { ...version, status: "approved", approvedBy: String(input.approvedBy || "local-admin"), approvedAt } : version) }));
      await audit("policy-approved", { policyId, policyVersionId: versionId, approvedBy: String(input.approvedBy || "local-admin"), approvedAt });
      return json(res, 200, { ok: true, policy });
    }
    if (req.method === "POST" && url.pathname.startsWith("/v1/workflows/") && url.pathname.endsWith("/run")) {
      const workflowId = decodeURIComponent(url.pathname.slice("/v1/workflows/".length, -"/run".length));
      const input = await body(req);
      const workflow = await database.find("workflows", (item) => item.workflowId === workflowId);
      if (!workflow) return json(res, 404, { ok: false, error: "Workflow not found." });
      const plugin = getPlugin(workflow.pluginId || "blind-policy");
      if (!plugin?.proofReady) return json(res, 409, { ok: false, status: "plugin-circuit-pending", error: `${plugin?.name || "This plugin"} is registered in the marketplace, but its proving artifacts are not installed in this deployment yet.`, plugin });
      const license = requireEntitlement({ mutating: true, organizationId: workflow.organizationId, userId: input.createdBy || workflow.createdBy });
      await enforceSeatLimit(license, input.createdBy || workflow.createdBy);
      const result = workflow.pluginId === "blind-policy" ? await proveBlindPolicy({ rootDir, privateInputs: input.privateInputs, workflowId, policyVersion: input.policyVersion }) : await provePlugin({ rootDir, pluginId: workflow.pluginId, privateInputs: input.privateInputs, workflowId, policyVersion: input.policyVersion || `${workflow.pluginId}.v1` });
      const receipt = await saveReceipt(result.publicProofPackage, result.verification);
      await audit("proof-generated", { workflowId, proofId: result.publicProofPackage.proofId, organizationId: license.payload.organizationId, pluginId: plugin.id, policyVersion: result.publicProofPackage.policyVersion });
      await audit("verified", { workflowId, proofId: result.publicProofPackage.proofId, organizationId: license.payload.organizationId, circuitVersion: result.publicProofPackage.circuitVersion });
      await audit("receipt-issued", { workflowId, proofId: result.publicProofPackage.proofId, organizationId: license.payload.organizationId });
      return json(res, 200, { ...result, receipt, execution: "local", privacy: privacyBoundary() });
    }
    if (req.method === "POST" && url.pathname === "/v1/prove") {
      const input = await body(req);
      const license = requireEntitlement({ mutating: true, userId: input.createdBy });
      await enforceSeatLimit(license, input.createdBy);
      const result = input.pluginId && input.pluginId !== "blind-policy" ? await provePlugin({ rootDir, pluginId: input.pluginId, privateInputs: input.privateInputs, workflowId: input.workflowId, policyVersion: input.policyVersion || `${input.pluginId}.v1` }) : await proveBlindPolicy({ rootDir, privateInputs: input.privateInputs, workflowId: input.workflowId, policyVersion: input.policyVersion });
      await database.insert("events", { type: "proof-generated", proofId: result.publicProofPackage.proofId, createdAt: new Date().toISOString(), organizationId: license.payload.organizationId });
      return json(res, 200, { ...result, execution: "local", license: { organizationId: license.payload.organizationId, plan: license.payload.plan, status: license.status }, privacy: privacyBoundary() });
    }
    if (req.method === "POST" && url.pathname === "/v1/verify") {
      const input = await body(req);
      return json(res, 200, input.publicProofPackage?.pluginId && input.publicProofPackage.pluginId !== "blind-policy" ? await verifyPlugin({ rootDir, publicProofPackage: input.publicProofPackage }) : await verifyBlindPolicy({ rootDir, publicProofPackage: input.publicProofPackage }));
    }
    if (req.method === "POST" && url.pathname === "/v1/receipt") {
      const input = await body(req);
      const verification = input.publicProofPackage?.pluginId && input.publicProofPackage.pluginId !== "blind-policy" ? await verifyPlugin({ rootDir, publicProofPackage: input.publicProofPackage }) : await verifyBlindPolicy({ rootDir, publicProofPackage: input.publicProofPackage });
      if (!verification.ok) return json(res, 422, { ok: false, status: "receipt-rejected", verification });
      requireEntitlement({ mutating: true });
      const receipt = await saveReceipt(input.publicProofPackage, verification);
      return json(res, 200, { ok: true, status: "local-receipt-stored", receipt });
    }
    if (req.method === "POST" && url.pathname === "/v1/license/sync") {
      const license = requireEntitlement();
      const controlUrl = process.env.PRIVATEDAO_LICENSE_CONTROL_URL?.trim();
      if (!controlUrl) return json(res, 200, { ok: true, status: "offline-license-valid", sent: controlPlanePayload(license), controlPlaneContacted: false });
      const response = await fetch(controlUrl, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(controlPlanePayload(license)) });
      return json(res, response.ok ? 200 : 502, { ok: response.ok, status: response.ok ? "license-synced" : "license-sync-failed", controlPlaneContacted: true, controlPlaneStatus: response.status });
    }
    return json(res, 404, { ok: false, error: "Not found." });
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 400;
    return json(res, statusCode, { ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`PrivateDAO local proof engine listening on :${port}`));
