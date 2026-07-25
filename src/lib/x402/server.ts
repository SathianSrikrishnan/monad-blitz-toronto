import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { withX402, x402ResourceServer } from "@x402/next";
import type { NextRequest, NextResponse } from "next/server";
import { isAddress, type Address } from "viem";

export const MONAD_TESTNET_NETWORK = "eip155:10143";
export const MONAD_TESTNET_USDC = {
  address: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
  name: "USDC",
  version: "2",
} as const;

export type X402ResourceConfig = {
  facilitatorUrl: string;
  payToAddress: Address;
};

export function loadX402ResourceConfig(
  env: Record<string, string | undefined> = process.env,
): X402ResourceConfig {
  const facilitatorUrl = env.X402_FACILITATOR_URL?.trim();
  const payToAddress = env.PAY_TO_ADDRESS?.trim();

  if (!facilitatorUrl || new URL(facilitatorUrl).protocol !== "https:") {
    throw new Error("X402_FACILITATOR_URL must be a valid HTTPS URL");
  }

  if (!payToAddress || !isAddress(payToAddress)) {
    throw new Error("PAY_TO_ADDRESS must be a valid EVM address");
  }

  return { facilitatorUrl, payToAddress };
}

export function createResourceServer(config: X402ResourceConfig) {
  const facilitator = new HTTPFacilitatorClient({
    url: config.facilitatorUrl,
  });

  return new x402ResourceServer(facilitator).register(
    MONAD_TESTNET_NETWORK,
    new ExactEvmScheme(),
  );
}

export function protectToolRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: { amountMicros: bigint; description: string },
) {
  const config = loadX402ResourceConfig();
  const server = createResourceServer(config);

  return withX402(
    handler,
    {
      accepts: {
        scheme: "exact",
        price: {
          asset: MONAD_TESTNET_USDC.address,
          amount: options.amountMicros.toString(),
          extra: {
            name: MONAD_TESTNET_USDC.name,
            version: MONAD_TESTNET_USDC.version,
          },
        },
        network: MONAD_TESTNET_NETWORK,
        payTo: config.payToAddress,
      },
      description: options.description,
      mimeType: "application/json",
    },
    server,
  );
}
