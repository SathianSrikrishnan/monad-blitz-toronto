import { describe, expect, it } from "vitest";

import { createReceiptHash } from "./registry";

describe("createReceiptHash", () => {
  it("creates a deterministic receipt fingerprint", () => {
    const first = createReceiptHash(["receipt-a", "receipt-b"]);
    const second = createReceiptHash(["receipt-a", "receipt-b"]);

    expect(first).toBe(second);
    expect(first).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("rejects an empty payment batch", () => {
    expect(() => createReceiptHash([])).toThrow(
      "At least one payment receipt is required",
    );
  });
});
