# Documentation Strategy

This document records the documentation approach adopted for Novus Flexy projects — covering file organisation, versioning, archiving, and the agent-driven authoring workflow.

---

## 1. Philosophy

Documentation is treated like code: it lives close to the work, is versioned in-place, and is never duplicated. There is one authoritative file for each living concept (ProjectBrief, PRD, Architecture, UI/UX Guide) and one atomic file per executable unit (story, shard, wireframe, flow). Index files point to content files — they never contain it.

---

## 2. Folder Layout

```
docs/
  context/                          ← Live project documents (source of truth)
    ProjectBrief.md                 ← Single living doc, versioned in-place
    PRD.md                          ← Single living doc, versioned in-place
    Architecture.md                 ← Single living doc, versioned in-place
    BACKLOG.md                      ← Index registry only — no shard content
    DECISION_LOG.md                 ← Append-only log of significant decisions
    CONSTRAINTS.md                  ← Hard project constraints
    UI_UX_Design_Guide.md           ← Single living doc, versioned in-place
    designs/
      DesignSystem.md               ← Single living doc, versioned in-place
      Wireframe_[ScreenName].md     ← One file per screen
      Flow_[FlowName].md            ← One file per UX flow
      archive/
        [YYYY-MM-DD]-[Name]/        ← Archived wireframes and flow files

  stories/                          ← One file per user story
    [PREFIX]/
      [PREFIX-###]-[title].md
    archive/
      [YYYY-MM-DD]-[PREFIX]/        ← Archived stories on phase close

  shards/                           ← One file per executable task
    [PREFIX]/
      [PREFIX-###]-[kebab-title].md
    archive/
      [YYYY-MM-DD]-[PREFIX]/        ← Archived shards on phase close

  testing/                          ← Static testing conventions (do not modify per-feature)
    TEST_REGISTRY.md
    TESTING_STRATEGY.md
    WRITING_TESTS.md
    DATA_TEST_IDS.md
    PLAYWRIGHT_SETUP.md
    RUNNING_TESTS.md

  base_template/                    ← Blank starters for new projects ONLY
    (never read by agents — contains no project-specific content)
```

---

## 3. Living Documents — Versioning In-Place

The following files are **never replaced** — they are updated in-place and carry an embedded version history table.

| Document | Owner Agent | Version Table Location |
| :--- | :--- | :--- |
| `ProjectBrief.md` | Mary | Below the info header |
| `PRD.md` | Jason | Section 1 |
| `Architecture.md` | Watson | Document header section |
| `UI_UX_Design_Guide.md` | Eunice | Top of file |
| `DesignSystem.md` | Eunice | Top of file |

**Version table format:**

| Version | Date | Author | Summary of Changes |
| :--- | :--- | :--- | :--- |
| 1.0 | YYYY-MM-DD | Agent Name | Initial draft |

**Version increment rules:**

