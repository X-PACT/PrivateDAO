"use client";

import { useEffect } from "react";

export function ArchivedRouteRedirect({ target, label }: { target: string; label: string }) {
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-6 py-16 text-center">
      <div>
        <p className="text-sm text-white/60">This historical product page is no longer part of the current catalog.</p>
        <a className="mt-4 inline-flex text-cyan-200 underline underline-offset-4" href={target}>
          {label}
        </a>
      </div>
    </main>
  );
}
