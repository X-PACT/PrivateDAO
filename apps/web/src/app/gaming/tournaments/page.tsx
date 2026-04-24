"use client";

import { useState } from "react";
import Link from "next/link";

import { OperationsShell } from "@/components/operations-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tournament = {
  id: string;
  name: string;
  prizePool: number;
  endDate: string;
  status: "ongoing" | "ended";
};

export default function GamingTournamentsPage() {
  const [name, setName] = useState("");
  const [prizePool, setPrizePool] = useState("100");
  const [endDate, setEndDate] = useState("");
  const [items, setItems] = useState<Tournament[]>([]);

  function createTournament() {
    if (!name.trim() || !endDate.trim()) return;
    const next: Tournament = {
      id: `tour-${Date.now()}`,
      name: name.trim(),
      prizePool: Number(prizePool) || 0,
      endDate,
      status: "ongoing",
    };
    setItems((current) => [next, ...current]);
    setName("");
  }

  return (
    <OperationsShell
      eyebrow="Gaming tournaments"
      title="Run tournaments with governed reward distribution"
      description="Create tournaments, reserve prize pools, and push ended tournaments into governance distribution proposals."
      badges={[
        { label: "Tournaments", variant: "violet" },
        { label: "Private rewards", variant: "success" },
      ]}
    >
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="text-[11px] uppercase tracking-[0.24em] text-white/42">New Tournament</div>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tournament name"
            className="rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white"
          />
          <input
            value={prizePool}
            onChange={(event) => setPrizePool(event.target.value)}
            placeholder="Prize pool"
            className="rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white"
          />
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white"
          />
          <button type="button" onClick={createTournament} className={cn(buttonVariants({ size: "sm" }))}>
            Create & fund
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-base font-medium text-white">{item.name}</div>
                <div className="text-sm text-white/65">Prize: {item.prizePool} USDC · End: {item.endDate}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setItems((current) =>
                      current.map((entry) => (entry.id === item.id ? { ...entry, status: "ended" } : entry)),
                    )
                  }
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
                >
                  Mark ended
                </button>
                <Link href="/govern" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                  Propose distribution
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <details className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-5">
        <summary className="cursor-pointer text-sm font-medium text-cyan-100">BehindTheMagic</summary>
        <div className="mt-3 text-sm leading-7 text-white/72">
          بعد انتهاء البطولة، يتم إنشاء مقترح توزيع الجوائز في الحوكمة. بعد التصويت والتنفيذ، تتحرك المكافآت عبر مسار دفع خاص
          مع إثبات قابل للتحقق.
        </div>
      </details>
    </OperationsShell>
  );
}

