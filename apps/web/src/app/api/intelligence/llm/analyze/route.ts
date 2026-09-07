import { NextResponse } from "next/server";

import { getLLMProvider } from "@/lib/intelligence/llm/providers";
import type { LLMAnalysisInput, LLMProvider } from "@/lib/intelligence/llm/types";

export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LLMAnalysisInput & { providerId?: LLMProvider["id"] };
    const provider = getLLMProvider(body.providerId);
    if (provider.mode === "local" || provider.mode === "custom") {
      return NextResponse.json({
        ok: true,
        localOnly: true,
        status: await provider.status(),
        result: await provider.analyzeProposal(body),
        boundary: "Local/custom provider mode should call the user endpoint from the browser after explicit configuration.",
      });
    }

    return NextResponse.json({
      ok: true,
      status: await provider.status(),
      result: await provider.analyzeProposal(body),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "LLM analysis failed." },
      { status: 400 },
    );
  }
}
