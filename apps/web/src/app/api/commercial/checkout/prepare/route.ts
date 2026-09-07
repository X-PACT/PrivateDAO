import { NextResponse } from "next/server";

import {
  buildCommercialCheckout,
  type CommercialLicenseType,
  type CommercialPaymentAsset,
} from "@/lib/commercial-readiness";

export const dynamic = "force-static";

type PrepareBody = {
  plan?: CommercialLicenseType;
  asset?: CommercialPaymentAsset;
  organizationName?: string;
  organizationId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PrepareBody;
    const checkout = buildCommercialCheckout({
      plan: body.plan ?? "PROFESSIONAL",
      asset: body.asset ?? "USDC_SOL",
      organizationName: body.organizationName,
      organizationId: body.organizationId,
    });

    return NextResponse.json(
      {
        ok: true,
        checkout,
        nextStep: "Send the selected asset to the treasury address, then submit the transaction hash for verification.",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to prepare commercial checkout.",
      },
      { status: 400 },
    );
  }
}
