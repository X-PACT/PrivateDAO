import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeShell } from "@/components/home-shell";
import { LegacyEntryBridge } from "@/components/legacy-entry-bridge";
import { buildBrandHomeMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildBrandHomeMetadata();

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <LegacyEntryBridge />
      </Suspense>
      <HomeShell />
    </>
  );
}
