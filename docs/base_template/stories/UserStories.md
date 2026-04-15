# User Stories Directory Guide

This folder contains granular user stories and feature requirements for the Novus Flexy template.

## 📂 Organization
Stories are organized into functional categories based on their **Identifier Prefix**:

| Folder | Prefix | Description |
| :--- | :--- | :--- |
| `SYS-100/` | **SYS** | Core Infrastructure (Firebase setup, CI/CD, Tailwind configuration). |
| `AUT-200/` | **AUT** | Authentication & Initialization (Login, Logout, Splash screens, Guards). |
| `DAT-300/` | **DAT** | Data Management (Two-stage Store-and-Forward, Firestore schemas). |
| `ADM-400/` | **ADM** | Admin Application (Admin UI, User lists, Site configuration). |
| `USR-500/` | **USR** | User Application (User-facing UI, Home page, Profile forms). |
| `TST-900/` | **TST** | Quality Assurance (Playwright test infrastructure, E2E scripts). |

## 🤖 Instructions for AI Agents
When tasked with implementing a feature:
1. **Locate the specific story** file (e.g., `docs/stories/AUT-200/AUT-201.md`).
2. **Adhere strictly to the Acceptance Criteria (AC)** listed in that file.
3. **Cross-reference the PRD** (found in `docs/context/PRD.md`) to ensure architectural alignment.
4. **Update the Status** in `docs/context/BACKLOG.md` once the story is completed.

## 🛠 Instructions for Developers
- **File-per-story:** Create a new `.md` file for every unique backlog item to avoid merge conflicts.
- **Naming Convention:** Use the Story ID as the filename (e.g., `ADM-402.md`).
- **Traceability:** Always include the "PRD Reference" and "Backlog ID" in the file header.

---
*Maintained by Jason (Project Manager)*
