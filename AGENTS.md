# AgentTab Project Rules

## Purpose

Build and demonstrate AgentTab for Monad Blitz Toronto: a fresh x402 application that gives a disposable AI agent bounded purchasing authority on Monad Testnet.

## Source of truth

- Product definition: `README.md`
- Validated design: `docs/plans/2026-07-25-agenttab-design.md`
- Build sequence: `docs/plans/2026-07-25-agenttab-implementation.md`
- Event evidence: `C:\Users\sathi\Projects\_second-brain\raw\calls-and-meetings\2026-07-25-monad-blitz-toronto`

## Hard boundaries

- Use Monad Testnet only: chain ID `10143`.
- Use disposable wallets and synthetic demo data only.
- Never read, print, log, commit, screenshot, or paste wallet seed phrases or private keys.
- Secrets belong only in `.env.local` locally and Vercel secret storage when deployment is approved.
- Never use a wallet containing mainnet assets.
- Do not reuse TFN, Homeland, sathian.ai, Solana, client, family, or pre-hackathon application code.
- Do not add escrow, a token, an indexer, a database, authentication, or a second chain.
- The first event deployment is a standalone Vercel project. Integrating with sathian.ai happens only after the event demo is safe.

## Working method

- Follow the implementation plan in order.
- Write a failing test before policy or payment behavior.
- Keep commits small and dated within the hackathon window.
- After 30 minutes of unresolved x402 facilitator trouble, stop and evaluate the documented MPP fallback.
- Verify tests, typecheck, production build, and the clean-browser demo before claiming completion.

## Definition of done

- Live app opens without local setup.
- Three allowed x402 purchases complete in parallel on Monad Testnet.
- One over-policy purchase is visibly blocked.
- Remaining budget and explorer links are visible.
- GitHub repository is public and contains no secret.
- Three-minute presentation and backup demo are ready.
