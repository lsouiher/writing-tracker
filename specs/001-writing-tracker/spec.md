# Feature Specification: The Writer's Ledger — English Writing Progress Tracker

**Feature Branch**: `001-writing-tracker`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "A personal web application for a multilingual writer learning to write in English. Follows a structured 52-week writing program with daily habit tracking, weekly reflections, skill self-assessment, and mentor session preparation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Log Daily Writing Activity (Priority: P1)

The user opens the app on their phone after a writing session. They tap the "This Week" tab, see the current week displayed, and tap today's day button to mark that they wrote. The button highlights immediately. The app shows an encouraging message based on how many days they've written this week. They can close the app and return later — their log is preserved.

**Why this priority**: This is the core daily interaction. Without frictionless day logging, the entire habit-tracking purpose of the app fails. One-tap logging is what makes the app sticky.

**Independent Test**: Can be fully tested by opening the app, tapping a day button, closing the browser, reopening, and verifying the day is still marked. Delivers immediate value as a writing habit tracker.

**Acceptance Scenarios**:

1. **Given** the user is on the This Week view, **When** they tap a day button (Mon–Sun), **Then** the day is visually highlighted and the progress message updates immediately
2. **Given** a day is already marked, **When** the user taps it again, **Then** the day is un-marked and the progress message updates
3. **Given** the user has marked 4 days this week, **When** they view the progress message, **Then** it reads "great week"
4. **Given** the user closes the browser and reopens the app, **When** they navigate to the same week, **Then** all previously marked days are still highlighted

---

### User Story 2 - View Weekly Exercise and Write Reflections (Priority: P1)

The user opens the This Week view and sees which writing exercise they should focus on this week, automatically selected from the current phase's exercise list. Below the exercise, they write free-text notes about what they wrote, what felt hard, and feedback from their mentor. The friend session prompt reminds them what to bring to their next meeting. All notes persist across sessions.

**Why this priority**: The exercise rotation and reflection notes are the structured learning engine of the app. Without them, the app is just a checkbox tracker with no pedagogical value.

**Independent Test**: Can be tested by navigating to a week, verifying the correct exercise appears for that week/phase combination, entering notes, navigating away and back, and confirming notes are preserved.

**Acceptance Scenarios**:

1. **Given** the user is in Phase 1, Week 3, **When** they view the This Week tab, **Then** exercise 3 from Phase 1 is displayed ("Rewrite the same scene in 3 different tones")
2. **Given** the user is in Phase 2, Week 17 (9th week of Phase 2), **When** they view the exercise, **Then** exercise 1 from Phase 2 is shown (cycling back after 8 exercises)
3. **Given** the user types notes in the notes field, **When** they navigate to a different week and return, **Then** the original notes are preserved for that week
4. **Given** the user is in Phase 3, **When** they view the friend session prompt, **Then** it shows "Share a full-length piece. Discuss: structure, pacing, strongest and weakest section."

---

### User Story 3 - Navigate and Manage the 52-Week Program (Priority: P1)

The user opens the Plan tab on first visit and sees all 4 phases laid out as cards. Their current phase is highlighted. They tap a phase card to expand it and see exercises, weekly goals, and the mentor prompt. When they're ready to advance, they tap the next phase card to set it as current. The This Week view always reflects the active phase.

**Why this priority**: The phase plan gives the user orientation in their 52-week journey. Without it, exercises and prompts have no context, and the user cannot progress through the program.

**Independent Test**: Can be tested by opening the Plan tab, expanding each phase card to verify content, changing the current phase, and confirming the This Week view updates to reflect the new phase.

**Acceptance Scenarios**:

1. **Given** the user opens the app for the first time, **When** the app loads, **Then** the Plan tab is shown with all 4 phase cards visible
2. **Given** Phase 1 is the current phase, **When** the user views the Plan tab, **Then** Phase 1 has a "current" label and visual highlight
3. **Given** the user taps a phase card, **When** it expands, **Then** it shows the weekly goal, all 8 exercises, and the friend session prompt; all other phase cards collapse
4. **Given** the user taps the Phase 2 card (while Phase 1 is current), **When** they switch to the This Week tab, **Then** the exercises and prompt now reflect Phase 2

---

### User Story 4 - Track Skill Growth Over Time (Priority: P2)

