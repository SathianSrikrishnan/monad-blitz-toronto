import { NextRequest, NextResponse } from "next/server";

import { protectToolRoute } from "@/lib/x402/server";

export const runtime = "nodejs";

async function riskCheckHandler(_request: NextRequest) {
  return NextResponse.json({
    tool: "Risk check",
    result: {
      rating: "Low",
      score: 22,
      flags: ["New payment category", "Testnet-only demonstration"],
    },
    generatedAt: "2026-07-25T17:00:00.000Z",
  });
}

export const GET = protectToolRoute(riskCheckHandler, {
  description: "Synthetic risk assessment for the AgentTab demo",
  amountMicros: 1_000n,
});
