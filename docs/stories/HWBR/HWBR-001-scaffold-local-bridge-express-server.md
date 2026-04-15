# HWBR-001 — Scaffold Local Bridge Express Server

| Field | Value |
| :--- | :--- |
| **Module** | HWBR — Local Hardware Bridge |
| **Sprint** | 2 |
| **Priority** | High |
| **App** | local-bridge (new — `/local-bridge/` monorepo folder) |
| **⚠️ Watson Architecture Dependency** | The `/local-bridge/` folder does not exist. Watson must define the monorepo placement, deployment model (Docker / standalone npm / installer wizard), and Node.js version before this story is implemented. See PRD §8, Open Question #1. |

## User Statement
As a developer, I want a Node.js Express server scaffolded at `/local-bridge/` in the monorepo with a health endpoint so that the foundation for kitchen hardware peripheral communication exists.

## Acceptance Criteria
1. `/local-bridge/` folder created at the monorepo root with its own independent `package.json`, `tsconfig.json`, and `src/index.ts`.
2. `GET /health` endpoint returns `{ status: "ok", version: "1.0.0", timestamp: <ISO8601> }` with HTTP 200.
3. Server port is configurable via `PORT` environment variable; defaults to `3500` if not set.
4. Server is startable from the monorepo root via `npm run start:bridge` (added to root `package.json` scripts).
5. TypeScript with ESM modules per CONSTRAINTS.md Golden Rules (Node.js + TypeScript + ESM).
6. CORS is restricted to `localhost` origins only — the bridge is never exposed to the public internet.

## data-test-id List
N/A — this is a server-side scaffold story with no UI. Validation is via HTTP endpoint testing in Quinn's integration tests.
