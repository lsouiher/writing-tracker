# Implementation Plan: The Writer's Ledger

**Branch**: `001-writing-tracker` | **Date**: 2026-04-01 | **Spec**: `specs/001-writing-tracker/spec.md`
**Input**: Feature specification from `specs/001-writing-tracker/spec.md` + tech stack from `plan-promt.md`

## Summary

Build a single-user web app for tracking a 52-week English writing program. Four views (Plan, This Week, Skills, Log) backed by SQLite, rendered with Next.js 14+ App Router (server components default), styled with Tailwind CSS. No auth, no ORM, minimal dependencies. Mobile-first, notebook aesthetic.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node ≥ 22
**Framework**: Next.js 14+ (App Router, server components by default)
**Primary Dependencies**: `better-sqlite3`, Tailwind CSS
**Storage**: SQLite (single file at `data/writing-tracker.db`, persistent disk on deploy)
**Testing**: Vitest (unit/integration), Playwright (e2e)
**Target Platform**: Web (mobile-first ≥ 360px), single VPS (Fly.io)
**Project Type**: Full-stack web application (single-user)
**Performance Goals**: < 3s load on mobile, < 2s day-log interaction
**Constraints**: No ORM, no component library, no inline styles, minimal dependencies
**Scale/Scope**: 1 user, 52 weeks, 4 views, 3 DB tables, ~15 source files

## Constitution Check

*GATE: PASS — no violations found. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Simplicity | ✅ | 3 tables, 4 routes, static TS content, no abstractions beyond what's needed |
| II. Dependencies | ✅ | 3 deps total: Next.js (framework), better-sqlite3 (persistence), Tailwind (styling). Each justified by 20+ lines of code saved. No component library. |
| III. Code Structure | ✅ | Strict separation: pages (data fetch) → components (UI) → actions (writes) → lib (data access). No barrel re-exports. One concern per file. |
| IV. Data & Persistence | ✅ | Append-only migrations. No nullable fields. Single-row user_state enforced by CHECK constraint. Weeks created lazily. |
| V. Server-side Writes | ✅ | All mutations via Next.js Server Actions → lib/mutations.ts. Client components never touch DB. |
| VI. Auth | N/A | Single user, no auth. Constitution VI does not apply. |
| VII. Frontend | ✅ | Server components default. Client only for: day toggles, skill pips, notes textarea, phase expand/collapse, week arrows. No inline styles. |
| VIII. Testing | ✅ | Vitest (unit: pure functions < 2s, integration: DB layer), Playwright (e2e: 5 critical paths). Tests co-located. |
| IX. Performance | ✅ | Targets defined before code: < 3s load, < 2s interaction. SQLite is local = near-zero query latency. |
| X. Security | ✅ | No secrets in client code. User input (notes) sanitized before storage. No public endpoints to rate-limit (single user). |

## Project Structure

### Documentation (this feature)

```text
specs/001-writing-tracker/
├── plan.md              # This file
├── research.md          # Phase 0 output — tech decisions
├── data-model.md        # Phase 1 output — entities and schema
├── quickstart.md        # Phase 1 output — setup guide
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
app/                        # Next.js App Router
├── layout.tsx              # Root layout: html/body, TabNav, font config
├── page.tsx                # Root redirect (→ last_tab or /plan)
├── plan/
│   └── page.tsx            # Phase Plan view (server component)
├── this-week/
│   └── page.tsx            # This Week view (server component)
├── skills/
│   └── page.tsx            # Skills view (server component)
└── log/
    └── page.tsx            # Progress Log view (server component)

lib/                        # Server-only data layer
├── db.ts                   # SQLite singleton + table creation
├── queries.ts              # Read queries (getUserState, getWeek, getSkills, getAllWeeks)
├── mutations.ts            # Write queries (toggleDay, saveNotes, setPhase, setWeek, setTab, setSkillRating)
└── program-content.ts      # Static: 4 phases, exercises, prompts, reading list

components/                 # Shared presentational components
├── tab-nav.tsx             # 4-tab navigation bar (server component, uses Link)
├── phase-card.tsx          # Expandable phase card ('use client')
├── day-tracker.tsx         # 7-day toggle buttons ('use client')
├── notes-field.tsx         # Auto-saving notes textarea ('use client')
├── week-navigator.tsx      # Back/forward arrows + week header ('use client')
├── skill-row.tsx           # Skill name + 5 pips ('use client')
├── week-grid.tsx           # 52-cell heatmap grid (server component)
└── progress-message.tsx    # Encouraging message based on day count

actions/                    # Next.js Server Actions
├── week-actions.ts         # toggleDay, saveNotes, navigateWeek
├── phase-actions.ts        # setCurrentPhase
├── skill-actions.ts        # updateSkillRating
└── tab-actions.ts          # updateLastTab

data/                       # SQLite file (gitignored)
└── writing-tracker.db

tailwind.config.ts          # Custom palette: paper, ink, ink-light, accent, accent-light
next.config.ts              # Next.js config (minimal)
tsconfig.json               # TypeScript strict mode
package.json
```

**Structure Decision**: Single Next.js project. No separate frontend/backend — App Router handles both via server components (data) and Server Actions (mutations). This is the simplest architecture that satisfies all requirements.

## Complexity Tracking

No constitution violations to justify. The architecture is the simplest option that works:
- 3 database tables (the minimum to represent the domain)
- 4 routes (one per tab, matching the PRD)
- Server Actions as the write path (built into Next.js, no extra dependency)
- Static content in TypeScript (no CMS, no extra table)

## Implementation Order

Per `plan-promt.md` §"What to Build First":

1. **Project scaffold** — create-next-app, Tailwind, better-sqlite3, file structure
2. **Database layer** — db.ts (init + migrations), queries.ts, mutations.ts
3. **Static content** — program-content.ts with all phases, exercises, prompts, reading list
4. **Layout + navigation** — Root layout, TabNav, 4 route pages, last-tab redirect
5. **Plan view** — Phase cards with expand/collapse, set-current-phase action
6. **This Week view** — Day tracker, exercise display, notes, friend prompt, week navigation
7. **Skills view** — Skill rating pips, labels, reading list
8. **Log view** — 52-week heatmap grid, summary stats, recent notes, cell-click navigation
9. **Polish** — Mobile spacing, hover states, edge cases, empty states

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite over localStorage | Constitution V: "All writes server-side." Server-persisted data survives device switches. |
| No ORM | Constitution II: 3 tables, ~10 queries — raw SQL is simpler than any ORM. |
| Lazy week creation | Simplicity: don't pre-populate 52 rows. Create week_logs rows on first interaction. |
| JSON array for days | Simpler than a separate `day_logs` table. 7 booleans per week doesn't warrant normalization. |
| Static content in TS | PRD §7–9 content is immutable. A database table adds complexity with no benefit. |
| Client components only at leaf | Constitution VII: server-render by default. Only interactive bits (toggles, pips, textarea) are client. |
| No optimistic UI in v1 | SQLite is local → mutations complete in < 50ms. No perceived latency to mask. |
| Notes auto-save | Debounce (1s after typing stops) + save on blur as fallback. Prevents data loss on tab close. |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAN | mode: HOLD_SCOPE, 0 critical gaps |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAN | 0 issues, 0 critical gaps |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |

**VERDICT:** CEO + ENG CLEARED — ready to implement.
