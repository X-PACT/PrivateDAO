import { topMetrics } from "@/lib/site-data";

export function MetricsStrip() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {topMetrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(11,16,31,0.9),rgba(7,10,22,0.96))] px-5 py-6"
        >
          <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/68">{metric.label}</div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-white">{metric.value}</div>
          <p className="mt-3 text-sm leading-7 text-white/56">{metric.detail}</p>
        </div>
      ))}
    </div>
  );
}
