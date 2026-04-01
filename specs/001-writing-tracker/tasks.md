# Tasks: The Writer's Ledger

**Input**: Design documents from `specs/001-writing-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in spec. Test tasks omitted.

**Organization**: Tasks grouped by user story. P1 stories (US1–US3) first, then P2 (US4–US6), then polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US6)
- Exact file paths included

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project scaffold, tooling, Tailwind config

- [x] T001 Initialize Next.js 14+ project with App Router, TypeScript strict mode, and Tailwind CSS in project root
- [x] T002 Install `better-sqlite3` and `@types/better-sqlite3` as dependencies
- [x] T003 [P] Create `data/` directory and add `data/` to `.gitignore`
- [x] T004 [P] Configure custom Tailwind palette (paper, ink, ink-light, accent, accent-light) in `tailwind.config.ts`
- [x] T005 [P] Create empty directory structure: `lib/`, `components/`, `actions/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database layer, static content, root layout — MUST complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Implement SQLite singleton connection with globalThis pattern and table creation (user_state, week_logs, skill_ratings) in `lib/db.ts`
- [x] T007 Implement all read queries (getUserState, getWeekLog, getAllWeekLogs, getSkillRatings) in `lib/queries.ts`
- [x] T008 Implement all write mutations (toggleDay, saveNotes, setCurrentPhase, updateCurrentWeek, updateLastTab, setSkillRating) with input validation (rating 0–5, week_number 1–52, days array contains only integers 0–6, last_tab is valid slug) in `lib/mutations.ts`
- [x] T009 [P] Create static program content (4 phases with exercises, prompts, skill tags, reading list) from PRD §7–9 in `lib/program-content.ts`
- [x] T010 Create root layout with HTML structure, font config, and TabNav component in `app/layout.tsx`
- [x] T011 [P] Create TabNav component with 4 tab links (Plan, This Week, Skills, Log) and active-tab highlighting in `components/tab-nav.tsx`
- [x] T012 Create root page that redirects to last_tab (or /plan on first visit) in `app/page.tsx`
- [x] T013 [P] Create updateLastTab Server Action in `actions/tab-actions.ts`

**Checkpoint**: Foundation ready — root layout renders, DB initializes, all queries/mutations available, tab navigation works

---

## Phase 3: User Story 1 — Log Daily Writing Activity (Priority: P1) 🎯 MVP

**Goal**: User can tap day buttons (Mon–Sun) to log writing days, see a progress message, and have data persist across sessions.

**Independent Test**: Open app → tap This Week → tap a day → close browser → reopen → verify day is still marked and progress message is correct.

### Implementation for User Story 1

- [x] T014 [US1] Create This Week page (server component) that fetches current week data and renders day tracker, progress message in `app/this-week/page.tsx`
- [x] T015 [US1] Create DayTracker client component with 7 toggle buttons (Mon–Sun) that calls toggleDay action in `components/day-tracker.tsx`
- [x] T016 [US1] Create ProgressMessage component that displays "great week" / "keep going" / "get writing" based on days count in `components/progress-message.tsx`
- [x] T017 [US1] Implement toggleDay and navigateWeek Server Actions in `actions/week-actions.ts`

**Checkpoint**: User can log daily writing activity on the This Week tab. Days persist across page refresh. Progress message updates immediately.

---

## Phase 4: User Story 2 — View Weekly Exercise and Write Reflections (Priority: P1)

**Goal**: User sees the correct exercise for the current week/phase, writes free-text notes, and sees the friend session prompt. All notes persist.

**Independent Test**: Navigate to a week → verify correct exercise from phase → type notes → navigate away → return → verify notes and exercise preserved.

### Implementation for User Story 2

- [x] T018 [US2] Add exercise display section to This Week page showing the auto-selected exercise from current phase in `app/this-week/page.tsx`
- [x] T019 [US2] Create NotesField client component with auto-save (on blur / debounced) that calls saveNotes action in `components/notes-field.tsx`
- [x] T020 [US2] Add friend session prompt display (static, from current phase) to This Week page in `app/this-week/page.tsx`
- [x] T021 [US2] Implement saveNotes Server Action in `actions/week-actions.ts`

