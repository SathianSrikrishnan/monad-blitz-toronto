import { isAddress, isHex, type Address, type Hex } from "viem";

const MONAD_TESTNET_CHAIN_ID = 10143;

type Environment = Record<string, string | undefined>;

export type AgentTabConfig = {
  chainId: typeof MONAD_TESTNET_CHAIN_ID;
  rpcUrl: string;
  explorerUrl: string;
  usdcAddress: Address;
  facilitatorUrl: string;
  payToAddress: Address;
  ownerAddress: Address;
  agentAddress: Address;
  registryAddress: Address;
  agentPrivateKey: Hex;
  totalBudgetMicros: bigint;
  perCallLimitMicros: bigint;
};

function required(env: Environment, name: string): string {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function address(env: Environment, name: string): Address {
  const value = required(env, name);

  if (!isAddress(value)) {
    throw new Error(`${name} must be a valid EVM address`);
  }

  return value;
}

function privateKey(env: Environment, name: string): Hex {
  const value = required(env, name);

  if (!isHex(value) || value.length !== 66) {
    throw new Error(`${name} must be a 32-byte hexadecimal private key`);
  }

  return value;
}

function url(env: Environment, name: string): string {
  const value = required(env, name);
  const parsed = new URL(value);

  if (parsed.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS`);
  }

  return parsed.toString();
}

function usdcMicros(env: Environment, name: string): bigint {
  const value = required(env, name);

  if (!/^\d+(?:\.\d{1,6})?$/.test(value)) {
    throw new Error(`${name} must be a positive USDC amount`);
  }

  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, "0"));
}

export function loadConfig(env: Environment = process.env): AgentTabConfig {
  const chainId = Number(required(env, "NEXT_PUBLIC_MONAD_CHAIN_ID"));

  if (chainId !== MONAD_TESTNET_CHAIN_ID) {
    throw new Error("AgentTab only supports Monad Testnet (chain ID 10143)");
  }

  const totalBudgetMicros = usdcMicros(env, "DEMO_TOTAL_BUDGET_USDC");
  const perCallLimitMicros = usdcMicros(env, "DEMO_PER_CALL_LIMIT_USDC");

  if (totalBudgetMicros <= 0n || perCallLimitMicros <= 0n) {
    throw new Error("Demo budget values must be greater than zero");
  }

  if (perCallLimitMicros > totalBudgetMicros) {
    throw new Error("Per-call limit cannot exceed the total budget");
  }

  return {
    chainId: MONAD_TESTNET_CHAIN_ID,
    rpcUrl: url(env, "NEXT_PUBLIC_MONAD_RPC_URL"),
    explorerUrl: url(env, "NEXT_PUBLIC_MONAD_EXPLORER_URL"),
    usdcAddress: address(env, "NEXT_PUBLIC_MONAD_USDC_ADDRESS"),
    facilitatorUrl: url(env, "X402_FACILITATOR_URL"),
    payToAddress: address(env, "PAY_TO_ADDRESS"),
    ownerAddress: address(env, "OWNER_ADDRESS"),
    agentAddress: address(env, "AGENT_ADDRESS"),
    registryAddress: address(env, "AGENT_BUDGET_REGISTRY_ADDRESS"),
    agentPrivateKey: privateKey(env, "AGENT_PRIVATE_KEY"),
    totalBudgetMicros,
    perCallLimitMicros,
  };
}
