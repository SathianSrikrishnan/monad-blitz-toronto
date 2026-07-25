import { describe, expect, it } from "vitest";

import { loadConfig } from "./config";

const validEnv = {
  NEXT_PUBLIC_MONAD_CHAIN_ID: "10143",
  NEXT_PUBLIC_MONAD_RPC_URL: "https://testnet-rpc.monad.xyz/",
  NEXT_PUBLIC_MONAD_EXPLORER_URL: "https://testnet.monadscan.com",
  NEXT_PUBLIC_MONAD_USDC_ADDRESS:
    "0x534b2f3A21130d7a60830c2Df862319e593943A3",
  X402_FACILITATOR_URL: "https://x402-facilitator.molandak.org",
  PAY_TO_ADDRESS: "0x1111111111111111111111111111111111111111",
  OWNER_ADDRESS: "0x2222222222222222222222222222222222222222",
  AGENT_ADDRESS: "0x3333333333333333333333333333333333333333",
  AGENT_BUDGET_REGISTRY_ADDRESS:
    "0x4444444444444444444444444444444444444444",
  AGENT_PRIVATE_KEY:
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  DEMO_TOTAL_BUDGET_USDC: "0.006",
  DEMO_PER_CALL_LIMIT_USDC: "0.002",
};

describe("loadConfig", () => {
  it("accepts a complete Monad Testnet configuration", () => {
    const config = loadConfig(validEnv);

    expect(config.chainId).toBe(10143);
    expect(config.totalBudgetMicros).toBe(6000n);
    expect(config.perCallLimitMicros).toBe(2000n);
  });

  it("rejects Monad mainnet", () => {
    expect(() =>
      loadConfig({ ...validEnv, NEXT_PUBLIC_MONAD_CHAIN_ID: "143" }),
    ).toThrow("Monad Testnet");
  });

  it("rejects a missing agent key", () => {
    expect(() =>
      loadConfig({ ...validEnv, AGENT_PRIVATE_KEY: "" }),
    ).toThrow("AGENT_PRIVATE_KEY");
  });

  it("rejects malformed addresses", () => {
    expect(() =>
      loadConfig({ ...validEnv, PAY_TO_ADDRESS: "not-an-address" }),
    ).toThrow("PAY_TO_ADDRESS");
  });
});