The user opens the Skills tab to self-assess their writing abilities. They see 6 skills listed, each with a 5-pip rating bar. They tap a pip to set their current level, and see a text label (beginner, learning, developing, confident, strong) reflect their choice. A curated reading list of 5 books is shown below for inspiration. The app gently encourages revisiting ratings every 4–6 weeks.

**Why this priority**: Skill tracking adds depth to the app beyond habit logging, but the app delivers core value without it. It enhances motivation by making growth visible.

**Independent Test**: Can be tested by opening the Skills tab, setting ratings for all 6 skills, closing and reopening the app, and verifying ratings persist. Also verify the reading list displays correctly.

**Acceptance Scenarios**:

1. **Given** the user opens the Skills tab, **When** it loads, **Then** all 6 skills are displayed with their names and 5-pip rating bars
2. **Given** the user taps the 3rd pip on "Voice & tone", **When** the rating registers, **Then** the label shows "developing" and the first 3 pips are filled
3. **Given** the user taps the 3rd pip again (already selected), **When** the tap registers, **Then** the rating clears back to zero and the label shows "—"
4. **Given** the user has set ratings previously, **When** they return to the Skills tab after closing the browser, **Then** all ratings are preserved
5. **Given** the user views the reading list, **When** it loads, **Then** 5 books are shown with title, author, and a one-line description

---

### User Story 5 - View Progress Across the Full Journey (Priority: P2)

The user opens the Log tab and sees a 52-cell grid (13 columns × 4 rows) showing their entire writing year at a glance. Each cell's shading reflects how many days they wrote that week. The current week is outlined. Tapping any cell navigates to that week in the This Week view. Below the grid, they see summary stats (Weeks Active, Total Days Written, Current Phase, Current Week) and previews of their most recent weekly notes.

**Why this priority**: The progress log provides motivation through visualization but is not required for daily use. It becomes more valuable as weeks accumulate.

**Independent Test**: Can be tested by marking days in several weeks, navigating to the Log tab, verifying cells shade correctly, tapping a cell to navigate to that week, and confirming summary stats are accurate.

**Acceptance Scenarios**:

1. **Given** the user has written 5 days in Week 2 and 1 day in Week 3, **When** they view the Log tab, **Then** Week 2's cell is fully lit and Week 3's cell is faintly shaded
2. **Given** the user is currently in Week 5, **When** they view the grid, **Then** Week 5's cell has a distinct outline/highlight
3. **Given** the user taps Week 3's cell in the grid, **When** the tap registers, **Then** the app navigates to the This Week view showing Week 3
4. **Given** the user has written notes in Weeks 2, 3, and 5, **When** they view the recent notes section, **Then** those weeks' notes are shown as truncated previews with week numbers
5. **Given** the user has written on 15 total days across 4 weeks, **When** they view the stats, **Then** "Weeks Active: 4", "Total Days Written: 15" are shown accurately

---

### User Story 6 - Seamless Navigation and State Persistence (Priority: P2)

The user moves freely between the 4 tabs (Plan, This Week, Skills, Log) using a persistent tab bar. The app remembers which tab was last active, so reopening the app returns the user to where they left off. Week navigation via back/forward arrows in the This Week view allows browsing past and future weeks without losing any data.

**Why this priority**: Smooth navigation and state persistence are essential for trust and usability, but they support the core features rather than being a feature themselves.

**Independent Test**: Can be tested by switching between tabs, closing and reopening the app, and verifying the last active tab is restored. Navigate between weeks and confirm data integrity across all visited weeks.

**Acceptance Scenarios**:

1. **Given** the user is on the Skills tab, **When** they close and reopen the app, **Then** the Skills tab is shown
2. **Given** the user is viewing Week 5, **When** they tap the back arrow, **Then** Week 4 is shown with its saved day logs and notes
3. **Given** the user is on the This Week tab, **When** they tap the Log tab, then tap back to This Week, **Then** the same week is displayed with all data intact
4. **Given** all 4 tabs are visible in the tab bar, **When** the user is on any screen, **Then** the current tab is visually indicated

---

### Edge Cases

