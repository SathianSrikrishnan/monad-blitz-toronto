import { network } from "hardhat";
import { isAddress, parseUnits } from "viem";

const agentAddress = process.env.AGENT_ADDRESS;
const ownerAddress = process.env.OWNER_ADDRESS;

if (!agentAddress || !isAddress(agentAddress)) {
  throw new Error("AGENT_ADDRESS must be a valid disposable Testnet address");
}

if (!ownerAddress || !isAddress(ownerAddress)) {
  throw new Error("OWNER_ADDRESS must be a valid disposable Testnet address");
}

const totalBudget = parseUnits(
  process.env.DEMO_TOTAL_BUDGET_USDC ?? "0.006",
  6,
);
const perPurchaseLimit = parseUnits(
  process.env.DEMO_PER_CALL_LIMIT_USDC ?? "0.002",
  6,
);
const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 24 * 60 * 60);

const { viem } = await network.create({
  network: "monadTestnet",
  chainType: "l1",
});

const { contract, deploymentTransaction } =
  await viem.sendDeploymentTransaction("AgentBudgetRegistry", [
    ownerAddress,
    agentAddress,
    totalBudget,
    perPurchaseLimit,
    expiresAt,
  ]);

console.log("AgentBudgetRegistry:", contract.address);
console.log("Deployment transaction:", deploymentTransaction);
