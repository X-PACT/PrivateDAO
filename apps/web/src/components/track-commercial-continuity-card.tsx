"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { CompetitionTrackWorkspace } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { getCommercialContinuityBundle } from "@/lib/track-profile-routing";

type TrackCommercialContinuityCardProps = {
  workspace: CompetitionTrackWorkspace;
};

export function TrackCommercialContinuityCard({
  workspace,
}: TrackCommercialContinuityCardProps) {
  const searchParams = useSearchParams();
  const profile = searchParams.get("profile");
  const intake = searchParams.get("intake");

  const commercialBundle = useMemo(
    () => getCommercialContinuityBundle(workspace, profile, intake),
    [intake, profile, workspace],
  );

  if (!commercialBundle) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commercial continuity</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-3xl border border-violet-300/16 bg-violet-300/[0.08] p-4 text-sm leading-7 text-white/68">
          <div className="text-[11px] uppercase tracking-[0.28em] text-violet-100/76">
            {commercialBundle.title}
          </div>
          <div className="mt-2">{commercialBundle.summary}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          {commercialBundle.routes.map((route) => (
            <Link
              key={`${commercialBundle.title}-${route.href}`}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              href={route.href}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
