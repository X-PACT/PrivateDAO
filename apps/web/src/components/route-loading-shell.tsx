import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RouteLoadingShellProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RouteLoadingShell({
  eyebrow,
  title,
  description,
}: RouteLoadingShellProps) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.94),rgba(7,11,23,0.98))]">
        <CardHeader className="space-y-4">
          <div className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">
            {eyebrow}
          </div>
          <CardTitle className="text-3xl sm:text-4xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
            {description}
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Preparing wallet-aware controls",
              "Loading live Devnet context",
              "Attaching proof and action rails",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-5 text-sm text-white/70"
              >
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
