---
mode: agent
description: >
  Reads docs/context/ and rewrites .github/copilot-instructions.md to reflect
  the actual project — its name, modules, architecture, and constraints.
  Run this after ProjectBrief.md, PRD.md, and Architecture.md are complete.
---

You are rewriting `.github/copilot-instructions.md` to reflect this specific project.

## Step 1 — Read the source documents

Read ALL of the following files before writing a single line of output. Do not skip any.

1. `docs/context/ProjectBrief.md` — project name, owner, problem statement, personas, goals
2. `docs/context/PRD.md` — feature modules (with prefix codes), user stories, NFRs, out-of-scope list
3. `docs/context/Architecture.md` — tech stack, monorepo structure, data models, key files, Firestore collections
4. `docs/context/CONSTRAINTS.md` — hard rules that cannot be violated

Also read `docs/MONOREPO USE GUIDE.md` for the correct dev commands and port assignments.

## Step 2 — Produce the new copilot-instructions.md

Write the complete contents of `.github/copilot-instructions.md` using the structure below.
Every section marked _(derived)_ must be populated from the documents you read — do NOT use placeholders.
Every section marked _(stable)_ must be included verbatim or with only minor project-specific wording changes.

---

### Section 1 — Project Overview _(derived)_

- Project name and one-paragraph description from ProjectBrief
- Info table: Owner, Stack, Architecture, Primary Apps + ports, Backend services
- Note pointing readers to `docs/context/` for deeper context

### Section 2 — Workspace Structure _(derived)_

- Annotated folder tree using the actual monorepo structure from Architecture.md
- Include `docs/context/` vs `docs/base_template/` distinction with a clear note:
  > `docs/base_template/` contains blank starter templates — DO NOT use as project reference. Always read from `docs/context/`.

### Section 3 — Product Modules _(derived)_

- Table of all modules from PRD.md: Prefix | Module Name | One-line description
- At least one row per module defined in the PRD

### Section 4 — Architecture Conventions _(derived + stable)_

- State management: Angular Signals only rule (stable wording)
- DAT-302 data layer pattern with a code snippet (stable wording, update model name example to a real model from Architecture.md)
- Component pattern: standalone only, MaterialModule, selector prefix (stable wording)
- Routing: lazy-load pattern (stable wording)
- Styling: Material + Tailwind hybrid rule from CONSTRAINTS.md (derived version number)

### Section 5 — Development Commands _(derived)_

- Take the commands from `docs/MONOREPO USE GUIDE.md` — use the actual npm script names
- Include: dev (all), admin only, user-app only, emulators, build, unit test, e2e admin, e2e user-app

### Section 6 — Key Files Reference _(derived)_

- Table of the most important files: File path | Purpose
- Include: both app.config.ts files, app.routes.ts, material.module.ts, environment.local.ts, functions/src/index.ts, all four docs/context/ files
- Add any project-specific key files identified in Architecture.md

### Section 7 — Common Pitfalls _(stable + derived)_

- Keep the standard Angular pitfalls (no individual Material modules, no BehaviorSubject, no NgModules, no null to Firestore, no model duplication)
- Add any project-specific pitfalls called out in CONSTRAINTS.md or Architecture.md

### Section 8 — Testing Philosophy _(stable)_

- Keep: test-first mindset, strategy table (unit/e2e/data-test-id/env safety)
- Keep: `data-test-id` convention with format and examples
- Keep: Test numbering table (T000–T999 ranges) — update T500+ range label to match the actual user-app name
- Keep: E2E file structure diagram

---

## Step 3 — Write the file

Write the completed content directly to `.github/copilot-instructions.md`, replacing the entire existing file.

After writing, output a short confirmation listing:

- Project name detected
- Number of modules included
- Any sections that could not be populated due to missing source content (so the developer knows what to complete first)