**Checkpoint**: This Week view shows correct exercise, accepts and persists notes, displays friend prompt. Exercise cycles correctly through 8 per phase.

---

## Phase 5: User Story 3 — Navigate and Manage the 52-Week Program (Priority: P1)

**Goal**: User sees all 4 phases as cards, can expand/collapse them, and set the current phase. Plan tab is the default first-visit landing.

**Independent Test**: Open Plan tab → see 4 phase cards → expand Phase 1 → verify exercises and prompt → tap Phase 2 → switch to This Week → verify exercises reflect Phase 2.

### Implementation for User Story 3

- [x] T022 [US3] Create Plan page (server component) that fetches current phase and renders 4 phase cards in `app/plan/page.tsx`
- [x] T023 [US3] Create PhaseCard client component with expand/collapse, current-phase highlighting, and set-phase-on-tap in `components/phase-card.tsx`
- [x] T024 [US3] Implement setCurrentPhase Server Action in `actions/phase-actions.ts`
- [x] T025 [US3] Create WeekNavigator client component with back/forward arrows and week number display in `components/week-navigator.tsx`
- [x] T026 [US3] Integrate WeekNavigator into This Week page with week boundary enforcement (1–52) in `app/this-week/page.tsx`

**Checkpoint**: Plan view shows all 4 phases with expand/collapse. Changing phase updates This Week exercises. Week navigation works within 1–52 range.

---

## Phase 6: User Story 4 — Track Skill Growth Over Time (Priority: P2)

**Goal**: User rates 6 writing skills on a 5-pip scale with labels. Ratings persist. Reading list displayed below.

**Independent Test**: Open Skills tab → set ratings for all 6 skills → close browser → reopen → verify all ratings preserved. Verify reading list shows 5 books.

### Implementation for User Story 4

- [x] T027 [US4] Create Skills page (server component) that fetches skill ratings and renders skill rows + reading list in `app/skills/page.tsx`
- [x] T028 [US4] Create SkillRow client component with 5 clickable pips, rating labels, and toggle-to-clear behavior in `components/skill-row.tsx`
- [x] T029 [US4] Implement updateSkillRating Server Action in `actions/skill-actions.ts`

**Checkpoint**: Skills view shows 6 skills with interactive pips, correct labels, and 5 books. Ratings persist across sessions.

---

## Phase 7: User Story 5 — View Progress Across the Full Journey (Priority: P2)

**Goal**: User sees a 52-cell heatmap grid with shading, can tap a cell to navigate to that week, and sees summary stats and recent notes.

**Independent Test**: Mark days in several weeks → open Log tab → verify cells shade correctly → tap a cell → verify navigation to that week → verify stats are accurate.

### Implementation for User Story 5

- [x] T030 [US5] Create Log page (server component) that fetches all week logs, computes stats, and renders grid + stats + recent notes in `app/log/page.tsx`
- [x] T031 [US5] Create WeekGrid component rendering 52 cells (13×4) with heatmap shading and current-week outline in `components/week-grid.tsx`
- [x] T032 [US5] Add cell-click navigation (Link to `/this-week?week=N`) to WeekGrid in `components/week-grid.tsx`
- [x] T033 [US5] Add summary stats section (Weeks Active, Total Days Written, Current Phase, Current Week) to Log page in `app/log/page.tsx`
- [x] T034 [US5] Add recent notes section (last 5 weeks with notes, truncated previews) to Log page in `app/log/page.tsx`

**Checkpoint**: Log view shows accurate 52-week heatmap, correct shading, working cell navigation, and up-to-date summary stats.

---

## Phase 8: User Story 6 — Seamless Navigation and State Persistence (Priority: P2)

**Goal**: Tab bar always visible, last tab remembered, week navigation preserves data integrity.

**Independent Test**: Switch between all 4 tabs → close browser → reopen → verify last tab restored. Navigate between weeks → verify data intact across all visited weeks.

### Implementation for User Story 6

