import { NextRequest, NextResponse } from "next/server";

import { protectToolRoute } from "@/lib/x402/server";

export const runtime = "nodejs";

async function premiumForecastHandler(_request: NextRequest) {
  return NextResponse.json({
    tool: "Premium forecast",
    result: {
      forecast: "This result should never be purchased during the demo.",
    },
  });
}

export const GET = protectToolRoute(premiumForecastHandler, {
  description: "Premium forecast intentionally priced above policy",
  amountMicros: 3_000n,
});
