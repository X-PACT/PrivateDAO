import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { timelineEvents } from "@/lib/site-data";

export function VoteTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vote timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={event.title} className="grid grid-cols-[24px_1fr] gap-4">
            <div className="flex flex-col items-center">
              <div className="mt-1 h-3 w-3 rounded-full bg-[linear-gradient(135deg,#14f195,#9945ff)]" />
              {index < timelineEvents.length - 1 ? <div className="mt-2 h-full w-px bg-white/10" /> : null}
            </div>
            <div className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-white">{event.title}</div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/80">{event.state}</div>
              </div>
              <p className="mt-2 text-sm leading-7 text-white/58">{event.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
