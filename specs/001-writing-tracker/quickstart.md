# Quickstart: The Writer's Ledger

## Prerequisites

- Node.js ≥ 22
- bun (package manager)

## Setup

```bash
# Clone and enter the project
git clone <repo-url>
cd writing-tracker

# Install dependencies
bun install

# Create the data directory (gitignored)
mkdir -p data

# Start dev server
bun run dev
```

The app will be available at `http://localhost:3000`. On first visit, the SQLite database is created automatically at `data/writing-tracker.db`.

## Project Structure

```
app/                    # Next.js App Router (pages = server components)
├── layout.tsx          # Root layout with tab navigation
├── plan/page.tsx       # Phase Plan view
├── this-week/page.tsx  # This Week view (daily logging, exercises, notes)
├── skills/page.tsx     # Skills Self-Assessment view
└── log/page.tsx        # Progress Log view (52-week heatmap)

lib/                    # Data access + business logic (server-only)
├── db.ts               # SQLite connection singleton + migrations
├── queries.ts          # All read queries
├── mutations.ts        # All write queries
└── program-content.ts  # Static content (phases, exercises, reading list)

components/             # Shared UI components (no data access)
├── day-tracker.tsx     # 7-day toggle buttons (client component)
├── phase-card.tsx      # Expandable phase card (client component)
├── skill-row.tsx       # Skill rating pips (client component)
├── week-grid.tsx       # 52-cell heatmap grid
└── tab-nav.tsx         # Tab navigation bar

actions/                # Next.js Server Actions (thin glue layer)
├── week-actions.ts     # Toggle day, save notes, navigate week
├── phase-actions.ts    # Set current phase
└── skill-actions.ts    # Update skill rating

data/                   # SQLite database (gitignored)
└── writing-tracker.db
```

## Key Conventions

- **Pages are server components** — they fetch data via `lib/queries.ts`
- **Client components** are marked with `'use client'` and kept small (leaf-level)
- **All writes** go through Server Actions in `actions/` → `lib/mutations.ts`
- **No imports** from `lib/queries.ts` or `lib/mutations.ts` in components
- **Static content** lives in `lib/program-content.ts`, not in the database

## Database

SQLite via `better-sqlite3`. Three tables:
- `user_state` — single row tracking current phase, week, last tab
- `week_logs` — per-week day logs and notes (created lazily)
- `skill_ratings` — 6 skill self-assessments (pre-populated)

Tables are auto-created on first run. Migrations are append-only.

## Testing

```bash
# Unit + integration tests
bun run test

# E2E tests
bun run test:e2e
```

- **Unit**: Vitest — test queries, mutations, program-content against in-memory SQLite
- **E2E**: Playwright — test critical user paths in a real browser

## Deployment

Target: Fly.io with persistent volume for SQLite file.

```bash
fly launch
fly volumes create data --size 1
fly deploy
```

Ensure `fly.toml` mounts the volume at `/app/data`.
