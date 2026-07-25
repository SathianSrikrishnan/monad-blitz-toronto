import { afterEach, describe, expect, it, vi } from "vitest";
import { decodePaymentRequiredHeader } from "@x402/core/http";
import { NextRequest } from "next/server";

describe("market-search x402 route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns an x402 challenge when no payment is supplied", async () => {
    vi.stubEnv(
      "PAY_TO_ADDRESS",
      "0x2FCaF18de3Cf6A318395862D81DCD0747a157693",
    );
    vi.stubEnv(
      "X402_FACILITATOR_URL",
      "https://x402-facilitator.molandak.org",
    );

    const { GET } = await import("./route");
    const response = await GET(
      new NextRequest("http://localhost:3000/api/tools/market-search"),
    );

    expect(response.status).toBe(402);
    const paymentRequired = response.headers.get("PAYMENT-REQUIRED");
    expect(paymentRequired).toBeTruthy();

    const challenge = decodePaymentRequiredHeader(paymentRequired!);
    expect(challenge.accepts[0]?.extra).toMatchObject({
      name: "USDC",
      version: "2",
    });
  });
});
