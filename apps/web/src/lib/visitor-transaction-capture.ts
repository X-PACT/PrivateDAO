"use client";

const API_BASE = process.env.NEXT_PUBLIC_PRIVATE_DAO_API_BASE || "https://api.privatedao.org";
const SESSION_KEY = "privatedao.visitor_session_id.v1";
const SOLANA_SIGNATURE_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{64,96}$/;
const SOLANA_PUBLIC_KEY_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const allowedStatuses = new Set(["submitted", "confirmed", "finalized"]);

function getSessionId() {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return "storage-unavailable";
  }
}

export type VisitorTransactionCaptureInput = {
  txSignature: string;
  walletAddress?: string;
  walletName?: string;
  action: string;
  status?: "submitted" | "confirmed" | "finalized";
  slot?: number;
};

export function captureVisitorTransaction(input: VisitorTransactionCaptureInput) {
  if (typeof window === "undefined") return;
  const txSignature = input.txSignature.trim();
  if (!SOLANA_SIGNATURE_PATTERN.test(txSignature)) return;
  const walletAddress = input.walletAddress?.trim();
  if (walletAddress && !SOLANA_PUBLIC_KEY_PATTERN.test(walletAddress)) return;
  const status = input.status && allowedStatuses.has(input.status) ? input.status : "confirmed";
  const payload = {
    ...input,
    txSignature,
    walletAddress,
    sessionId: getSessionId(),
    page: window.location.pathname || "/",
    status,
  };
  void fetch(`${API_BASE}/api/v1/transactions/receipt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => null);
}
