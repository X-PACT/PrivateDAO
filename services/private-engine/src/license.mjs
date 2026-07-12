import { createHash, verify as verifySignature } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const ENGINE_VERSION = "0.1.0";

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function installationId() {
  const seed = process.env.PRIVATEDAO_INSTALLATION_ID?.trim() || process.env.HOSTNAME || "local-installation";
  return `inst_${hash(seed).slice(0, 24)}`;
}

export function loadLicense(dataDir) {
  const path = process.env.PRIVATEDAO_LICENSE_FILE?.trim() || join(dataDir, "license.json");
  if (!existsSync(path)) {
    if (process.env.PRIVATEDAO_ALLOW_DEV_LICENSE === "true") {
      return {
        ok: true,
        status: "development-license",
        signed: false,
        payload: {
          licenseId: "development-license",
          organizationId: "local-development",
          plan: "DEVELOPMENT",
          status: "active",
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          offlineGraceUntil: new Date(Date.now() + 86400000).toISOString(),
          features: ["blind-policy-groth16", "local-witness", "local-verification"],
        },
        path,
      };
    }
    return { ok: false, status: "license-missing", path };
  }
  try {
    const envelope = JSON.parse(readFileSync(path, "utf8"));
    return verifyLicense(envelope, resolvePublicKeys(), installationId());
  } catch (error) {
    return { ok: false, status: "license-invalid", error: error instanceof Error ? error.message : String(error), path };
  }
}

function resolvePublicKeys() {
  const keyring = process.env.PRIVATEDAO_LICENSE_PUBLIC_KEYS_JSON?.trim();
  if (keyring) {
    try { return JSON.parse(keyring); } catch { return {}; }
  }
  const single = process.env.PRIVATEDAO_LICENSE_PUBLIC_KEY_PEM?.trim();
  return single ? { primary: single } : {};
}

function revokedLicenseIds() {
  return new Set((process.env.PRIVATEDAO_LICENSE_REVOKED_IDS || "").split(",").map((value) => value.trim()).filter(Boolean));
}

export function verifyLicense(envelope, publicKeys, currentInstallationId) {
  if (!envelope || envelope.schema !== "privatedao.enterprise-license.v1") {
    return { ok: false, status: "license-invalid", error: "Unsupported license envelope." };
  }
  if (!envelope.payload || typeof envelope.signature !== "string") {
    return { ok: false, status: "license-invalid", error: "License payload or signature is missing." };
  }
  const payload = envelope.payload;
  if (!payload.licenseId || !payload.organizationId || !payload.expiresAt) {
    return { ok: false, status: "license-invalid", error: "License identity or expiry is missing." };
  }
  if (payload.installationId && payload.installationId !== currentInstallationId) {
    return { ok: false, status: "license-installation-mismatch", error: "License is bound to another installation." };
  }
  if (revokedLicenseIds().has(payload.licenseId)) return { ok: false, status: "license-revoked", error: "This license has been revoked by the control plane.", payload };
  const keys = typeof publicKeys === "string" ? { primary: publicKeys } : (publicKeys || {});
  const keyId = envelope.keyId || payload.keyId || "primary";
  const publicKeyPem = keys[keyId];
  if (!publicKeyPem) {
    if (process.env.PRIVATEDAO_ALLOW_DEV_LICENSE === "true") {
      return { ok: true, status: "development-license", payload, signed: false };
    }
    return { ok: false, status: "license-key-not-configured", error: "License verification key is not configured." };
  }
  let signed;
  try {
    signed = verifySignature(null, Buffer.from(stableStringify(payload)), publicKeyPem, Buffer.from(envelope.signature, "base64"));
  } catch (error) {
    return { ok: false, status: "license-invalid", error: error instanceof Error ? error.message : String(error) };
  }
  if (!signed) return { ok: false, status: "license-signature-invalid", error: "License signature did not verify." };

  const now = Date.now();
  const expiresAt = Date.parse(payload.expiresAt);
  const offlineGraceUntil = Date.parse(payload.offlineGraceUntil || payload.expiresAt);
  if (!Number.isFinite(expiresAt) || !Number.isFinite(offlineGraceUntil)) {
    return { ok: false, status: "license-invalid", error: "License dates are invalid." };
  }
  if (now > offlineGraceUntil) return { ok: false, status: "license-expired", payload };
  if (payload.status && payload.status !== "active") return { ok: false, status: "license-inactive", payload };
  return {
    ok: true,
    status: now > expiresAt ? "offline-grace" : "active",
    payload,
    signed: true,
  };
}

export function publicLicenseStatus(license, dataDir) {
  return {
    ok: license.ok,
    status: license.status,
    engineVersion: ENGINE_VERSION,
    installationId: installationId(),
    organizationId: license.payload?.organizationId || null,
    plan: license.payload?.plan || null,
    expiresAt: license.payload?.expiresAt || null,
    offlineGraceUntil: license.payload?.offlineGraceUntil || null,
    features: license.payload?.features || [],
    seatLimit: license.payload?.seatLimit || 0,
    organizationLimit: license.payload?.organizationLimit || 0,
    enabledPlugins: license.payload?.enabledPlugins || [],
    deploymentMode: license.payload?.deploymentMode || null,
    customerId: license.payload?.customerId || null,
    keyId: license.payload?.keyId || null,
    expiredBehavior: "Existing workflows, receipts, and verification remain readable. New workflows, proofs, and receipts are blocked after expiry.",
    dataBoundary: "Private inputs, witness generation, and proof creation stay inside this deployment.",
    licenseFileConfigured: Boolean(process.env.PRIVATEDAO_LICENSE_FILE || join(dataDir, "license.json")),
  };
}

export function controlPlanePayload(license) {
  return {
    installationId: installationId(),
    licenseId: license.payload?.licenseId || null,
    organizationId: license.payload?.organizationId || null,
    plan: license.payload?.plan || null,
    engineVersion: ENGINE_VERSION,
    features: license.payload?.features || [],
  };
}
