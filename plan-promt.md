# Claude Code — Project Prompt

## What You Are Building

The Writer's Ledger: a personal web app for a single user tracking a 52-week English writing program. Read the full PRD in `writing-tracker-prd.md` and obey every rule in `constitution.md`. The constitution supersedes all other conventions — if a framework doc or library pattern conflicts with it, the constitution wins.

---

## Tech Stack (locked — do not deviate)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | Server components by default. Client components only when interactivity requires it. |
| Database | **SQLite via `better-sqlite3`** | Single file DB. No ORM. Raw SQL queries. |
| Styling | **Tailwind CSS** | Mobile-first. No inline styles. No component library. |
| Language | **TypeScript** | Strict mode enabled. |
| Deployment target | Single VPS (Fly.io / Railway) | SQLite file lives on persistent disk. |

**Do not add** any dependency not listed above unless you can justify it in one sentence against Constitution Principle II. Specifically: no Prisma, no Drizzle, no Redux, no Zustand, no shadcn/ui, no component library, no Docker.

---

## Project Structure

Follow Constitution Principle III (one concern per file, separate layers clearly, no barrel re-exports). Use this layout:

```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with tab navigation
│   ├── plan/page.tsx       # Phase Plan view
│   ├── this-week/page.tsx  # This Week view
│   ├── skills/page.tsx     # Skills Self-Assessment view
│   └── log/page.tsx        # Progress Log view
├── lib/
│   ├── db.ts               # Single file: init DB connection, run migrations
│   ├── queries.ts          # All SQL read queries (no business logic)
│   ├── mutations.ts        # All SQL write queries (no business logic)
│   └── program-content.ts  # Static content: phases, exercises, prompts, reading list
├── components/             # Shared presentational components (no data access)
│   ├── day-tracker.tsx
│   ├── phase-card.tsx
│   ├── skill-row.tsx
│   ├── week-grid.tsx
│   └── tab-nav.tsx
├── actions/                # Next.js Server Actions (thin glue: validate → call mutation → revalidate)
│   ├── week-actions.ts
│   ├── phase-actions.ts
│   └── skill-actions.ts
├── data/
│   └── writing-tracker.db  # SQLite file (gitignored)
├── writing-tracker-prd.md
├── constitution.md
└── tailwind.config.ts
```

**Rules:**
- Components never import from `lib/queries.ts` or `lib/mutations.ts` directly.
- Pages (server components) call queries. Client components call server actions.
- `program-content.ts` is a plain TypeScript file exporting typed objects — no database table for static program content.

---

## Database Schema

Create all tables in `lib/db.ts` on first run. Migrations are append-only (Constitution IV).

