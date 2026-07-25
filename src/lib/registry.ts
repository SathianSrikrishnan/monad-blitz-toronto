import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  stringToHex,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";

const registryAbi = [
  {
    type: "function",
    name: "totalBudget",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "perPurchaseLimit",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "spent",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "expiresAt",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "recordBatch",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amounts", type: "uint256[]" },
      { name: "receiptHash", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;

export type RegistryConfig = {
  rpcUrl: string;
  registryAddress: Address;
  agentPrivateKey: Hex;
};

export function createReceiptHash(receipts: string[]): Hex {
  if (receipts.length === 0) {
    throw new Error("At least one payment receipt is required");
  }

  return keccak256(stringToHex(receipts.join("|")));
}

export function createBudgetRegistry(config: RegistryConfig) {
  const transport = http(config.rpcUrl);
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport,
  });
  const account = privateKeyToAccount(config.agentPrivateKey);
  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport,
  });

  return {
    agentAddress: account.address,

    async readPolicy() {
      const [
        totalMicros,
        perCallMicros,
        spentMicros,
        expiresAt,
        paused,
      ] = await Promise.all([
        publicClient.readContract({
          address: config.registryAddress,
          abi: registryAbi,
          functionName: "totalBudget",
        }),
        publicClient.readContract({
          address: config.registryAddress,
          abi: registryAbi,
          functionName: "perPurchaseLimit",
        }),
        publicClient.readContract({
          address: config.registryAddress,
          abi: registryAbi,
          functionName: "spent",
        }),
        publicClient.readContract({
          address: config.registryAddress,
          abi: registryAbi,
          functionName: "expiresAt",
        }),
        publicClient.readContract({
          address: config.registryAddress,
          abi: registryAbi,
          functionName: "paused",
        }),
      ]);

      return {
        totalMicros,
        perCallMicros,
        spentMicros,
        expiresAt,
        paused,
      };
    },

    async recordBatch(amounts: bigint[], paymentReceipts: string[]) {
      const receiptHash = createReceiptHash(paymentReceipts);
      const transactionHash = await walletClient.writeContract({
        address: config.registryAddress,
        abi: registryAbi,
        functionName: "recordBatch",
        args: [amounts, receiptHash],
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      if (receipt.status !== "success") {
        throw new Error("Budget registry transaction reverted");
      }

      return {
        receiptHash,
        transactionHash,
        blockNumber: receipt.blockNumber,
      };
    },
  };
}