- [x] T035 [US6] Add active-tab tracking: call updateLastTab action on every tab switch in `components/tab-nav.tsx`
- [x] T036 [US6] Support `?week=N` query parameter in This Week page for direct week navigation from Log grid in `app/this-week/page.tsx`
- [x] T037 [US6] Handle historical week display: when viewing a past week, derive the phase from weekRange (not user's current phase) so exercises match the week's phase in `app/this-week/page.tsx`

**Checkpoint**: Full navigation loop works — all tabs remember state, week navigation is seamless, no data loss on any transition.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Mobile optimization, edge cases, accessibility, performance

- [ ] T038 [P] Mobile spacing and touch-target sizing (≥ 44px tap targets) across all components
- [ ] T039 [P] Hover states and focus styles for all interactive elements (day buttons, pips, phase cards, grid cells)
- [ ] T040 [P] Empty states: Log view with no data, Skills with all ratings at 0, This Week with no days marked
- [ ] T041 [P] Accessibility audit: semantic HTML, keyboard navigation for all interactive elements, ARIA labels, color contrast verification
- [ ] T042 [P] Performance check: verify < 3s load on throttled connection, < 2s day-log interaction
- [ ] T043 Narrow viewport handling: 52-cell grid readable on 360px screens (horizontal scroll if needed) in `components/week-grid.tsx`
- [ ] T044 Run final checklist from plan-promt.md §"Final Checklist" against deployed app

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — can start immediately after Phase 2
- **US2 (Phase 4)**: Depends on Foundational + US1 (shares This Week page)
- **US3 (Phase 5)**: Depends on Foundational — can run in parallel with US1
- **US4 (Phase 6)**: Depends on Foundational — can run in parallel with US1–US3
- **US5 (Phase 7)**: Depends on Foundational — benefits from US1 data but can be built independently
- **US6 (Phase 8)**: Depends on all prior stories (cross-cutting navigation)
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → ┬→ US1 (P1) → US2 (P1, extends This Week page)
                                            ├→ US3 (P1, independent — Plan view)
                                            ├→ US4 (P2, independent — Skills view)
                                            ├→ US5 (P2, independent — Log view)
                                            └→ US6 (P2, cross-cutting — after all views exist)
                                                                          ↓
                                                                    Phase 9 (Polish)
```

### Within Each User Story

- Server page component before client components (page provides data context)
- Server Actions alongside or before client components that call them
- Integration/wiring last

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 can all run in parallel
- **Phase 2**: T009 (static content) parallel with T006–T008 (DB layer); T011, T013 parallel with T010
- **After Phase 2**: US3 (Plan view) and US4 (Skills view) are fully independent and can run in parallel with US1
- **Phase 9**: All polish tasks (T038–T043) can run in parallel

---

## Parallel Example: After Foundational Phase

```
# These can all start simultaneously after Phase 2:

Agent A (This Week view):
  T014 → T015, T016, T017 (US1)
  T018 → T019, T020, T021 (US2)

Agent B (Plan view):
  T022 → T023, T024 (US3)
  T025 → T026 (US3 week nav)

Agent C (Skills view):
  T027 → T028, T029 (US4)

Agent D (Log view):
  T030 → T031, T032, T033, T034 (US5)
```

---

## Implementation Strategy

### MVP First (User Stories 1–3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Daily logging works
4. Complete Phase 4: US2 — Exercises and notes work
5. Complete Phase 5: US3 — Phase navigation works
6. **STOP and VALIDATE**: Full daily workflow functional (log days, read exercise, write notes, navigate phases)
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Test: tap days, verify persistence → MVP core
3. US2 → Test: exercise cycling, notes persistence → Learning engine complete
4. US3 → Test: phase management, week navigation → Full program navigation
5. US4 → Test: skill ratings → Self-assessment added
6. US5 → Test: heatmap, stats → Progress visualization added
7. US6 → Test: tab memory, deep links → Navigation polished
8. Polish → Final checklist → Ship

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after its phase checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- Exercise formula: `phase.exercises[(weekNumber - phase.weekRange[0]) % 8]`
- Phase-for-week lookup: find phase where `weekRange[0] <= week <= weekRange[1]`
