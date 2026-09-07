"use client";

import { useState } from "react";
import { CloudCog, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_BASE = (process.env.NEXT_PUBLIC_PRIVATE_DAO_API_BASE || "https://api.privatedao.org").replace(/\/+$/, "");

export function AmazonBedrockIntelligenceSurface() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [riskSignals, setRiskSignals] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [result, setResult] = useState<{ summary?: string; model?: string; error?: string } | null>(null);

  async function analyze() {
    setState("loading");
    setResult(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/intelligence/amazon/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          publicTitle: title,
          publicDescription: description,
          riskSignals: riskSignals.split("\n").map((value) => value.trim()).filter(Boolean),
        }),
      });
      const body = (await response.json()) as { summary?: string; model?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "Amazon AI is not available right now.");
      setResult(body);
      setState("ready");
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Amazon AI is not available right now." });
      setState("error");
    }
  }

  return (
    <section className="rounded-[28px] border border-orange-300/18 bg-orange-300/[0.07] p-6">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-orange-100/78">
        <CloudCog className="h-4 w-4" /> Amazon AI decision support
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-white">A faster review of public decision context</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
        Use Amazon Bedrock for a concise human review before approval. Only the public context you enter is sent to AWS; private records and proof material stay outside this service.
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm text-white/72">Public title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={240} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none" /></label>
          <label className="grid gap-2 text-sm text-white/72">Public description<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={4} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none" /></label>
          <label className="grid gap-2 text-sm text-white/72">Public risk signals, one per line<textarea value={riskSignals} onChange={(event) => setRiskSignals(event.target.value)} maxLength={1800} rows={3} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none" /></label>
          <button type="button" onClick={() => void analyze()} disabled={state === "loading" || !title.trim()} className={cn(buttonVariants({ size: "sm" }), "w-fit")}>{state === "loading" ? "Reviewing..." : "Review with Amazon AI"}</button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white"><ShieldCheck className="h-4 w-4 text-emerald-200" /> Privacy boundary</div>
          <p className="mt-3 text-sm leading-7 text-white/60">The gateway rejects private inputs, witness data, credentials, hidden votes, encrypted contents, and wallet keys before any AWS call.</p>
          {result ? <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/76"><div className="whitespace-pre-wrap">{result.summary || result.error}</div>{result.model ? <div className="mt-3 text-xs text-white/42">Model: {result.model}</div> : null}</div> : <div className="mt-4 text-sm text-white/42">Your review will appear here.</div>}
        </div>
      </div>
    </section>
  );
}
