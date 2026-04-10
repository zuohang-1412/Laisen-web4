# Laisen Base Platform

This branch is the platform baseline for modular delivery.

It intentionally includes only:

- Next.js app foundation
- site shell and marketing pages (`/`, `/how-it-works`, `/evidence`)
- runtime route shell (`/runtime`) as a placeholder page
- legacy `/arena` redirect to `/runtime`

It intentionally excludes:

- AI planning API
- runtime state machine
- wallet/network integration
- onchain deployment and governance
- proof ledger persistence

## Routes

- `http://localhost:3000/`
- `http://localhost:3000/how-it-works`
- `http://localhost:3000/evidence`
- `http://localhost:3000/runtime`
- `http://localhost:3000/arena`

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
pnpm check
```

## Branching Plan

- `feature/base-platform` (this branch)
- `feature/runtime-state-machine`
- `feature/runtime-ai-planning-api`
- `feature/onchain-wallet-network`
- `feature/onchain-protocol-deployment`
- `feature/onchain-governance-lifecycle`
- `feature/runtime-proof-persistence`
- `feature/runtime-resilience-controls`
