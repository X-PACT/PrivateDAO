import { topMetrics } from "@/lib/site-data";

export function MetricsStrip() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {topMetrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-[26px] border border-white/8 bg-white/[0.03] px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
        >
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">{metric.label}</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{metric.value}</div>
          <p className="mt-2 text-sm leading-7 text-white/56">{metric.detail}</p>
        </div>
      ))}
    </div>
  );
}
