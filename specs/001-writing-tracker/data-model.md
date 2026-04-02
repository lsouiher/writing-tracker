# Data Model: The Writer's Ledger

**Branch**: `001-writing-tracker` | **Date**: 2026-04-01

## Overview

Three SQLite tables + one static TypeScript module. No ORM. Raw SQL via `better-sqlite3`.

## Tables

### user_state

Single-row table tracking the user's position in the program.

| Column | Type | Default | Constraint | Notes |
|--------|------|---------|------------|-------|
| `id` | INTEGER | — | PRIMARY KEY, CHECK (id = 1) | Enforces single row |
| `current_phase` | INTEGER | 0 | NOT NULL | Range: 0–3 (index into phases array) |
| `current_week` | INTEGER | 1 | NOT NULL | Range: 1–52 |
| `last_tab` | TEXT | 'plan' | NOT NULL | One of: 'plan', 'this-week', 'skills', 'log' |
| `updated_at` | TEXT | datetime('now') | NOT NULL | ISO 8601 timestamp |

**Validation rules**:
- `current_phase` must be 0–3
- `current_week` must be 1–52
- `last_tab` must be one of the 4 valid tab slugs
- Row is inserted on DB init if not present

**State transitions**:
- `current_phase`: User manually advances/reverts via Plan view (no automatic progression)
- `current_week`: Updated when user navigates in This Week view (represents "last viewed week")
- `last_tab`: Updated on every tab switch

### week_logs

One row per week (created on first interaction with that week).

| Column | Type | Default | Constraint | Notes |
|--------|------|---------|------------|-------|
| `week_number` | INTEGER | — | PRIMARY KEY | Range: 1–52 |
| `days` | TEXT | '[]' | NOT NULL | JSON array of marked day indices (0=Mon, 6=Sun) |
| `notes` | TEXT | '' | NOT NULL | Free-text weekly reflection |
| `updated_at` | TEXT | datetime('now') | NOT NULL | ISO 8601 timestamp |

**Validation rules**:
- `week_number` must be 1–52
- `days` is a JSON array containing only integers 0–6, no duplicates
- `notes` has no length limit in v1

**Example `days` values**:
- `[]` — no days marked
- `[0, 2, 4]` — Mon, Wed, Fri marked
- `[0, 1, 2, 3, 4, 5, 6]` — all 7 days marked

**Insert strategy**: Use `INSERT OR IGNORE` when a week is first accessed, then `UPDATE` for changes. This avoids needing to pre-populate all 52 rows.

### skill_ratings

One row per skill (6 total, pre-populated on DB init).

| Column | Type | Default | Constraint | Notes |
|--------|------|---------|------------|-------|
| `skill_key` | TEXT | — | PRIMARY KEY | e.g., 'sentence_variety' |
| `rating` | INTEGER | 0 | NOT NULL | Range: 0–5 |
| `updated_at` | TEXT | datetime('now') | NOT NULL | ISO 8601 timestamp |

**Skill keys** (6 total):
1. `sentence_variety`
2. `paragraph_structure`
3. `voice_tone`
4. `storytelling`
5. `business_writing`
6. `editing_revision`

**Validation rules**:
- `rating` must be 0–5
- All 6 rows inserted on DB init with rating=0
- No soft delete needed (ratings are overwritten, never deleted)

**Rating labels** (presentation only, not stored):
| Rating | Label |
|--------|-------|
| 0 | — |
| 1 | beginner |
| 2 | learning |
| 3 | developing |
| 4 | confident |
| 5 | strong |

## Static Content (TypeScript, not in DB)

Defined in `lib/program-content.ts`. Not stored in the database per plan-promt.md.

### Phase

```typescript
type Phase = {
  id: number;                    // 0–3
  name: string;                  // e.g., "Foundation"
  weekRange: [number, number];   // e.g., [1, 8]
  focus: string;                 // One-line description
  weeklyGoal: string;            // Weekly goal statement
  skillTags: string[];           // 4 tags
  exercises: string[];           // 8 exercises
  friendPrompt: string;          // Mentor session prompt
};
```

**Phases**:
| id | name | weekRange | exercises |
|----|------|-----------|-----------|
| 0 | Foundation | [1, 8] | 8 from PRD §7 Phase 1 |
| 1 | Craft | [9, 20] | 8 from PRD §7 Phase 2 |
| 2 | Range | [21, 36] | 8 from PRD §7 Phase 3 |
| 3 | Refinement | [37, 52] | 8 from PRD §7 Phase 4 |

### Reading List

```typescript
type Book = {
  title: string;
  author: string;
  description: string;
};
```

5 books from PRD §9, exported as a static array.

## Derived Data (computed, not stored)

| Derivation | Formula |
|------------|---------|
| Exercise of the week | `phase.exercises[(weekNumber - phase.weekRange[0]) % 8]` |
| Phase for a given week | Find phase where `weekRange[0] <= week <= weekRange[1]` |
| Days written count | `JSON.parse(week.days).length` |
| Progress message | count ≥ 4: "great week", 2–3: "keep going", 0–1: "get writing" |
| Weeks active | Count of week_logs rows where `days` is not '[]' |
| Total days written | Sum of `JSON.parse(days).length` across all week_logs |
| Heatmap shading | 0 days: empty, 1–2: faint, 3–4: medium, 5–7: full |

## Relationships

```
user_state (1) ──references──> Phase (static, by current_phase index)
user_state (1) ──references──> week_logs (by current_week)
week_logs (52 max) ──derived──> Phase (by week_number → phase.weekRange)
skill_ratings (6) ──standalone──
```

No foreign keys needed — `user_state.current_phase` is an index into the static phases array, and `user_state.current_week` corresponds to `week_logs.week_number` but doesn't need a FK (weeks are created lazily).

## Migration Strategy

Single migration in `lib/db.ts` on first run:
1. Create all 3 tables with `CREATE TABLE IF NOT EXISTS`
2. Insert `user_state` row (id=1) with `INSERT OR IGNORE`
3. Insert 6 `skill_ratings` rows with `INSERT OR IGNORE`

Future migrations are append-only per Constitution IV.
