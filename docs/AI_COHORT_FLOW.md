# AI Cohort Flow

This document describes how the six AI agents in this workspace are aligned to work together as a cohesive product team — from raw idea to shipped, tested feature.

---

## The Team

| Agent | Role | Tagline | Model |
| :--- | :--- | :--- | :--- |
| **Mary** | Strategic Analyst | "Is this worth building?" | Gemini 3.1 Pro |
| **Jason** | Product Manager | "What are we building?" | Gemini 3 Pro |
| **Watson** | System Architect | "How do we build it?" | Claude Sonnet 4.6 |
| **Eunice** | UI/UX Designer | "What does it look and feel like?" | Gemini 3.1 Pro |
| **Poe** | Product Owner / Sharder | "What does the developer do next?" | Claude Sonnet 4.6 |
| **Athena** | Lead Dev & DevOps Commander | "Build it. Ship it. Track it." | Claude Sonnet 4.6 |
| **Quinn** | QA Engineer | "Is it done, really?" | Claude Sonnet 4.6 |

---

## The Master Flow

```
Idea
  │
  ▼
Mary ──/brainstorm──/brief──────────────────────► ProjectBrief.md
  │
  ▼
Jason ──/prd──/stories──────────────────────────► PRD.md  +  docs/stories/[PREFIX]/
  │
  ├──────────────────────────────────┐
  ▼                                  ▼
Watson ──/tech-spec──────────────► Architecture.md
  │                                  │
  │                               Eunice ──/moodboard──/wireframe──/flow──/design-system──►
  │                                  │    UI_UX_Design_Guide.md  +  docs/context/designs/
  ▼                                  │
Watson ──/sync-instructions──────► .github/copilot-instructions.md  (updated)
  │                                  │
  └──────────[both complete]─────────┘
                    │
                    ▼
Poe ──/shard────────────────────────────────────► docs/shards/[PREFIX]/  +  BACKLOG.md
  │
  ▼
Athena ──/blast-issues──────────────────────────► GitHub Issues  +  Project board
  │
  ├── /execute [ShardID] (one at a time, priority order)
  │
  ├── /ship ───────────────────────────────────► PR  +  Closes #IssueID
  │
  └── /reconcile ──────────────────────────────► BACKLOG.md  ↔  GitHub Issues synced
  │
  ▼
Quinn ──/test-plan──/audit──/gate───────────────► Test plans  +  Playwright E2E specs
  │
  └── /ci-sync (if new app added) ──────────────► .github/workflows/test.yml updated
```

---

## Phase 1 — Discovery (Mary)

**Goal:** Validate the idea before a single line of code is written.

**Entry point:** A raw concept from the developer or stakeholder.

### Commands
- `/brainstorm` — 7-question First Principles interview conducted one question at a time. Forces the developer to articulate the problem, personas, MLP, out-of-scope items, top risks, and success metrics.
- `/brief` — Produces a structured `ProjectBrief.md` with 9 mandatory sections (600–1000 words): Executive Summary, Problem Statement, Personas, KPIs, Feature Areas, Scope Definition, Technical Constraints, Risks, and Milestones.
- `/validate` — 6-point Go/No-Go framework: Market Fit, Competitive Landscape, Internal Capability, Risk Radar, Red Flags, Recommendation.

### Output
- `docs/context/ProjectBrief.md` — versioned in-place (`v1.0` → `v1.x` → `v2.0`)

### Handoff trigger
Mary hands off to **Jason** when all 9 sections of the brief are present and substantive.

---

## Phase 2 — Product Requirements (Jason)

**Goal:** Turn the brief into a precise, developer-actionable specification.

**Input:** `ProjectBrief.md`

### Commands
- `/prd` — Generates `PRD.md` with 9 mandatory sections (1500–2500 words): Document Header, Executive Summary, Personas, Feature Modules (each with a PREFIX code and 3–5 stories), User Journey Map, NFRs, Out of Scope, Open Questions, Success Metrics.
- `/stories` — Writes individual story files to `docs/stories/[PREFIX]/[PREFIX-###]-title.md`. Each contains: Title, User Statement, ≥4 ACs, Priority, and a `data-test-id` list.

### Critical output: PREFIX codes
The 3–4 character module prefix codes defined in the PRD (e.g., `AUTH`, `DASH`, `PROF`) are **canonical** across the entire cohort. Every downstream agent references them:
- Eunice names wireframes and flows using screen names from these modules
- Poe uses them as folder names and shard IDs
- Quinn uses them to determine test ID ranges

Renaming a PREFIX after handoff requires updating all downstream artefacts.

