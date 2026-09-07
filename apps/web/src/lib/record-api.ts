import { NextResponse } from "next/server";

export const RECORD_API_PREFIX = process.env.PRIVATEDAO_RECORD_API_PREFIX || "/v1";
export const RECORD_API_BASE = (process.env.PRIVATEDAO_RECORD_API_BASE || process.env.PRIVATEDAO_PRIVATE_ENGINE_URL || "http://127.0.0.1:8787").replace(/\/+$/, "");
const PUBLIC_RECORD_API_BASE = (process.env.NEXT_PUBLIC_RECORD_API_BASE || "https://api.privatedao.org/api/v1").replace(/\/+$/, "");

export function publicRecordApiUrl(path: string) {
  if (!PUBLIC_RECORD_API_BASE) return `/api/records${path}`;
  return `${PUBLIC_RECORD_API_BASE}${path}`;
}

export async function forwardRecordRequest(path: string, init?: RequestInit) {
  const upstream = await fetch(`${RECORD_API_BASE}${RECORD_API_PREFIX}${path}`, { ...init, cache: "no-store", headers: { Accept: "application/json", ...(init?.headers || {}) } });
  const payload = await upstream.json().catch(() => ({ ok: false, error: "Invalid Record Verification response." }));
  return NextResponse.json(payload, { status: upstream.status });
}
