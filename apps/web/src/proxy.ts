import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

const legacyRedirects: Record<string, string> = {
  "/judge": "/trust",
  "/judges": "/trust",
  "/judge-ai": "/trust",
  "/review": "/trust",
  "/reviewer": "/trust",
  "/awards": "/story",
  "/colosseum": "/story",
  "/frontier": "/products",
  "/submission": "/products",
  "/tracks": "/products",
  "/demo": "/try",
  "/dao-ui-template": "/govern",
  "/governance-template": "/govern",
  "/payment-template": "/treasury",
  "/runtime-template": "/developers",
  "/wallet-template": "/try",
  "/whiteprint": "/whitepaper",
  "/rpc-services": "/developers",
  "/api-status": "/trust",
  "/diagnostics": "/trust",
  "/command-center": "/treasury",
  "/network": "/developers",
  "/android": "/products",
  "/benefit": "/pricing",
  "/versus": "/products",
  "/revenue": "/pricing",
  "/services": "/pricing",
  "/engage": "/pilots",
  "/analytics": "/govern",
  "/custody": "/trust",
  "/live": "/govern",
  "/execute": "/treasury",
  "/txline-settlement": "/treasury",
  "/services/umbra-private-payments": "/treasury",
  "/services/devnet-billing-rehearsal": "/pricing",
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  const destination = legacyRedirects[pathname];
  if (destination) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = destination;
    return NextResponse.redirect(redirectUrl, 308);
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
