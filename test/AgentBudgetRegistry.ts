import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { keccak256, stringToHex } from "viem";

describe("AgentBudgetRegistry", async function () {
  const { viem } = await network.create();
  const wallets = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  const testClient = await viem.getTestClient();
  const [owner, agent, outsider] = wallets;

  async function deploy(expiresAt?: bigint) {
    const currentBlock = await publicClient.getBlock();

    return viem.deployContract("AgentBudgetRegistry", [
      owner.account.address,
      agent.account.address,
      6_000n,
      2_000n,
      expiresAt ?? currentBlock.timestamp + 3_600n,
    ], {
      client: { wallet: agent },
    });
  }

  it("publishes the owner, agent, and spending limits", async function () {
    const registry = await deploy();

    assert.equal(
      (await registry.read.owner()).toLowerCase(),
      owner.account.address.toLowerCase(),
    );
    assert.equal(
      (await registry.read.agent()).toLowerCase(),
      agent.account.address.toLowerCase(),
    );
    assert.equal(await registry.read.totalBudget(), 6_000n);
    assert.equal(await registry.read.perPurchaseLimit(), 2_000n);
  });

  it("records an authorized batch and prevents duplicate receipts", async function () {
    const registry = await deploy();
    const receiptHash = keccak256(stringToHex("three-x402-receipts"));
    const agentRegistry = await viem.getContractAt(
      "AgentBudgetRegistry",
      registry.address,
      { client: { wallet: agent } },
    );

    await agentRegistry.write.recordBatch([
      [1_000n, 1_000n, 1_000n],
      receiptHash,
    ]);

    assert.equal(await registry.read.spent(), 3_000n);
    assert.equal(await registry.read.recordedReceipts([receiptHash]), true);

    await assert.rejects(
      agentRegistry.write.recordBatch([[1_000n], receiptHash]),
    );
  });

  it("rejects unauthorized, over-limit, expired, and over-budget writes", async function () {
    const registry = await deploy();
    const outsiderRegistry = await viem.getContractAt(
      "AgentBudgetRegistry",
      registry.address,
      { client: { wallet: outsider } },
    );
    const agentRegistry = await viem.getContractAt(
      "AgentBudgetRegistry",
      registry.address,
      { client: { wallet: agent } },
    );

    await assert.rejects(
      outsiderRegistry.write.recordBatch([
        [1_000n],
        keccak256(stringToHex("unauthorized")),
      ]),
    );
    await assert.rejects(
      agentRegistry.write.recordBatch([
        [2_001n],
        keccak256(stringToHex("over-limit")),
      ]),
    );

    await agentRegistry.write.recordBatch([
      [2_000n, 2_000n, 1_000n],
      keccak256(stringToHex("first-batch")),
    ]);
    await assert.rejects(
      agentRegistry.write.recordBatch([
        [1_001n],
        keccak256(stringToHex("over-budget")),
      ]),
    );

    const currentBlock = await publicClient.getBlock();
    const expiredRegistry = await deploy(currentBlock.timestamp + 10n);
    const expiredAgentRegistry = await viem.getContractAt(
      "AgentBudgetRegistry",
      expiredRegistry.address,
      { client: { wallet: agent } },
    );
    await testClient.increaseTime({ seconds: 11 });
    await testClient.mine({ blocks: 1 });
    await assert.rejects(
      expiredAgentRegistry.write.recordBatch([
        [1_000n],
        keccak256(stringToHex("expired")),
      ]),
    );
  });
});
