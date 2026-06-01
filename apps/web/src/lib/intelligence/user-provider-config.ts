"use client";

export type UserProviderMode = "private-dao-default" | "bring-own-key" | "disabled";

export type UserProviderConfig = {
  mode: UserProviderMode;
  providerId: string;
  baseUrl?: string;
  encryptedApiKey?: string;
};

const storageKey = "privatedao.intelligence.provider";

export function loadUserProviderConfig(): UserProviderConfig {
  if (typeof window === "undefined") return { mode: "private-dao-default", providerId: "qvac-local" };
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return { mode: "private-dao-default", providerId: "qvac-local" };
  try {
    return JSON.parse(raw) as UserProviderConfig;
  } catch {
    return { mode: "private-dao-default", providerId: "qvac-local" };
  }
}

export async function encodeBrowserOnlyKey(value: string) {
  const bytes = new TextEncoder().encode(value);
  return btoa(String.fromCharCode(...bytes));
}

export async function saveUserProviderConfig(config: UserProviderConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(config));
}
