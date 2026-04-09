import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { treasuryRows } from "@/lib/site-data";

export function TreasuryTable() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Treasury table</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-3 text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.28em] text-white/38">
              <th className="pb-2 font-medium">Asset rail</th>
              <th className="pb-2 font-medium">Allocation</th>
              <th className="pb-2 font-medium">Value</th>
              <th className="pb-2 font-medium">Policy</th>
              <th className="pb-2 font-medium">Runtime state</th>
            </tr>
          </thead>
          <tbody>
            {treasuryRows.map((row) => (
              <tr key={row.asset} className="rounded-2xl bg-white/4 text-sm text-white/75">
                <td className="rounded-l-2xl border border-white/8 px-4 py-4 font-medium text-white">{row.asset}</td>
                <td className="border-y border-white/8 px-4 py-4">{row.allocation}</td>
                <td className="border-y border-white/8 px-4 py-4">{row.value}</td>
                <td className="border-y border-white/8 px-4 py-4 text-white/55">{row.policy}</td>
                <td className="rounded-r-2xl border border-white/8 px-4 py-4">{row.runtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
