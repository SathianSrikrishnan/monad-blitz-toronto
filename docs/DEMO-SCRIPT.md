# AgentTab — 90-second demo

## Three-minute live presentation

### 0:00–0:30 — The problem

“AI agents can already buy data and software. But we should not give an
autonomous agent an unlimited wallet. AgentTab is a corporate card for AI: the
human sets the allowance, and the agent can operate inside it.”

### 0:30–0:55 — Show the rules

“This public policy gives one agent a 0.030 USDC budget, a 0.002 maximum for any
single purchase, and an expiry time. These rules are visible on Monad Testnet.”

### 0:55–1:40 — Run the live demo

“The agent wants four digital services. Three cost 0.001 USDC each. The premium
forecast costs 0.003, which is above the limit.”

Click **Run agent**.

“The three allowed requests start together and settle through x402. The
expensive request is blocked before payment. No human had to approve the safe
purchases one by one.”

### 1:40–2:20 — Show the proof

Open the Monad explorer receipt.

“The smart contract is the public rulebook and receipt book. It records who the
agent is, its budget and limits, and the cryptographic receipt for what was
completed.”

### 2:20–2:45 — Why Monad

“One useful agent may make thousands of tiny purchases. Monad combines EVM
compatibility with fast blocks, high throughput, low fees, and a parallel
execution architecture. That makes this kind of machine-scale payment traffic
practical.”

### 2:45–3:00 — Honest limitation and close

“This MVP does not yet hold the money inside the contract. The next version is a
smart-account vault where the rules directly control the funds. AgentTab is the
corporate card for autonomous agents: fast enough for software, bounded enough
for humans.”

## 60-second backup recording

Prepare the presenter code before recording so the input is already masked.

“AI agents can buy software and data, but giving an autonomous agent an
unlimited wallet is unsafe. AgentTab gives it a small allowance with public
rules.

Here the agent has a 0.030 USDC budget, a 0.002 per-purchase limit, and an expiry.
It wants four digital services. Three are inside the rules; the premium forecast
is too expensive.

I run the agent once. The three approved x402 requests start together and settle
on Monad. The expensive request is blocked before payment. The smart contract
then records the completed batch and updated spending.

Monad’s fast blocks, low fees, EVM compatibility, and parallel execution
architecture make thousands of small agent payments practical. AgentTab is the
corporate card for autonomous agents: fast enough for software, bounded enough
for humans.”

## The problem

AI agents can buy software and data, but giving an agent an unlimited wallet is
unsafe. AgentTab gives it a small, visible allowance with rules.

## The demo

1. Point to the contract policy: **0.030 USDC total**, **0.002 maximum per
   purchase**, and a 24-hour expiry. The larger Testnet allowance gives us ten
   complete demo runs without changing the rules for any individual purchase.
2. Point to the mission. The Agent wants four services.
3. Click **Run agent**.
4. Three 0.001 USDC purchase requests run concurrently through x402 and settle
   rapidly on Monad.
5. The 0.003 premium forecast is blocked before payment because it exceeds the
   per-purchase limit.
6. Open the on-chain receipt. Monad publicly confirms the completed payment
   batch and updated budget.

## Why this is useful

The same pattern works for research agents, trading assistants, customer support
agents, and any software that needs to buy APIs without getting unlimited access
to a human's wallet.

## Why Monad

One agent may make thousands of tiny independent purchases. Monad's EVM
compatibility makes the smart contract familiar, while its fast blocks, high
throughput, parallel execution architecture, and low fees make agent-scale
payment traffic practical.

## Technical answer for developers

AgentTab combines:

- an EVM smart contract for public policy and receipt accounting;
- a fail-closed local policy engine before signatures;
- EIP-3009 USDC authorizations carried over the x402 HTTP protocol;
- three concurrent payment requests; and
- a single cryptographic hash that anchors the completed batch on-chain.

## One-sentence close

AgentTab is the corporate card for autonomous agents: fast enough for software,
bounded enough for humans.
