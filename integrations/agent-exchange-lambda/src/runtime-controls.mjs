const windows = new Map();

function prune(now) {
  for (const [key, value] of windows) {
    if (now - value.startedAt >= value.windowMs) windows.delete(key);
  }
}

export function enforceRateLimit(key, limit = 120, windowMs = 60000) {
  const now = Date.now();
  prune(now);
  const current = windows.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    windows.set(key, { startedAt: now, count: 1, windowMs });
    return;
  }
  current.count += 1;
  if (current.count > limit) {
    const error = new Error("rate limit exceeded; retry shortly");
    error.statusCode = 429;
    error.retryAfterSeconds = Math.max(1, Math.ceil((current.startedAt + windowMs - now) / 1000));
    throw error;
  }
}

export function rateLimitKey(event) {
  const headers = event.headers || {};
  // Client-supplied identity headers are metadata, not authentication. Never
  // let a caller choose a fresh bucket to evade abuse limits. Only API
  // Gateway's source IP is trusted; without it, use one conservative bucket.
  return String(
    event.requestContext?.http?.sourceIp ||
      event.requestContext?.identity?.sourceIp ||
      "anonymous",
  ).slice(0, 160);
}

export function resetRuntimeControls() {
  windows.clear();
}
