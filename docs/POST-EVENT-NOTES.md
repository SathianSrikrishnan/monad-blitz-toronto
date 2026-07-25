# AgentTab post-event notes

## Sathian.ai article

Working title: **The Bounded Agent Allowance**

Explain:

- why autonomous agents should not receive unlimited wallet authority;
- how x402 turns an API request into a machine-readable payment request;
- how a small EVM contract publishes the owner, Agent, total budget,
  per-purchase limit, expiry, pause state, and completed spend;
- why Monad's fast blocks, high throughput, low fees, EVM compatibility, and
  parallel execution architecture suit agent-scale micropayments; and
- what must change before production: contract-controlled funds, merchant or
  service allowlists, safe concurrent reservations, session keys, and stronger
  authorization.

## Product follow-up

Design an owner-facing policy builder with:

1. Agent wallet address
2. Total allowance
3. Maximum per purchase
4. Approved merchants or service categories
5. Expiry and emergency pause
6. Review and deploy

Do not present approved merchants as enforced by the current MVP contract. That
requires a contract upgrade or smart-account policy module.
