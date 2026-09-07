"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { legacyQueryToRoute } from "@/lib/legacy-routes";

export function LegacyEntryBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== "/") return;

    const target = legacyQueryToRoute(new URLSearchParams(searchParams.toString()));
    if (!target) return;

    const current = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    if (target === current) return;

    router.replace(target);
  }, [pathname, router, searchParams]);

  if (!searchParams.get("page")) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 text-sm text-cyan-100/80 sm:px-6 lg:px-8">
      Redirecting this legacy entrypoint into the new Next.js surface…
    </div>
  );
}