- `v1.x` — Minor updates: additions, clarifications, refined details, new stories/sections
- `v2.0` — Breaking change: new audience, pivoted problem statement, significant scope change, architectural overhaul, full visual rebrand
- Any `v2.0+` change **must** trigger a `DECISION_LOG.md` entry (via Watson's `/log-decision`)

---

## 4. Atomic Documents — One File Per Unit

Stories, shards, wireframes, and flow diagrams are **not** embedded in larger documents. Each gets its own file.

### Stories (`docs/stories/[PREFIX]/`)

- Written by Jason via `/stories`
- Filename: `[PREFIX-###]-[story-title].md`
- Contents: Title, User Statement, ≥4 Acceptance Criteria, Priority, `data-test-id` list
- Module prefix (`PREFIX`) is canonical — defined by Jason in the PRD and never renamed without updating all downstream artefacts

### Shards (`docs/shards/[PREFIX]/`)

- Written by Poe via `/shard`
- Filename: `[PREFIX-###]-[kebab-title].md`
- Contents: Header table (ID, Module, Story Ref, Priority, Status, Complexity, Depends On), Description, Acceptance Criteria, Test Coverage, Dev Notes
- Sorted by dependency — no shard appears before its prerequisites
- Numbered sequentially within each module prefix

### Wireframes (`docs/context/designs/Wireframe_[ScreenName].md`)

- Written by Eunice via `/wireframe`
- One file per screen
- Mandatory sections: Screen Purpose, Mobile Layout, Desktop Layout, Component Inventory, Interaction & State Map, UX Flow Diagram (Mermaid), `data-test-id` Map
- Poe cannot shard UI work without a wireframe for that screen

### Flow Diagrams (`docs/context/designs/Flow_[FlowName].md`)

- Written by Eunice via `/flow`
- One file per multi-screen user flow
- Mandatory sections: Flow Purpose, Screen Inventory, Mermaid `flowchart TD`, State Diagram (`stateDiagram-v2`), Route Map, Error & Edge Case Paths
- Quinn uses these as the authoritative E2E test specification

---

## 5. BACKLOG.md — Index Registry

`docs/context/BACKLOG.md` is a **table of contents** that links to shard files. Shard content is never duplicated inside it.

**Row format:**

| Shard ID | Title | Module | Priority | Status | Complexity | Story Ref | File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| AUTH-001 | Setup Firebase Auth | AUTH | High | Not Started | S | AUTH-001 | [AUTH-001](../shards/AUTH/AUTH-001-setup-firebase-auth.md) |

**Status lifecycle:** `Not Started` → `In Progress` → `Completed` → `Superseded`

When a shard's status changes, only its row in the index is updated. All detail changes go into the shard file itself.

**Superseding:** If scope change invalidates a shard mid-sprint, mark it `Superseded` — do not delete the file (it is part of the decision history). Create a replacement shard with a new ID and reference the superseded one in Dev Notes.

---

## 6. Archiving — Phase Close

Archiving happens when all shards for a module are `Completed` and Quinn has run `/gate` on each.

### Steps (coordinated between Poe and Eunice):

1. Move shard files: `docs/shards/[PREFIX]/` → `docs/shards/archive/[YYYY-MM-DD]-[PREFIX]/`
2. Move story files: `docs/stories/[PREFIX]/` → `docs/stories/archive/[YYYY-MM-DD]-[PREFIX]/`
3. Move corresponding wireframe and flow files: `docs/context/designs/[File]` → `docs/context/designs/archive/[YYYY-MM-DD]-[PREFIX]/`
4. In `BACKLOG.md`, move the module's rows to an `## Archive` section at the bottom with the archive date noted
5. Update links in `UI_UX_Design_Guide.md` to point to archived design files
6. Open a new active section in `BACKLOG.md` for the next phase if applicable

### Mid-sprint redesign (wireframes/flows only):

Before overwriting a wireframe or flow file with significant structural changes, copy the existing file to `docs/context/designs/archive/[YYYY-MM-DD]-[ScreenName]/` first. The new file keeps the same filename at its original path. Add a `## Revision History` note at the top referencing the archive path.

---

## 7. DECISION_LOG.md — Append-Only

`docs/context/DECISION_LOG.md` is an append-only record of significant decisions that affect the project direction, architecture, or scope. It is never edited retroactively.

Entries are added by Watson via `/log-decision` when:
- A living document reaches `v2.0`
- A major architectural alternative is selected over another
- A constraint is overridden with explicit justification

---

## 8. PREFIX Codes — The Binding Key

Module prefix codes (3–4 characters, e.g., `AUTH`, `DASH`, `USR`) are defined by Jason in the PRD and are **canonical** across all downstream artefacts:

| Artefact | Example reference |
| :--- | :--- |
| Story files | `docs/stories/AUTH/AUTH-001-login.md` |
| Shard files | `docs/shards/AUTH/AUTH-001-setup-firebase-auth.md` |
| Wireframe files | `docs/context/designs/Wireframe_LoginScreen.md` |
| Test IDs | `T001` in the T000–T099 Auth range |
| BACKLOG.md rows | `AUTH-001` |

Renaming a PREFIX after handoff requires updating all downstream artefacts and notifying all agents.

---

## 9. base_template/ — New Project Starters

`docs/base_template/` contains blank starter files for bootstrapping a **new** project. These files have no project-specific content.

**All agents are explicitly forbidden from reading `docs/base_template/`.** It does not reflect this project's requirements. Always read from `docs/context/`.

The template folder is used manually by a developer starting a fresh workspace, or triggered via `.github/prompts/sync-copilot-instructions.prompt.md` after all three context docs are finalised.

---

## 10. Agent Authorship Map

| Document | Created by | Updated by | Triggers |
| :--- | :--- | :--- | :--- |
| `ProjectBrief.md` | Mary `/brief` | Mary `/brief` | Handoff to Jason |
| `PRD.md` | Jason `/prd` | Jason `/prd` | Handoff to Watson + Eunice |
| `Architecture.md` | Watson `/tech-spec` | Watson `/tech-spec` | Handoff to Poe; `/sync-instructions` |
| `UI_UX_Design_Guide.md` | Eunice `/moodboard` | Eunice (all commands) | Handoff to Poe for UI shards |
| `DesignSystem.md` | Eunice `/design-system` | Eunice `/design-system`, `/theme` | Handoff to developer |
| `Wireframe_[Screen].md` | Eunice `/wireframe` | Eunice `/wireframe` | Enables Poe to shard UI work |
| `Flow_[Flow].md` | Eunice `/flow` | Eunice `/flow` | Enables Quinn to write E2E tests |
| `docs/stories/[PREFIX]/` | Jason `/stories` | Jason | Input to Poe `/shard` |
| `docs/shards/[PREFIX]/` | Poe `/shard` | Poe (status only) | Input to Quinn, developer |
| `BACKLOG.md` | Poe `/shard` | Poe (index rows) | Developer sprint planning |
| `DECISION_LOG.md` | Watson `/log-decision` | Watson (append only) | Reference for all agents |
| `.github/copilot-instructions.md` | Watson `/sync-instructions` | Watson `/sync-instructions` | Active AI coding guidance |