### Output
- `docs/context/PRD.md` — versioned in-place
- `docs/stories/[PREFIX]/` — one file per story

### Handoff triggers
- Jason hands off to **Watson** (technical feasibility review)
- Jason hands off to **Eunice** (begin visual design in parallel)
- Jason does **not** hand off directly to Poe — Poe starts only after both Watson (`/sync-instructions` complete) and Eunice (all wireframes and flows complete) have finished

---

## Phase 3A — Architecture (Watson)

**Goal:** Define the technical foundation that will make the PRD buildable.

**Input:** `PRD.md`, existing monorepo scaffold (read via `MONOREPO USE GUIDE.md`)

### Commands
- `/tech-spec` — Produces `Architecture.md` with 10 mandatory sections: Document Header, System Overview, Technology Stack, Monorepo Structure, Module Breakdown, Data Models (DAT-302 pattern), API & Integration Design, Security Model, 3 Mermaid system diagrams, Performance & Scalability mapping.
- `/log-decision` — Appends a formal ADL-[Number] entry to `DECISION_LOG.md` whenever Architecture changes or a `v2.0` revision of the Brief or PRD has architectural implications.
- `/diagram` — Produces standalone Mermaid.js system or data flow diagrams.
- `/compare-history` — Compares the current architecture against an archived version to explain technical drift.
- `/sync-instructions` — **The planning phase handoff gate.** After `ProjectBrief.md`, `PRD.md`, and `Architecture.md` are all finalised, this command rewrites `.github/copilot-instructions.md` using the sync prompt at `.github/prompts/sync-copilot-instructions.prompt.md`. Run this before handing off to Poe.

### Key constraint
Watson reads `docs/MONOREPO USE GUIDE.md` before generating a tech spec and extends the existing scaffold — never replaces it.

### Output
- `docs/context/Architecture.md` — versioned in-place
- `docs/context/DECISION_LOG.md` — append-only
- `.github/copilot-instructions.md` — regenerated after finalisation

### Handoff trigger
Watson runs `/sync-instructions` to signal planning is complete, then hands off to **Poe**.

---

## Phase 3B — Design (Eunice)

**Goal:** Translate the PRD and architecture into a visual language and testable screen layouts.

**Input:** `ProjectBrief.md`, `PRD.md`, `CONSTRAINTS.md`, `Architecture.md`

Eunice runs in **parallel with Watson** — both consume the PRD independently.

### Commands
- `/moodboard` — Establishes the visual direction: Emotional Direction, Color System, Typography Scale, Iconography, Spacing Grid. Output to `UI_UX_Design_Guide.md` under `## Moodboard`.
- `/wireframe [ScreenName]` — Produces a per-screen artefact saved to `docs/context/designs/Wireframe_[ScreenName].md`. 7 mandatory sections: Screen Purpose, Mobile Layout, Desktop Layout, Component Inventory, Interaction & State Map, **UX Flow Diagram (Mermaid flowchart TD)**, **data-test-id Map**. Poe cannot shard UI work without an existing wireframe.
- `/flow [FlowName]` — Produces a multi-screen flow document saved to `docs/context/designs/Flow_[FlowName].md`. Contains: full `flowchart TD`, Happy Path callout, `stateDiagram-v2`, Route Map (Angular routes + layout + auth requirement), Error & Edge Case Paths. **Quinn uses this as the E2E test specification.**
- `/design-system` — Produces `docs/context/designs/DesignSystem.md` with Tailwind config snippet, Angular Material SCSS theme, component variants, and Do/Don't rules.
- `/theme` — Compact developer-ready token summary (CSS variables + summary table) for Watson or developer use.
- `/audit-ux` — Reviews screens against 5 criteria: Persona Alignment, Mobile-First, WCAG 2.1 AA, Material + Tailwind consistency, Testability.

### Critical outputs for downstream agents
- **For Poe:** `data-test-id` maps in each wireframe — mandatory input before UI shards can be created
- **For Quinn:** `Flow_*.md` files — the authoritative E2E test specification; `Wireframe_*.md` — the authoritative selector source

### Output
- `docs/context/UI_UX_Design_Guide.md` — single living doc, versioned in-place
- `docs/context/designs/DesignSystem.md` — single living doc, versioned in-place
- `docs/context/designs/Wireframe_[ScreenName].md` — one file per screen
- `docs/context/designs/Flow_[FlowName].md` — one file per flow

