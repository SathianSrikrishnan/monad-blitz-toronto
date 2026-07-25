export type Purchase = {
  id: string;
  tool: string;
  priceMicros: bigint;
};

export type Policy = {
  totalMicros: bigint;
  perCallMicros: bigint;
  spentMicros: bigint;
};

export type BlockReason = "PER_CALL_LIMIT" | "TOTAL_BUDGET";

export type Decision =
  | { allowed: true; remainingAfterMicros: bigint }
  | { allowed: false; reason: BlockReason };

export function decidePurchase(
  purchase: Purchase,
  policy: Policy,
): Decision {
  if (purchase.priceMicros > policy.perCallMicros) {
    return { allowed: false, reason: "PER_CALL_LIMIT" };
  }

  const remaining = policy.totalMicros - policy.spentMicros;

  if (purchase.priceMicros > remaining) {
    return { allowed: false, reason: "TOTAL_BUDGET" };
  }

  return {
    allowed: true,
    remainingAfterMicros: remaining - purchase.priceMicros,
  };
}

export function reserveAllowedPurchases(
  purchases: Purchase[],
  policy: Policy,
) {
  const allowed: Purchase[] = [];
  const blocked: Array<{ purchase: Purchase; reason: BlockReason }> = [];
  let reservedMicros = 0n;

  for (const purchase of purchases) {
    const decision = decidePurchase(purchase, {
      ...policy,
      spentMicros: policy.spentMicros + reservedMicros,
    });

    if (decision.allowed) {
      allowed.push(purchase);
      reservedMicros += purchase.priceMicros;
    } else {
      blocked.push({ purchase, reason: decision.reason });
    }
  }

  return {
    policy,
    allowed,
    blocked,
    reservedMicros,
    remainingMicros:
      policy.totalMicros - policy.spentMicros - reservedMicros,
  };
}
