import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeShell } from "@/components/home-shell";
import { LegacyEntryBridge } from "@/components/legacy-entry-bridge";
import { buildBrandHomeMetadata } from "@/lib/route-metadata";

export const metadata: Metadata = buildBrandHomeMetadata();

export default function HomePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-7xl px-4 pt-6 text-sm text-cyan-100/80 sm:px-6 lg:px-8">
            Preparing the right PrivateDAO entry path…
          </div>
        }
      >
        <LegacyEntryBridge />
      </Suspense>
      <HomeShell />
    </>
  );
}
