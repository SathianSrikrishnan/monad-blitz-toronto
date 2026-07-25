import { describe, expect, it } from "vitest";

import { decidePurchase, reserveAllowedPurchases } from "./policy";

const policy = {
  totalMicros: 6_000n,
  perCallMicros: 2_000n,
  spentMicros: 0n,
};

describe("decidePurchase", () => {
  it("allows a purchase below both limits", () => {
    expect(
      decidePurchase(
        { id: "market", tool: "Market research", priceMicros: 1_000n },
        policy,
      ),
    ).toEqual({ allowed: true, remainingAfterMicros: 5_000n });
  });

  it("rejects a purchase above the per-call limit", () => {
    expect(
      decidePurchase(
        { id: "premium", tool: "Premium forecast", priceMicros: 3_000n },
        policy,
      ),
    ).toEqual({ allowed: false, reason: "PER_CALL_LIMIT" });
  });

  it("rejects a purchase above the remaining total budget", () => {
    expect(
      decidePurchase(
        { id: "risk", tool: "Risk check", priceMicros: 1_500n },
        { ...policy, spentMicros: 5_000n },
      ),
    ).toEqual({ allowed: false, reason: "TOTAL_BUDGET" });
  });
});

describe("reserveAllowedPurchases", () => {
  it("reserves three purchases and blocks the premium request", () => {
    const result = reserveAllowedPurchases(
      [
        { id: "market", tool: "Market research", priceMicros: 1_000n },
        { id: "sentiment", tool: "Sentiment analysis", priceMicros: 1_000n },
        { id: "risk", tool: "Risk check", priceMicros: 1_000n },
        { id: "premium", tool: "Premium forecast", priceMicros: 3_000n },
      ],
      policy,
    );

    expect(result.allowed.map((purchase) => purchase.id)).toEqual([
      "market",
      "sentiment",
      "risk",
    ]);
    expect(result.blocked).toEqual([
      {
        purchase: {
          id: "premium",
          tool: "Premium forecast",
          priceMicros: 3_000n,
        },
        reason: "PER_CALL_LIMIT",
      },
    ]);
    expect(result.reservedMicros).toBe(3_000n);
    expect(result.remainingMicros).toBe(3_000n);
  });

  it("does not count failed payments as spent", () => {
    const result = reserveAllowedPurchases(
      [{ id: "market", tool: "Market research", priceMicros: 1_000n }],
      policy,
    );

    expect(result.policy.spentMicros).toBe(0n);
    expect(result.reservedMicros).toBe(1_000n);
  });
});
