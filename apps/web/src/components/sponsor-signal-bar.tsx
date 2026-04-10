import { sponsorSignals } from "@/lib/site-data";

export function SponsorSignalBar() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sponsorSignals.map((signal) => (
        <div
          key={signal.name}
          className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,28,0.96),rgba(7,10,22,0.98))] p-5 shadow-[0_18px_55px_rgba(3,5,16,0.34)]"
        >
          <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${signal.accent}`} />
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${signal.accent}`} />
            <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/64">{signal.name}</div>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/60">{signal.summary}</p>
        </div>
      ))}
    </div>
  );
}
