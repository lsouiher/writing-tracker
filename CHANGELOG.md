# Changelog

All notable changes to The Writer's Ledger will be documented in this file.

## [0.1.0.0] - 2026-04-02

### Added
- **Plan tab**: 4 phase cards (Foundation, Craft, Range, Refinement) with expand/collapse accordion and dedicated "Set as current phase" button
- **This Week tab**: 7-day tracker with toggle buttons, progress messages ("get writing" / "keep going" / "great week"), exercise display cycling through 8 exercises per phase, auto-saving notes field with debounce + blur
- **Skills tab**: 6 writing skills (Sentence variety, Paragraph structure, Voice & tone, Storytelling, Business writing, Editing/revision) with 5-pip ratings and label display, plus 5-book reading list
- **Log tab**: 52-week heatmap grid with intensity shading, clickable cells for week navigation, summary stats (weeks active, total days, current phase/week), and recent notes display
- **Week navigation**: prev/next arrows constrained to weeks 1-52, URL-based deep linking via `?week=N`
- **Tab persistence**: last active tab remembered across sessions via SQLite
- **Phase-aware exercises**: each week shows the correct exercise and friend prompt based on week range, not user's selected phase
- SQLite database with WAL mode, auto-creating `data/` directory, parameterized queries throughout
- 35 unit tests covering all mutations and program content logic
- Mobile-first responsive design (360px+) with 44px touch targets