### Handoff triggers
- Eunice → **Poe** ("Design Ready for Sharding") — when all wireframes and flow files are complete
- Eunice → **Quinn** ("Flow Diagrams Ready for Test Specification") — when all `/flow` documents for the feature set are complete. Quinn receives these immediately so test specifications can be drafted, but Quinn's executable commands (`/test-plan`, `/audit`, `/gate`) are blocked until both Poe finishes sharding **and** the developer finishes implementing the shard
- Eunice → **Watson** ("Theme Tokens for Implementation") — when the design system is ready for validation

---

## Phase 4 — Task Decomposition (Poe)

**Goal:** Break the planning documents into atomic, executable developer tasks.

**Input:** `PRD.md`, `Architecture.md`, `UI_UX_Design_Guide.md`, `docs/context/designs/Wireframe_*.md`, `docs/context/designs/Flow_*.md`

> **Hard gate:** Poe cannot begin sharding until (1) Watson has run `/sync-instructions` and (2) Eunice has completed `/moodboard`, all `/wireframe` screens, and all `/flow` documents for the feature set. No shard may be created for a UI screen that lacks a corresponding wireframe.

### Commands
- `/shard` — Writes individual shard files to `docs/shards/[PREFIX]/[PREFIX-###]-kebab-title.md`. Each shard contains: header table (ID, Module, Story Ref, Priority, Status, Complexity, Depends On), Description, Acceptance Criteria, Test Coverage spec (unit + E2E), Dev Notes. After all shards are written, `docs/context/BACKLOG.md` is updated with one index row per shard.
- `/align` — Verifies that `Architecture.md` fully supports `PRD.md` — surfaces any gaps.
- `/prepare-task [TaskName]` — Generates a developer prompt for a specific shard, including test context and `data-test-id` requirements.

### BACKLOG.md rules
- `BACKLOG.md` is an index registry, never a content file
- Status lifecycle: `Not Started` → `In Progress` → `Completed` → `Superseded`
- Superseded shards are never deleted — they are part of the decision history

### UI sharding rule
Poe reads `UI_UX_Design_Guide.md` before sharding any UI-facing feature. A shard for a screen **cannot be created** without a corresponding wireframe from Eunice.

### Output
- `docs/shards/[PREFIX]/` — one shard file per task
- `docs/context/BACKLOG.md` — updated index

### Handoff trigger
Poe hands off to **Athena** when all shard files are written and `BACKLOG.md` is updated. Athena then runs `/blast-issues` to register all shards as GitHub Issues before beginning implementation.

---

## Phase 4.5 — Implementation & GitHub Orchestration (Athena)

**Goal:** Implement shards in priority order, register them as GitHub Issues, and keep the GitHub Project board in parity with `BACKLOG.md` through every status transition.

**Input:** `docs/context/BACKLOG.md`, `docs/shards/[PREFIX]/`, `docs/context/Architecture.md`, `docs/context/CONSTRAINTS.md`, `.github/copilot-instructions.md`, `docs/context/designs/Wireframe_*.md`, `docs/context/designs/Flow_*.md`

> **Hard gate:** Athena cannot begin until (1) Poe has finished all shards and updated `BACKLOG.md`, and (2) Watson has run `/sync-instructions`. Within a module, Athena respects `Depends On` chains — no shard is started before its prerequisites are `Completed`.

### Commands
- `/blast-issues` — Converts all `Not Started` shards in `BACKLOG.md` into GitHub Issues via `gh` CLI; records Issue numbers back into each shard file and `BACKLOG.md`.
- `/execute [ShardID]` — Implements the specified shard: creates feature branch, writes code to all Acceptance Criteria, applies `data-test-id` values verbatim from Eunice's wireframe, writes unit tests per the shard's Test Coverage spec.
- `/ship [ShardID]` — Opens a PR with `Closes #[IssueID]`, updates shard status to `Ready for Review`, triggers "Shard Ready for Review" handoff to Quinn.
- `/sync-project` — Synchronises all shard-linked Issues onto the GitHub Project board, aligning column/status with `BACKLOG.md`.
- `/reconcile` — Pulls live GitHub Issue statuses and reconciles any mismatches with `BACKLOG.md`.

### Shard status lifecycle (Athena owns these transitions)
`Not Started` → `In Progress` (branch created) → `Ready for Review` (PR open) → `Completed` (PR merged, Issue closed)

### Output
- Feature branches and merged PRs in GitHub
- GitHub Issues linked to shards with Priority, Complexity, and PREFIX labels
- GitHub Project board in sync with `BACKLOG.md`
- `BACKLOG.md` status column kept current throughout

### Handoff trigger
Athena triggers "Shard Ready for Review" → **Quinn** when a shard's PR is open and the shard status is `Ready for Review`.
Athena triggers "Technical Pivot Required" → **Watson** if implementation requires deviating from `Architecture.md`.

