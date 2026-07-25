# AgentTab Design

## Product

AgentTab is a small control layer between an AI agent and paid internet services. A human defines a total budget and per-purchase limit. The agent receives a mission, discovers four x402-priced tools, buys three allowed tools in parallel, and refuses one purchase outside policy.

The demo mission uses synthetic business tools so the value is obvious without private data: a market search, a sentiment check, a risk check, and a premium forecast. Three inexpensive tools are purchased in parallel. The premium tool costs more than the allowed per-call limit and is blocked.

## Architecture

The application is one Next.js project plus a small Solidity `AgentBudgetRegistry` contract deployed on Monad Testnet. The contract publishes the owner, authorized agent, total budget, per-purchase limit, and expiry. After successful payments, the app records the completed batch and receipt hash in the contract's audit trail.

Server routes expose x402-protected tool endpoints. A server-side agent runner holds a disposable Testnet key, checks each proposed purchase against the registered policy, and calls the allowed endpoints with an x402-aware client. The merchant receives Testnet USDC through Monad's facilitator.

The registry makes the policy and audit trail public and tamper-evident. It does not custody funds or make bypass impossible because standard x402 payments still use the agent wallet's signature. The interface and pitch must say this plainly. A future version can use smart-account session keys or an onchain allowance module for cryptographic enforcement.

The dashboard shows the mission, registered limits, proposed purchases, policy decisions, completed results, remaining budget, timing, contract address, and transaction links. The speed demonstration launches three independent allowed purchases together and measures the full burst. A fourth, over-limit purchase is blocked before payment.

## Failure behavior

- Missing secrets: fail closed and show setup status.
- Wrong network or unfunded wallet: show a plain-language recovery message.
- Tool price above policy: block before signing or settlement.
- Facilitator or RPC failure: keep the budget unchanged and show which step failed.
- Duplicate payment response: do not count it twice.

## Testing

Unit tests cover budget math, per-call rejection, total-budget rejection, and failed-payment accounting. Route tests cover the initial `402 Payment Required` challenge and successful paid response. The final proof uses disposable Testnet wallets and a clean browser.
