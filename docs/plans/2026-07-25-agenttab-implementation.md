# AgentTab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a live Monad Testnet demo where a disposable agent makes three parallel x402 tool purchases within budget, blocks one over-policy purchase, and records the policy and completed batch through a deployed Solidity contract.

**Architecture:** A Next.js application hosts the dashboard, four paid tool routes, a server-side policy engine, and an x402-aware agent runner. A small `AgentBudgetRegistry` contract on Monad Testnet publishes the policy and records a receipt hash after a successful batch. The agent private key remains server-side; Monad Testnet USDC payments settle through the official facilitator path.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Vitest, Solidity, Foundry or Hardhat, viem, `@x402/core`, `@x402/evm`, `@x402/fetch`, `@x402/next`, Monad Testnet, Vercel.

---

### Task 1: Create the fresh application

**Files:**
- Create through scaffold: `package.json`, `src/app/*`, `tsconfig.json`
- Preserve: `README.md`, `AGENTS.md`, `.env.example`, `.gitignore`, `docs/plans/*`

**Steps:**

1. Scaffold a Next.js TypeScript application in the existing folder without overwriting project documents.
2. Install Vitest, Testing Library, viem, wagmi, and the four x402 v2 packages.
3. Add scripts for `test`, `typecheck`, and `build`.
4. Run the untouched starter build.
5. Commit: `chore: scaffold fresh AgentTab app`.

**Verification:**

```powershell
npm run typecheck
npm run build
```

Expected: both exit successfully.

### Task 2: Add verified network configuration

**Files:**
- Create: `src/lib/config.ts`
- Create: `src/lib/config.test.ts`
- Create locally: `.env.local`

**Steps:**

1. Write a failing test that rejects mainnet chain ID `143`, missing agent keys, and malformed addresses.
2. Run the test and confirm failure.
3. Implement typed Testnet configuration using chain ID `10143`, Testnet USDC, RPC, explorer, facilitator, merchant address, and agent key.
4. Run the test and confirm it passes.
5. Add the real disposable values only to `.env.local`.
6. Commit: `feat: add fail-closed Monad Testnet configuration`.

### Task 3: Build and deploy the budget registry

**Files:**
- Create: `contracts/AgentBudgetRegistry.sol`
- Create: `test/AgentBudgetRegistry.t.sol` or equivalent
- Create: `script/DeployAgentBudgetRegistry.s.sol` or equivalent

**Required behavior:**

1. Store the owner, authorized agent, total budget, per-purchase limit, and expiry.
2. Expose a read-only policy check.
3. Reject unauthorized writers, expired policies, over-limit purchases, and total-budget overflow.
4. Record successful batches with amount, count, and receipt hash.
5. Emit events suitable for the dashboard and explorer.

**Steps:**

1. Write failing contract tests for the required behavior.
2. Implement the smallest non-custodial registry.
3. Run the contract tests.
4. Deploy to Monad Testnet from the disposable owner account.
5. Save the public contract address and deployment transaction.
6. Commit: `feat: deploy AgentTab budget registry`.

### Task 4: Build the application policy engine

**Files:**
- Create: `src/lib/policy.ts`
- Create: `src/lib/policy.test.ts`

**Required behavior:**

```ts
type Purchase = { id: string; tool: string; priceMicros: bigint };
type Policy = { totalMicros: bigint; perCallMicros: bigint; spentMicros: bigint };
type Decision =
  | { allowed: true; remainingAfterMicros: bigint }
  | { allowed: false; reason: "PER_CALL_LIMIT" | "TOTAL_BUDGET" };
```

**Steps:**

1. Test a purchase below both limits.
2. Test a purchase above the per-call limit.
3. Test a purchase that exceeds remaining total budget.
4. Test that failed payments do not reduce the budget.
5. Implement the smallest pure decision function.
6. Run all policy tests.
7. Commit: `feat: enforce bounded agent purchases`.

### Task 5: Prove one x402 payment end to end

**Files:**
- Create: `src/lib/x402/server.ts`
- Create: `src/lib/x402/client.ts`
- Create: `src/app/api/tools/market-search/route.ts`
- Create: `src/app/api/tools/market-search/route.test.ts`

**Steps:**

1. Write a route test expecting an unpaid request to return HTTP `402`.
2. Configure the server for Monad Testnet, Testnet USDC, the disposable merchant address, and the facilitator.
3. Return a deterministic synthetic market-search result only after payment.
4. Configure the disposable agent signer server-side.
5. Fund the agent with sanctioned Testnet MON and USDC.
6. Execute one paid request and capture the settlement response and explorer URL.
7. Commit: `feat: prove x402 payment on Monad Testnet`.

**Kill switch:** If the official x402 path cannot complete within 30 focused minutes, record the exact failure and evaluate `@monad-crypto/mpp` as the fallback. Do not silently simulate payment.

### Task 6: Add the parallel mission

**Files:**
- Create: `src/app/api/tools/risk-check/route.ts`
- Create: `src/app/api/tools/sentiment-check/route.ts`
- Create: `src/app/api/tools/premium-forecast/route.ts`
- Create: `src/lib/agent-runner.ts`
- Create: `src/lib/agent-runner.test.ts`
- Create: `src/app/api/agent/run/route.ts`

**Steps:**

1. Test that three allowed tools start together.
2. Test that the premium forecast is blocked before payment.
3. Test that successful settlements reduce remaining budget exactly once.
4. Test that a failed settlement does not reduce the budget.
5. Implement `Promise.allSettled` for allowed purchases.
6. Record the successful batch receipt hash in the registry contract.
7. Return tool results, decisions, timing, remaining budget, contract state, and explorer links.
8. Commit: `feat: run bounded x402 purchases in parallel`.

### Task 7: Build the demo dashboard

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/budget-card.tsx`
- Create: `src/components/purchase-lane.tsx`
- Create: `src/components/receipt-card.tsx`

**Steps:**

1. Show the human-set total and per-call limits.
2. Add one `Run agent mission` action.
3. Animate the three allowed purchases as parallel lanes.
4. Show the premium tool as blocked with a plain-English reason.
5. Show elapsed time, remaining budget, and explorer links.
6. Verify responsive behavior at phone and laptop widths.
7. Commit: `feat: add AgentTab mission dashboard`.

### Task 8: Verify and deploy

**Steps:**

1. Run the complete test suite.
2. Run typecheck and production build.
3. Scan the repository for secrets and private keys.
4. Create a new public GitHub repository named `agenttab-monad`.
5. Push the fresh history.
6. Create a standalone Vercel project.
7. Add secrets through Vercel environment settings.
8. Deploy and test the live URL from a clean browser.
9. Commit any deployment-only fixes.

**Verification:**

```powershell
npm test
npm run typecheck
npm run build
git grep -n -E "0x[0-9a-fA-F]{64}|seed phrase|mnemonic"
```

Expected: tests, typecheck, and build pass; the secret scan finds no real credential.

### Task 9: Package the submission and pitch

**Files:**
- Modify: `README.md`
- Create: `docs/demo-script.md`
- Create: `docs/submission.md`
- Create: `public/agenttab-cover.png`

**Steps:**

1. Add the live URL, architecture, safety model, Testnet proof, and limitations to the README.
2. Prepare the required image, title, short description, GitHub URL, and demo URL.
3. Record a local backup demo.
4. Rehearse a three-minute presentation twice.
5. Verify every submitted link from a clean browser.
6. Stop coding at the onsite freeze.
