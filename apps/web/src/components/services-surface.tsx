"use client";

import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { commercialServices, servicesJourney } from "@/lib/site-data";

export function ServicesSurface() {
  const { copy } = useI18n();
  const content = copy.pageContent.servicesSurface;
  const serviceKeys = ["hostedRead", "pilot", "confidential"] as const;
  const journeyKeys = ["pilotProgram", "sla", "pricing", "trust"] as const;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>{content.commercialTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {commercialServices.map((service, index) => {
            const localizedService = content.services.find((entry) => entry.key === serviceKeys[index])!;
            return (
            <div key={localizedService.key} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-emerald-200">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <div className="text-base font-medium text-white">{localizedService.title}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">{localizedService.summary}</p>
            </div>
          )})}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{content.journeyTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {servicesJourney.map((step, index) => {
            const isInternal = step.href.startsWith("/");
            const localizedStep = content.journey.find((entry) => entry.key === journeyKeys[index])!;
            const stepContent = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="text-base font-medium text-white">{localizedStep.title}</div>
                  <ArrowUpRight className="mt-1 h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-3 text-sm leading-7 text-white/56">{localizedStep.detail}</p>
              </>
            );

            if (isInternal) {
              return (
                <Link
                  className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-emerald-300/25 hover:bg-white/6"
                  href={step.href}
                  key={step.title}
                >
                  {stepContent}
                </Link>
              );
            }

            return (
              <a
                className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-emerald-300/25 hover:bg-white/6"
                href={step.href}
                key={localizedStep.key}
                rel="noreferrer"
                target="_blank"
              >
                {stepContent}
              </a>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
