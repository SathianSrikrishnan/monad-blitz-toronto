import { NextRequest, NextResponse } from "next/server";

import { protectToolRoute } from "@/lib/x402/server";

export const runtime = "nodejs";

async function marketSearchHandler(_request: NextRequest) {
  return NextResponse.json({
    tool: "Market research",
    result: {
      market: "Autonomous software purchasing",
      signal: "Growing demand for machine-readable pricing and payment rails",
      confidence: 0.87,
    },
    generatedAt: "2026-07-25T17:00:00.000Z",
  });
}

export const GET = protectToolRoute(
  marketSearchHandler,
  {
    description: "Synthetic market research for the AgentTab demo",
    amountMicros: 1_000n,
  },
);
