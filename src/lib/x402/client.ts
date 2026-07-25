import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { isHex, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { MONAD_TESTNET_NETWORK } from "./server";

export function createPaymentFetch(agentPrivateKey: Hex) {
  if (!isHex(agentPrivateKey) || agentPrivateKey.length !== 66) {
    throw new Error("Agent private key must be a 32-byte hexadecimal value");
  }

  const account = privateKeyToAccount(agentPrivateKey);

  return wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [
      {
        network: MONAD_TESTNET_NETWORK,
        client: new ExactEvmScheme(account),
      },
    ],
  });
}
