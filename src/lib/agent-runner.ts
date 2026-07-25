import {
  reserveAllowedPurchases,
  type BlockReason,
  type Policy,
  type Purchase,
} from "./policy";

export type MissionPurchase = Purchase & { endpoint: string };

export type PaymentFetch = (
  url: string,
  init?: RequestInit,
) => Promise<Response>;

const missionPurchases: MissionPurchase[] = [
  {
    id: "market",
    tool: "Market research",
    priceMicros: 1_000n,
    endpoint: "/api/tools/market-search",
  },
  {
    id: "sentiment",
    tool: "Sentiment analysis",
    priceMicros: 1_000n,
    endpoint: "/api/tools/sentiment-check",
  },
  {
    id: "risk",
    tool: "Risk check",
    priceMicros: 1_000n,
    endpoint: "/api/tools/risk-check",
  },
  {
    id: "premium",
    tool: "Premium forecast",
    priceMicros: 3_000n,
    endpoint: "/api/tools/premium-forecast",
  },
];

type PaidResult = {
  purchase: MissionPurchase;
  data: unknown;
  paymentReceipt: string;
};

type FailedResult = {
  purchase: MissionPurchase;
  error: string;
};

export async function runAgentMission({
  baseUrl,
  paymentFetch,
  policy,
}: {
  baseUrl: string;
  paymentFetch: PaymentFetch;
  policy: Policy;
}) {
  const proposed = reserveAllowedPurchases(missionPurchases, policy);
  const allowed = proposed.allowed as MissionPurchase[];
  const startedAt = Date.now();

  const settlements = await Promise.allSettled(
    allowed.map(async (purchase): Promise<PaidResult> => {
      const response = await paymentFetch(
        new URL(purchase.endpoint, baseUrl).toString(),
      );

      if (!response.ok) {
        throw new Error(`Tool returned HTTP ${response.status}`);
      }

      const paymentReceipt = response.headers.get("PAYMENT-RESPONSE");

      if (!paymentReceipt) {
        throw new Error("Paid response did not include a payment receipt");
      }

      return {
        purchase,
        data: await response.json(),
        paymentReceipt,
      };
    }),
  );

  const paid: PaidResult[] = [];
  const failed: FailedResult[] = [];

  settlements.forEach((settlement, index) => {
    const purchase = allowed[index];

    if (settlement.status === "fulfilled") {
      paid.push(settlement.value);
      return;
    }

    failed.push({
      purchase,
      error:
        settlement.reason instanceof Error
          ? settlement.reason.message
          : "Unknown payment failure",
    });
  });

  const spentMicros = paid.reduce(
    (total, result) => total + result.purchase.priceMicros,
    0n,
  );

  return {
    paid,
    failed,
    blocked: proposed.blocked as Array<{
      purchase: MissionPurchase;
      reason: BlockReason;
    }>,
    spentMicros,
    remainingMicros: policy.totalMicros - policy.spentMicros - spentMicros,
    elapsedMs: Date.now() - startedAt,
  };
}