- What happens when the user navigates to Week 53 or Week 0? The app should prevent navigation beyond the 1–52 range.
- What happens when the user is in Phase 2 but navigates back to a Phase 1 week? The exercise shown should correspond to the week's phase, not the user's current phase.
- What happens when the SQLite database is inaccessible or corrupt? The app should display an error page indicating data cannot be loaded.
- What happens when the user has no days logged for any week? The heatmap grid should show all cells as empty/dark with no errors.
- What happens on a very narrow mobile screen (< 320px)? The 52-cell grid should remain readable, potentially scrollable.
- What happens when the user changes their current phase backward (e.g., from Phase 3 to Phase 1)? The app should allow this without losing any data from later phases.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display 4 navigation tabs (Plan, This Week, Skills, Log) visible at all times
- **FR-002**: System MUST persist all user data (day logs, notes, skill ratings, current phase, current week) automatically without a manual save action
- **FR-003**: System MUST display 4 phase cards in the Plan view showing phase name, week range, description, and skill tags
- **FR-004**: System MUST allow only one phase card to be expanded at a time
- **FR-005**: System MUST allow the user to set any phase as their current phase by tapping its card
- **FR-006**: System MUST display 7 day buttons (Mon–Sun) in the This Week view for logging writing days
- **FR-007**: System MUST toggle day buttons on/off with a single tap (no confirmation dialog)
- **FR-008**: System MUST display a progress message based on days written: "great week" (4+), "keep going" (2–3), or "get writing" (0–1)
- **FR-009**: System MUST automatically display the correct exercise for the current week by cycling through the 8 exercises in the active phase
- **FR-010**: System MUST provide a free-text notes field per week for reflections
- **FR-011**: System MUST display the friend session prompt for the current phase
- **FR-012**: System MUST allow week-by-week navigation with back/forward arrows
- **FR-013**: System MUST display 6 skills with 5-pip rating bars in the Skills view
- **FR-014**: System MUST show a text label for each skill rating: — / beginner / learning / developing / confident / strong
- **FR-015**: System MUST display a static reading list of 5 books with title, author, and description
- **FR-016**: System MUST display a 52-cell grid (13 × 4) in the Log view with shading based on days written per week
- **FR-017**: System MUST allow tapping a grid cell to navigate to that week in the This Week view
- **FR-018**: System MUST display 4 summary stats: Weeks Active, Total Days Written, Current Phase, Current Week
- **FR-019**: System MUST show previews of the last 5 weeks with notes in the Log view
- **FR-020**: System MUST remember the last active tab between sessions
- **FR-021**: System MUST default to the Plan tab on first visit
- **FR-022**: System MUST constrain week navigation to the 1–52 range
- **FR-023**: System MUST store all 32 writing exercises (8 per phase) and 4 friend session prompts as static content
- **FR-024**: System MUST work on both mobile and desktop browsers with a mobile-first design

### Key Entities

- **Phase**: One of 4 program stages (Foundation, Craft, Range, Refinement), each with a week range, focus description, skill tags, weekly goal, 8 exercises, and a friend session prompt
- **Week**: A numbered unit (1–52) belonging to a phase, containing day logs (7 boolean values), a notes field, and a derived exercise assignment
- **Skill Rating**: A user's self-assessment (0–5) for each of 6 writing skills, stored as current values only (no history in v1)
- **User State**: The user's current phase, current week, and last active tab — representing where they are in the program

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can log a writing day in under 2 seconds from opening the app (one tap after the page loads)
- **SC-002**: All user data survives page refresh, browser close, and returning days later with zero data loss
- **SC-003**: The app is fully usable on mobile screens 360px and wider with all interactive elements reachable by thumb
- **SC-004**: Users can navigate from any tab to any other tab in a single tap
- **SC-005**: The 52-week heatmap grid accurately reflects writing activity, updating in real-time as days are logged
- **SC-006**: Users can complete a full weekly workflow (log days, read exercise, write notes, review mentor prompt) in under 5 minutes
- **SC-007**: The correct exercise is displayed for every week/phase combination across all 52 weeks without manual configuration
- **SC-008**: The app loads and becomes interactive within 3 seconds on a standard mobile connection

## Assumptions

- The app is used by a single user — no authentication, accounts, or multi-user support is needed
- Data will be persisted server-side using SQLite via `better-sqlite3` (single file on persistent disk); cloud sync may be added later but is not required for v1
- The user has a modern browser (Chrome, Safari, Firefox, Edge — latest 2 versions) with JavaScript enabled
- The 52-week program content (exercises, prompts, reading list) is static and baked into the app — no CMS or admin interface
- The user manually advances their phase — there is no automatic phase transition based on week number
- All text content is in English only
- The "week" aligns with calendar weeks (Monday–Sunday), but the app does not enforce real-world calendar dates — Week 1 is whenever the user starts
