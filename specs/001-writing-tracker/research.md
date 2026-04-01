# Research: The Writer's Ledger

**Branch**: `001-writing-tracker` | **Date**: 2026-04-01

## 1. SQLite Singleton in Next.js App Router

**Decision**: Use `globalThis` singleton pattern for `better-sqlite3` connection in `lib/db.ts`.

**Rationale**: Next.js dev mode hot-reloads modules, creating duplicate DB connections. Storing the instance on `globalThis` in development prevents this. In production, normal module caching suffices. `better-sqlite3` is synchronous, so it works naturally with Server Components and Server Actions — no async wrappers needed.

**Pattern**:
```typescript
import Database from 'better-sqlite3';

const globalForDb = globalThis as unknown as { db: Database.Database };

export const db = globalForDb.db ?? new Database('./data/writing-tracker.db');

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
```

**Alternatives considered**:
- Prisma with SQLite adapter — adds ORM overhead, violates Constitution II (20+ lines of raw SQL solve the problem)
- Drizzle ORM — lighter but still an unnecessary abstraction for 3 tables

## 2. Testing Strategy

**Decision**: Vitest for unit/integration tests, Playwright for e2e.

**Rationale**:
- **Unit (Vitest)**: Test `lib/queries.ts`, `lib/mutations.ts`, `lib/program-content.ts` against an in-memory SQLite database. Pure functions, fast (<2s per test per Constitution VIII).
- **Integration (Vitest)**: Test Server Actions by calling the underlying mutation functions directly with a test DB.
- **E2E (Playwright)**: Test critical user paths — log a day, navigate weeks, set phase, rate skills. Max 5 e2e tests covering the 6 user stories.

**Gotchas**:
- Server Actions can't be unit-tested directly in isolation — test the mutation layer they call instead.
- Async Server Components need Playwright, not Vitest/RTL.
- Use `:memory:` SQLite databases in tests for speed and isolation.

**Alternatives considered**:
- Jest — slower startup, worse ESM support than Vitest
- Cypress — heavier than Playwright, not recommended by Next.js docs

## 3. Deployment: SQLite on Fly.io

**Decision**: Deploy to Fly.io with a persistent volume mounted at `/app/data`.

**Rationale**: `better-sqlite3` ships precompiled binaries for Linux x64 — no custom native compilation needed. Fly.io persistent volumes survive redeploys. Single-user app means no write contention, so no need for LiteFS or WAL mode.

**Configuration**:
```toml
# fly.toml
[mounts]
  source = "data"
  destination = "/app/data"
  initial_size = "1"
```

**Gotchas**:
- Ephemeral disk is wiped on redeploy — DB file must be on the mounted volume
- Keep journal mode as default (DELETE), not WAL, for simplicity on single-machine
- Test backup/restore before launch

**Alternatives considered**:
- Railway — also supports persistent disk, similar setup
- Turso (libSQL) — adds network latency unnecessarily for a single-user local-disk app
- localStorage (original spec) — rejected in favor of server-side persistence per Constitution V

## 4. Tailwind Custom Theme

**Decision**: Extend `theme.colors` in `tailwind.config.ts` with 5 custom colors.

**Rationale**: Small, fixed palette (5 colors) doesn't warrant CSS custom properties or a design token system. Direct theme extension generates all Tailwind utilities (`bg-paper`, `text-ink`, `border-accent`, etc.) with zero runtime cost.

**Palette**:
| Token | Hex | Use |
|-------|-----|-----|
| `paper` | `#faf8f3` | Background (warm off-white) |
| `ink` | `#2c2c2c` | Primary text |
| `ink-light` | `#8b8b8b` | Secondary text |
| `accent` | `#c97c5f` | Highlights, active states (muted terracotta) |
| `accent-light` | `#e8d5ca` | Hover, light backgrounds |

**Alternatives considered**:
- CSS variables with Tailwind v4 — overkill for 5 static colors
- Inline styles — violates Constitution VII (no inline styles)

## 5. Architecture: Spec vs plan-promt.md Reconciliation

**Decision**: Follow `plan-promt.md` tech stack (Next.js + SQLite) over original spec assumption (localStorage).

**Rationale**: The original spec assumed "browser local storage (or equivalent client-side persistence)" but the project prompt explicitly locks the stack to Next.js 14+ with SQLite via better-sqlite3. This aligns better with Constitution V ("All writes happen server-side") and Constitution IV (proper data persistence with migrations). The plan-promt.md was provided as explicit user direction.

**Impact on spec**:
- Spec assumption "Data will be persisted using browser local storage" is superseded
- All 24 functional requirements remain unchanged — only the persistence mechanism changes
- Edge case "browser local storage is full or unavailable" becomes moot (server-side storage)
