"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const focusedProductRoutes = ["/pilots/credit-decision-verification", "/pilots/yumi-cash-verification", "/proof-workflows/verify/demo-proof-id"];

function isFocusedProductRoute(pathname: string | null) {
  const normalized = (pathname || "/").replace(/\/+$/, "") || "/";
  return focusedProductRoutes.includes(normalized);
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const focused = isFocusedProductRoute(pathname);

  return (
    <>
      {focused ? null : <SiteHeader />}
      <div className="relative z-10 flex-1">{children}</div>
      {focused ? null : <SiteFooter />}
    </>
  );
}
