"use client";

import { useMemo } from "react";

const FALLBACK_SITE_URL = "https://privatedao.org";

function normalizeBaseUrl(input: string) {
  return input.replace(/\/+$/, "");
}

function detectBasePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "PrivateDAO" ? "/PrivateDAO" : "";
}

export function resolveSiteBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_LIVE_SITE_URL;

  if (typeof window === "undefined") {
    return normalizeBaseUrl(configured ?? FALLBACK_SITE_URL);
  }

  if (configured) {
    return normalizeBaseUrl(configured);
  }

  const basePath = detectBasePath(window.location.pathname);
  return normalizeBaseUrl(`${window.location.origin}${basePath}`);
}

export function buildJudgeViewUrl() {
  return `${resolveSiteBaseUrl()}/proof/?judge=1`;
}

export function useSiteUrls() {
  return useMemo(
    () => ({
      liveSiteUrl: resolveSiteBaseUrl(),
      judgeViewUrl: buildJudgeViewUrl(),
    }),
    [],
  );
}
