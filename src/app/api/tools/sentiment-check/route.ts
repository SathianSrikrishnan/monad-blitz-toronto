import { NextRequest, NextResponse } from "next/server";

import { protectToolRoute } from "@/lib/x402/server";

export const runtime = "nodejs";

async function sentimentCheckHandler(_request: NextRequest) {
  return NextResponse.json({
    tool: "Sentiment analysis",
    result: {
      topic: "Autonomous agent commerce",
      sentiment: "Positive",
      score: 0.78,
      sampleSize: 1240,
    },
    generatedAt: "2026-07-25T17:00:00.000Z",
  });
}

export const GET = protectToolRoute(sentimentCheckHandler, {
  description: "Synthetic sentiment analysis for the AgentTab demo",
  amountMicros: 1_000n,
});
