import { describe, expect, it, vi } from "vitest";

import { runAgentMission } from "./agent-runner";

const policy = {
  totalMicros: 6_000n,
  perCallMicros: 2_000n,
  spentMicros: 0n,
};

describe("runAgentMission", () => {
  it("starts three allowed purchases together and blocks the premium tool", async () => {
    let activeRequests = 0;
    let maximumActiveRequests = 0;
    const releases: Array<() => void> = [];

    const paymentFetch = vi.fn(async (url: string) => {
      activeRequests += 1;
      maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);

      await new Promise<void>((resolve) => {
        releases.push(() => {
          activeRequests -= 1;
          resolve();
        });
      });

      return new Response(JSON.stringify({ result: url }), {
        status: 200,
        headers: { "PAYMENT-RESPONSE": `receipt-${url}` },
      });
    });

    const missionPromise = runAgentMission({
      baseUrl: "http://localhost:3000",
      paymentFetch,
      policy,
    });

    await vi.waitFor(() => expect(paymentFetch).toHaveBeenCalledTimes(3));
    expect(maximumActiveRequests).toBe(3);

    releases.forEach((release) => release());
    const result = await missionPromise;

    expect(result.paid).toHaveLength(3);
    expect(result.blocked).toHaveLength(1);
    expect(result.blocked[0].purchase.id).toBe("premium");
    expect(result.spentMicros).toBe(3_000n);
    expect(result.remainingMicros).toBe(3_000n);
  });

  it("does not reduce the budget for a failed payment", async () => {
    const paymentFetch = vi.fn(async (url: string) => {
      const failed = url.endsWith("/risk-check");

      return new Response(
        JSON.stringify(failed ? { error: "unavailable" } : { result: url }),
        {
          status: failed ? 503 : 200,
          headers: failed
            ? undefined
            : { "PAYMENT-RESPONSE": `receipt-${url}` },
        },
      );
    });

    const result = await runAgentMission({
      baseUrl: "http://localhost:3000",
      paymentFetch,
      policy,
    });

    expect(result.paid).toHaveLength(2);
    expect(result.failed).toHaveLength(1);
    expect(result.spentMicros).toBe(2_000n);
    expect(result.remainingMicros).toBe(4_000n);
  });
});
