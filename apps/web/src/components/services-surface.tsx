import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { commercialServices, servicesJourney } from "@/lib/site-data";

export function ServicesSurface() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>Commercial services</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {commercialServices.map((service) => (
            <div key={service.title} className="rounded-3xl border border-white/8 bg-white/4 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/8 bg-black/25 p-3 text-emerald-200">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>
                <div className="text-base font-medium text-white">{service.title}</div>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">{service.summary}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pilot and trust journey</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {servicesJourney.map((step) => (
            <a
              className="group rounded-3xl border border-white/8 bg-white/4 p-5 transition hover:border-emerald-300/25 hover:bg-white/6"
              href={step.href}
              key={step.title}
              rel="noreferrer"
              target="_blank"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-base font-medium text-white">{step.title}</div>
                <ArrowUpRight className="mt-1 h-4 w-4 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="mt-3 text-sm leading-7 text-white/56">{step.detail}</p>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