---

## Phase 5 — Quality & Testing (Quinn)

**Goal:** Ensure every shard is testable, tested, and genuinely done.

**Input:** Shard file, Story file, `Flow_[FlowName].md`, `Wireframe_[ScreenName].md`, `TEST_REGISTRY.md`, `TESTING_STRATEGY.md`, `WRITING_TESTS.md`, `DATA_TEST_IDS.md`

> **Hard gate:** Quinn receives Eunice's flow files early (via the "Flow Diagrams Ready for Test Specification" handoff) and may read them to prepare test specifications. However, Quinn's executable commands — `/test-plan`, `/audit`, and `/gate` — cannot be run until ALL three conditions are met:
> 1. **Eunice** has completed all `/flow` documents for the feature set
> 2. **Poe** has finished sharding (all shard files written and `BACKLOG.md` updated)
> 3. **Athena** has implemented the shard and opened a PR (shard status = `Ready for Review`)

### Commands
- `/test-plan` — Produces a full testing strategy for a shard covering: Unit Test Scope (including Firebase emulator mock strategy), E2E Playwright Scenarios (flow-derived + Quinn-authored), `data-test-id` Verification, Risk Matrix. Registers all new test IDs in `TEST_REGISTRY.md`.
- `/audit` — Structured code review across 5 areas: OWASP Top 10, Angular Code Smells, Firestore Security Rules, DAT-302 Compliance, CONSTRAINTS.md Adherence.
- `/gate` — Final Definition-of-Done checklist. A shard cannot be marked `Completed` with any open Critical items.
- `/ci-sync` — When a **new Angular app** is added to the monorepo, Quinn produces the YAML patch needed to add build/serve/test steps for that app to `.github/workflows/test.yml` and `.github/workflows/deploy.yml`. Developer applies the change after review.

### E2E test authorship model
Quinn derives E2E tests from two sources:

1. **Eunice's flow diagrams** (`Flow_[FlowName].md`) — every distinct path in the `flowchart TD` becomes a separate test scenario. This is the baseline.
2. **Quinn-authored exception tests** — security exceptions, network failures, boundary conditions, and any scenario the `/audit` surfaces. These are authored in the same `T[NNN].X` format and placed in the correct T-range category.

Eunice's error paths are the **floor**, not the ceiling.

### Selector source of truth
Selectors in Playwright tests come **only** from the `data-test-id` map in Eunice's wireframes. No CSS classes, element types, or inner text. If a Quinn-authored test requires a selector not in the wireframe, it is raised as a **Design Gap** for Eunice.

### CI gate
`deploy.yml` is configured with `workflow_run` to block deployment until `test.yml` passes. Quinn owns the test execution steps in `test.yml`; Watson and the developer own CI infrastructure (Node version, runners, secrets, Firebase emulator config, deploy logic).

### Output
- `e2e/[admin|user-app]/flows/[feature-area]/T[NNN]-[kebab].spec.ts` — test files
- `docs/testing/TEST_REGISTRY.md` — updated with new test IDs

---

## Cross-Agent Dependencies

The following table captures the critical data dependencies between agents — these are the points where one agent's output is a hard prerequisite for another agent's work.

