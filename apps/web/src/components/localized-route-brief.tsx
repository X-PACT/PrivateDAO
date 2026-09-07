"use client";

import { useI18n } from "@/components/i18n-provider";

type LocalizedRouteBriefProps = {
  routeKey: "security" | "products" | "learn" | "servicesStarter" | "servicesCore" | "community" | "story";
};

export function LocalizedRouteBrief({ routeKey }: LocalizedRouteBriefProps) {
  const { copy } = useI18n();
  const brief = copy.routeBriefs[routeKey];

  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
      <div className="text-[11px] uppercase tracking-[0.28em] text-white/42">{brief.eyebrow}</div>
      <h2 className="mt-3 max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">{brief.title}</h2>
      <p className="mt-4 max-w-4xl text-sm leading-7 text-white/64">{brief.description}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {brief.bullets.map((bullet) => (
          <div key={bullet} className="rounded-[24px] border border-white/8 bg-black/20 p-5 text-sm leading-7 text-white/60">
            {bullet}
          </div>
        ))}
      </div>
    </section>
  );
}
