# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**The Writer's Ledger**: A single-user web app for a multilingual writer learning English. Tracks progress through a 52-week program (4 phases) with daily habit logging, weekly exercises, skill self-assessment, and mentor prep. No backend, no auth — all state in localStorage.

## Tech Stack

- **Runtime**: Node ≥22, bun (required by GStack)
- **Spec Tool**: Spec-Kit v0.4.2 (slash commands in `.claude/commands/`)
- **Delivery Tool**: GStack (skills in `.claude/skills/gstack/`)
- **Persistence**: Browser localStorage (single-user, no server)
- **Design**: Mobile-first (≥360px), accessibility mandatory

## Key Files

| File | Purpose |
|------|---------|
| `.specify/memory/constitution.md` | Project law — 11 principles, governance rules |
| `specs/001-writing-tracker/spec.md` | Feature spec — 6 user stories, 24 FRs, 8 success criteria |
| `writing-tracker-prd.md` | Product requirements — 4 tabs, 52 weeks, 32 exercises |
| `Principal_Dev_Framework.md` | Spec-Kit + GStack workflow guide |

## Constitution Principles (from `.specify/memory/constitution.md`)

1. Simplicity is the first feature — prefer deleting over abstracting
2. Dependencies justified before adding
3. One concern per file — clear layer separation (presentation/logic/data)
4. No N+1 queries, soft deletes for user data
5. All writes server-side, secrets server-side only
6. Tests fast (<2s each), three types: unit/integration/e2e
7. Accessibility mandatory (semantic HTML, keyboard nav, contrast)
8. Performance measured, not deferred
9. No speculative architecture

## Spec-Kit + GStack

Spec-Kit for definition, GStack for delivery.

### Workflow
1. Define: /speckit-constitution → /speckit-specify → /speckit-plan → /speckit-tasks → /speckit-analyze
2. Challenge: Point /plan-ceo-review and /plan-eng-review at spec artifacts
3. Build per task: implement → /review → /qa → /cso (if applicable) → /ship
4. Reflect: /retro
5. After /ship: save review outputs to specs/<feature>/ and update spec if needed

### Artifacts
- Specs: .specify/specs/<branch>/
- Constitution: .specify/memory/constitution.md
- Review files: specs/<feature>/*.md (product-review, engineering-review, code-review, etc.)

### GStack skills
/office-hours, /plan-ceo-review, /plan-eng-review, /plan-design-review,
/design-consultation, /review, /ship, /land-and-deploy, /canary, /benchmark,
/browse, /qa, /qa-only, /design-review, /cso, /retro, /investigate,
/document-release, /codex, /autoplan, /careful, /freeze, /guard, /unfreeze

### Handoff convention
When running GStack review/QA skills, always provide spec context:
"Review this against the acceptance criteria in .specify/specs/<branch>/spec.md"

## Data Model (v1)

```
User (implicit, single):
  currentPhase: 0–3
  currentWeek: 1–52
  lastActiveTab: "Plan" | "This Week" | "Skills" | "Log"

Week (per week 1–52):
  dayLogs: [boolean × 7]  # Mon–Sun
  notes: string

Skill (6 total):
  rating: 0–5

Static: 4 phases × 8 exercises each + 4 mentor prompts + 5 books
```

## Performance Targets

- Load & interactive: <3s on mobile
- Day log interaction: <2s
- Fast paths render without spinners

## Active Technologies
- TypeScript (strict mode), Node ≥ 22 + `better-sqlite3`, Tailwind CSS (001-writing-tracker)
- SQLite (single file at `data/writing-tracker.db`, persistent disk on deploy) (001-writing-tracker)

## Recent Changes
- 001-writing-tracker: Added TypeScript (strict mode), Node ≥ 22 + `better-sqlite3`, Tailwind CSS
