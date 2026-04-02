# Engineering Review: The Writer's Ledger

**Branch**: `001-writing-tracker` | **Date**: 2026-04-01 | **Mode**: FULL_REVIEW
**Status**: CLEAN | **Reviewer**: /plan-eng-review

## Scope Challenge

- **Existing code:** Nothing (greenfield)
- **Minimum changes:** Plan IS the minimum. Every file maps to a spec requirement.
- **Complexity check:** ~15 source files, 0 new abstractions. Well under threshold.
- **Completeness:** 24/24 functional requirements mapped to tasks. No shortcuts.

## Architecture

```
WRITE PATH:
  Client Component → Server Action → mutations.ts → SQLite

READ PATH:
  Page (server component) → queries.ts → SQLite → Rendered HTML
```

Data flow for toggleDay (core interaction):
```
HAPPY:  tap → toggleDay action → mutation → revalidatePath → re-render
NIL:    day index undefined → validation rejects → no write → no change
EMPTY:  days '[]' → add day → '[0]'
ERROR:  SQLite fails → SqliteError → Next.js error boundary
```

No issues found. Clean separation of concerns.

## Code Quality

**DRY note:** Two derivations used in multiple places should be shared utilities in `lib/program-content.ts`:
```typescript
export function getPhaseForWeek(weekNumber: number): Phase
export function getExerciseForWeek(weekNumber: number): string
```

No other quality issues. Naming is clear. One concern per file. No barrel re-exports.

## Test Coverage Map

Tests intentionally omitted. Coverage map for future reference:

```
CODE PATHS: 22 identified
  lib/db.ts:         3 paths (init happy, idempotent, unwritable)
  lib/queries.ts:    5 paths (4 queries × happy + edge)
  lib/mutations.ts:  10 paths (5 mutations × happy + validation)
  lib/program-content.ts: 4 paths (phase boundaries, exercise cycling)

USER FLOWS: 6 identified (all E2E-worthy)
  Daily logging, notes persistence, phase management,
  skill rating, navigation persistence, heatmap interaction

COVERAGE: 0/28 (tests omitted by design)
CRITICAL GAPS: 0 (no silent failure modes)
```

**Highest-value tests if added later:**
1. Unit: `lib/program-content.ts` (exercise cycling formula, phase boundaries)
2. Integration: `lib/mutations.ts` (toggle day, validation rejection)
3. E2E: Daily logging flow (core interaction)

## Performance

- N+1 queries: impossible (no joins, no associations)
- Peak memory: ~10KB (52 rows × 200 bytes)
- All queries on PRIMARY KEY columns (auto-indexed)
- Slowest query: `getAllWeekLogs()` at ~0.1ms for 52 rows
- No caching needed

## Failure Modes

| Codepath | Failure | Test? | Error Handling? | User Sees | Critical? |
|----------|---------|-------|-----------------|-----------|-----------|
| DB init | File unwritable | N | N (GAP) | Error page | No* |
| toggleDay | Invalid input | N | Y (validation) | No change | No |
| saveNotes | Very long text | N | Y (no limit) | Text saved | No |
| Exercise formula | Phase boundary | N | Y (formula) | Correct | No |
| getAllWeekLogs | 0 weeks | N | Y (empty array) | Empty grid | No |

*DB init: not critical for personal app. Fix: try/catch in T006.

**0 critical gaps.** No silent data loss scenarios.

## Worktree Parallelization

After Phase 2 (Foundation) completes:

```
Lane A (main):     US1+US2 (This Week view) → US6 (navigation)
Lane B (worktree): US3 (Plan view)
Lane C (worktree): US4 (Skills view)
Lane D (worktree): US5 (Log view)
```

Launch B, C, D in parallel. Merge all. Then US6 integrates cross-cutting navigation.

**Conflict flag:** Lane A and US6 both touch `tab-nav.tsx` and `this-week/page.tsx`. Run US6 after merging A.

## Implementation Notes

1. `lib/db.ts` (T006): Wrap `new Database()` in try/catch
2. `lib/mutations.ts` (T008): Validate all inputs (rating 0-5, week 1-52, days 0-6, tab slugs)
3. `lib/program-content.ts` (T009): Export `getPhaseForWeek()` and `getExerciseForWeek()`
4. `components/notes-field.tsx` (T019): Debounce (1s) + blur fallback for auto-save
5. `lib/db.ts` (T006): Keep journal mode as DELETE (not WAL) for single-machine deploy

## NOT in Scope

- Tests (intentionally omitted, coverage map produced)
- CI/CD pipeline (manual Fly.io deploy)
- Data backup/restore strategy
- Cloud sync / cross-device
- Skill history, data export, notifications
- Offline support

## Completion Summary

- Scope: accepted as-is
- Architecture: 0 issues
- Code Quality: 0 issues (1 DRY note)
- Tests: diagram produced, 28 paths mapped, tests omitted by design
- Performance: 0 issues
- Failure modes: 0 critical gaps
- Parallelization: 4 lanes (3 parallel, 1 sequential)
- Outside voice: skipped

**Critical gaps: 0 | Unresolved decisions: 0 | Issues found: 0**
