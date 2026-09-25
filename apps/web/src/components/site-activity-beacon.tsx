"use client";

import { useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_PRIVATE_DAO_API_BASE || "https://api.privatedao.org";
const SESSION_KEY = "privatedao.visitor_session_id.v1";

function createSessionId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getSessionId() {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = createSessionId();
    window.localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return "storage-unavailable";
  }
}

function postJson(path: string, body: Record<string, string>) {
  void fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => null);
}

export function SiteActivityBeacon() {
  useEffect(() => {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return;
    }

    const sessionId = getSessionId();
    const page = window.location.pathname || "/";
    const countryHint = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
    postJson("/api/v1/visitors/ping", { sessionId, page, countryHint });
  }, []);

  return null;
}