| Producer | Artefact | Consumer | Dependency |
| :--- | :--- | :--- | :--- |
| Mary | `ProjectBrief.md` | Jason | Required input for `/prd` |
| Jason | `PRD.md` | Watson | Required input for `/tech-spec` |
| Jason | `PRD.md` | Eunice | Required input for all design commands |
| Jason | `PRD.md` | Poe | Required input for `/shard` |
| Jason | PREFIX codes | All agents | Canonical — never rename after handoff |
| Watson | `Architecture.md` | Poe | Required input for `/shard` |
| Watson | `Architecture.md` | Eunice | Required for Route Map in `/flow` |
| Eunice | `UI_UX_Design_Guide.md` (moodboard complete) | Poe | **Hard gate: Poe cannot begin any sharding until moodboard is done** |
| Eunice | `Wireframe_[Screen].md` | Poe | **Hard gate: Poe cannot shard a UI screen without its wireframe** |
| Eunice | All `Flow_[FlowName].md` files | Poe | **Hard gate: Poe cannot shard user-facing flows without flow documents** |
| Eunice | `Wireframe_[Screen].md` → `data-test-id` map | Quinn | Authoritative Playwright selector source |
| Eunice | `Flow_[FlowName].md` → `flowchart TD` | Quinn | Authoritative E2E test specification |
| Eunice | All `Flow_[FlowName].md` files | Quinn | **Hard gate: Quinn cannot run `/test-plan`/`/audit`/`/gate` until all flows are complete** |
| Eunice | `Flow_[FlowName].md` → `flowchart TD` | Quinn | Authoritative E2E test specification |
| Eunice | `Flow_[FlowName].md` → "Error & Edge Case Paths" | Quinn | Minimum coverage floor for exception tests |
| Poe | `docs/shards/[PREFIX]/` + `BACKLOG.md` | Athena | **Hard gate: Athena cannot begin `/blast-issues` or `/execute` until sharding is complete** |
| Poe | `docs/shards/[PREFIX]/` | Quinn | **Hard gate: Quinn cannot run `/test-plan`/`/audit`/`/gate` without completed shards** |
| Watson | `.github/copilot-instructions.md` (post `/sync-instructions`) | Athena | Required reading before implementation — authoritative coding standards |
| Eunice | `Wireframe_[Screen].md` → `data-test-id` map | Athena | `data-test-id` values must be applied verbatim to every rendered interactive element |
| Eunice | `Flow_[FlowName].md` → Route Map | Athena | Angular routes and layout wrappers to implement |
| Athena | Shard status `Ready for Review` + open PR | Quinn | **Hard gate: Quinn cannot run `/audit` or `/gate` against unimplemented code** |
| Athena | `BACKLOG.md` status updates | GitHub Project board | Reconciled via `/reconcile` — board must mirror local status |
| Quinn | `/gate` (all shards `Completed`) | Poe | Required before Poe archives a module |

---

## Shared Rules (All Agents)

These rules apply universally across the entire cohort:

1. **Read `CONSTRAINTS.md` first.** Every agent reads `docs/context/CONSTRAINTS.md` before producing any output. Constraints take precedence over the PRD and architecture when conflicts arise.
2. **Never read `docs/base_template/`.** That folder contains blank starters for new projects. All agents read exclusively from `docs/context/`.
3. **PREFIX codes are immutable after Jason's handoff.** Renaming a PREFIX cascades to stories, shards, wireframes, test IDs, and the BACKLOG. Coordinate with all agents before making the change.
4. **Living documents are versioned in-place.** `ProjectBrief.md`, `PRD.md`, `Architecture.md`, `UI_UX_Design_Guide.md`, and `DesignSystem.md` each carry an embedded `## Version History` table. `v2.0` changes require a `DECISION_LOG.md` entry via Watson.
5. **Atomic files are never embedded in index files.** Story content stays in story files, shard content stays in shard files, design content stays in design files. `BACKLOG.md` is an index, not a registry.
6. **`data-test-id` on every interactive element.** Eunice specifies them in wireframes; Poe references them in shards; Quinn uses them exclusively as Playwright selectors. The naming convention is `[page]-[element]-[purpose]`.

---

## Workflow Summary by Deliverable

| Deliverable | Owned by | Input from | Consumed by |
| :--- | :--- | :--- | :--- |
| `ProjectBrief.md` | Mary | Developer interview | Jason |
| `PRD.md` | Jason | ProjectBrief | Watson, Eunice, Poe |
| `docs/stories/` | Jason | PRD modules | Poe, Quinn |
| `Architecture.md` | Watson | PRD | Poe, Eunice |
| `DECISION_LOG.md` | Watson | Architecture changes | All (reference) |
| `.github/copilot-instructions.md` | Watson `/sync-instructions` | All 3 context docs | Developer agent |
| `UI_UX_Design_Guide.md` | Eunice | PRD + Architecture | Poe, Quinn, Developer |
| `DesignSystem.md` | Eunice | Moodboard + CONSTRAINTS | Watson, Developer |
| `Wireframe_[Screen].md` | Eunice | PRD screens | Poe (UI shards), Quinn (selectors) |
| `Flow_[FlowName].md` | Eunice | PRD + Architecture routes | Quinn (E2E spec) |
| `docs/shards/` | Poe | PRD + Architecture + Wireframes | Athena, Quinn |
| `BACKLOG.md` | Poe + Athena | Shard files / GitHub Issue numbers | Athena sprint execution, GitHub Project board |
| GitHub Issues + Project board | Athena | BACKLOG.md shards | Team visibility, PR linking |
| Feature PRs (with `Closes #IssueID`) | Athena | Implemented shards | Quinn review gate |
| E2E test files | Quinn | Flow files + Wireframes + Shards | CI pipeline |
| `TEST_REGISTRY.md` | Quinn | Test plans | All (test ID allocation) |
| `test.yml` test steps | Quinn `/ci-sync` | New monorepo app | CI pipeline |
