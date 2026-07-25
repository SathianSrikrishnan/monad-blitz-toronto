# AgentTab

AgentTab is a payment firewall for autonomous AI agents.

A human creates a public spending policy: total budget, per-purchase limit,
approved Agent wallet, and expiry. The Agent can then buy x402-protected digital
services on Monad Testnet. Allowed purchase requests start concurrently and
settle quickly; requests outside the policy are blocked before payment.

## Live demo

Public app: [agenttab.sathian.ai](https://agenttab.sathian.ai)

Presentation: [agenttab.sathian.ai/presentation](https://agenttab.sathian.ai/presentation)

Demo access code: `1234` (Monad Testnet only; no real funds).

The demo mission proposes four purchases:

| Tool | Price | Decision |
| --- | ---: | --- |
| Market research | 0.001 USDC | Paid |
| Sentiment analysis | 0.001 USDC | Paid |
| Risk check | 0.001 USDC | Paid |
| Premium forecast | 0.003 USDC | Blocked by the 0.002 limit |

The three approved x402 requests start concurrently. After settlement, the Agent
writes one tamper-resistant batch receipt to the budget contract.

## Verified on Monad Testnet

- Network: Monad Testnet, chain ID `10143`
- Budget contract:
  [`0x9b22...8f16`](https://testnet.monadscan.com/address/0x9b223107e5724619cbfe06f4847eb097b46a8f16)
- Test USDC:
  [`0x534b...43A3`](https://testnet.monadscan.com/address/0x534b2f3A21130d7a60830c2Df862319e593943A3)
- x402 facilitator: `https://x402-facilitator.molandak.org`
- Verified live burst: three payments, zero failures, one policy block

## Architecture

1. The Solidity contract publishes the owner's policy and tracks completed
   spending.
2. The local policy engine checks all proposed purchases before the Agent signs.
3. The x402 client concurrently signs and submits three USDC payments.
4. Monad settles those payments and the Agent records their combined receipt
   hash in the contract.

## Local setup

```powershell
# Source / context:
# AgentTab local hackathon app

cd "C:\Users\sathi\Projects\monad-blitz-toronto"

# Commands:
Copy-Item ".env.example" ".env.local"
npm install
npm run dev
```

Fill `.env.local` with disposable Monad Testnet addresses and an Agent test
wallet key. Never use a mainnet wallet or commit `.env.local`.

## Verification

```powershell
# Source / context:
# AgentTab application and smart-contract checks

cd "C:\Users\sathi\Projects\monad-blitz-toronto"

# Commands:
npm test
npm run contract:test
npm run typecheck
npm run build
```

## Safety

- Monad Testnet and disposable wallets only.
- No real money or production data.
- The private key stays in local or hosted secret storage and never enters Git.
- The public contract is a policy registry and receipt ledger. The Agent's
  pre-payment policy engine prevents out-of-policy signatures.

## Project notes

- [Demo script](docs/DEMO-SCRIPT.md)
- [Design](docs/plans/2026-07-25-agenttab-design.md)
- [Implementation plan](docs/plans/2026-07-25-agenttab-implementation.md)
