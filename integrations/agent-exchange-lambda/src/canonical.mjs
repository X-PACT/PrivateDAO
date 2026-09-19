import { createHash } from "node:crypto";

function normalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non-finite number is not canonicalizable");
    return value;
  }
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key.normalize("NFC")] = normalize(value[key]);
      return out;
    }, {});
  }
  throw new Error("unsupported canonical value");
}

export function canonicalize(value) {
  const normalized = normalize(value);
  return JSON.stringify(normalized);
}

export function digest(value) {
  return createHash("sha256").update(canonicalize(value), "utf8").digest("hex");
}

export function receiptId(input) {
  return `rvr_${digest(input).slice(0, 32)}`;
}