```sql
CREATE TABLE IF NOT EXISTS user_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- single user, single row
  current_phase INTEGER NOT NULL DEFAULT 0,
  current_week INTEGER NOT NULL DEFAULT 1,
  last_tab TEXT NOT NULL DEFAULT 'plan',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS week_logs (
  week_number INTEGER PRIMARY KEY,       -- 1–52
  days TEXT NOT NULL DEFAULT '[]',        -- JSON array of marked day indices [0=Mon..6=Sun]
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skill_ratings (
  skill_key TEXT PRIMARY KEY,            -- e.g. 'sentence_variety'
  rating INTEGER NOT NULL DEFAULT 0,     -- 0–5
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Rules:**
- No optional/nullable fields without a documented reason (Constitution IV).
- `days` is stored as a JSON array string — simpler than a separate days table.
- Insert the single `user_state` row on DB init if it doesn't exist.
- Insert all 6 `skill_ratings` rows on DB init with default 0.

---

## Static Content Structure

In `lib/program-content.ts`, export a typed array of 4 phases. Each phase object:

```typescript
type Phase = {
  id: number;              // 0–3
  name: string;            // e.g. "Foundation"
  weekRange: [number, number]; // e.g. [1, 8]
  focus: string;
  weeklyGoal: string;
  skillTags: string[];     // 4 tags
  exercises: string[];     // 8 exercises
  friendPrompt: string;
};
```

Pull all content verbatim from the PRD sections 3, 7, and 8. Also export the reading list from PRD section 9.

---

## Implementation Rules

### Server vs. Client Components
- **Server by default.** Pages are server components that fetch data via `lib/queries.ts`.
- **Client only for:** day tracker toggle buttons, skill rating taps, notes textarea, phase expand/collapse, week navigation arrows.
- Mark client components with `'use client'` at the top. Keep them small and leaf-level.

### Data Writes
- All writes go through Next.js Server Actions in `actions/`.
- Server actions call functions from `lib/mutations.ts`.
- After mutation, call `revalidatePath()` so server components re-render with fresh data.
- No optimistic UI needed for v1 — operations are local SQLite and effectively instant.

### Navigation & Tabs
- 4 tabs always visible at the top: Plan, This Week, Skills, Log.
- Use `<Link>` from Next.js. Active tab is visually highlighted.
- On first visit (no `user_state` row), land on Plan. After that, remember `last_tab` and redirect on `/`.

### This Week View Logic
- Current week determined by `user_state.current_week`.
- Back/forward arrows change the viewed week (not necessarily current_week — user can browse history).
- Exercise of the week: `phase.exercises[(weekNumber - phase.weekRange[0]) % 8]`.
- Progress message: count marked days → "great week" (4+), "keep going" (2–3), "get writing" (0–1).

### Progress Log Grid
- 52-cell grid: 13 columns × 4 rows.
- Cell shading based on day count: 0 = empty/dark, 1–2 = faint, 3–4 = medium, 5–7 = full.
- Current week gets a distinct outline.
- Clicking a cell navigates to `/this-week?week=N`.

### Skills View
- 6 rows. Each row: skill name + 5 clickable pips.
- Tapping a pip sets rating. Tapping the active pip clears to 0.
- Labels: 0="—", 1="beginner", 2="learning", 3="developing", 4="confident", 5="strong".
- Below skills: static reading list from PRD section 9.

---

## Design Direction

- **Mobile-first.** Default layout works on 375px wide. Desktop is a nice-to-have.
- **Notebook/journal aesthetic.** Warm, muted palette. Think cream/paper backgrounds, soft ink tones, serif or readable sans-serif for headings. No bright colors, no gamification, no confetti.
- **Tailwind only.** Define a small custom color palette in `tailwind.config.ts`:
  - `paper` (warm off-white background)
  - `ink` (dark text)
  - `ink-light` (secondary text)
  - `accent` (one muted warm tone for highlights and active states)
  - `accent-light` (lighter variant for hover/backgrounds)
- **Minimal motion.** No animations except subtle transitions on tab switching and day-tracker taps.
- **Typography matters.** Pick a clean system font stack. Generous line height. The app should feel pleasant to read.

---

## What to Build First

Follow this order. Finish each step before moving on.

1. **Project scaffold.** `create-next-app`, add Tailwind, add `better-sqlite3`, create the file structure above.
2. **Database layer.** `lib/db.ts` (init + migrations), `lib/queries.ts`, `lib/mutations.ts`. Verify with a simple test script.
3. **Static content.** `lib/program-content.ts` with all 4 phases, exercises, prompts, reading list.
4. **Layout + navigation.** Root layout with tab bar. Route to 4 pages. Remember last tab.
5. **Plan view.** Phase cards, expand/collapse, set current phase.
6. **This Week view.** Day tracker, exercise display, notes field, friend prompt, week navigation.
7. **Skills view.** Skill rating pips, labels, reading list.
8. **Log view.** 52-week grid with heatmap shading, stats, recent notes, click-to-navigate.
9. **Polish.** Mobile spacing, hover states, loading edge cases, empty states.

---

## Final Checklist (run before calling it done)

- [ ] All data persists across page refresh and browser close
- [ ] Current phase, current week, and last tab are remembered
- [ ] Day tracker toggles are instant and saved
- [ ] Notes save automatically (on blur or after typing stops)
- [ ] Exercise cycles correctly through 8 per phase
- [ ] 52-week grid shading matches actual day counts
- [ ] Clicking a grid cell navigates to that week
- [ ] Skill ratings persist and toggle correctly
- [ ] App is usable on a 375px screen with thumb taps
- [ ] No unnecessary dependencies were added
- [ ] Constitution principles are not violated
