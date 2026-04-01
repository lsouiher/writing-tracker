<!--
  Sync Impact Report
  ===================
  Version change: [CONSTITUTION_VERSION] → 1.0.0 (initial adoption)

  Modified principles: N/A (first population from template)

  Added sections:
    - Principle I: Simplicity is the First Feature
    - Principle II: Dependencies
    - Principle III: Code Structure
    - Principle IV: Data and Persistence
    - Principle V: APIs and Server-Side Logic
    - Principle VI: Authentication and Authorization
    - Principle VII: Frontend
    - Principle VIII: Testing
    - Principle IX: Performance
    - Principle X: Security
    - Governance (XI)

  Removed sections: None

  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed
      (Constitution Check section is generic — gates are filled at plan time)
    - .specify/templates/spec-template.md ✅ no changes needed
      (Requirements and user-story structure is principle-agnostic)
    - .specify/templates/tasks-template.md ✅ no changes needed
      (Task phases and organization are principle-agnostic)

  Follow-up TODOs: None
-->

# Writing Tracker Constitution

> This document is the law. It supersedes all other conventions.
> Deviations require a comment explaining why.

## Core Principles

### I. Simplicity is the First Feature

Every decision defaults to the simplest option that works.

- Prefer one file over two files. Prefer one table over two tables.
  Prefer one call over two.
- If a feature can ship without a new abstraction, ship it without one.
- Complexity MUST be justified in a comment. If you cannot explain why
  it is complex, make it simple.
- No speculative architecture. Build for today's requirements, not
  imagined future ones.
- If a platform built-in covers the use case, use it. Do not wrap it
  in a custom layer.
- When two approaches are equally valid, always choose the one that is
  easier to delete.

### II. Dependencies

- Every new dependency is a long-term maintenance cost. Justify it
  before adding it.
- Prefer fewer, well-maintained dependencies over many narrow ones.
- Never add a library to solve a problem that can be solved with
  20 lines of code.
- Wrapping a dependency in an abstraction layer is only justified if
  the wrapper is simpler to use than the underlying tool AND switching
  cost is a real risk.
- Dead dependencies MUST be removed immediately, not left to
  accumulate.

### III. Code Structure

**One concern per file.** A file that fetches data MUST NOT also render
UI. A file that handles routing MUST NOT contain business logic.

**Separate layers clearly:**
- Presentation: what the user sees. No direct data access.
- Business logic: rules, calculations, decisions. No framework-specific
  code.
- Data access: queries, external API calls. No business logic.

**No barrel re-export files.** Import directly from the source file.

**Co-locate tests.** A test file lives next to the file it tests, not
in a separate tree.

**Name things for what they do, not what they are.**
`getActiveSubscription()` over `subscriptionHelper()`.
`formatCurrency()` over `utils`.

### IV. Data and Persistence

**Soft deletes for user-owned data.** Mark records as deleted with a
timestamp rather than hard-deleting them. Hard deletes are permanent
and unrecoverable.

**Never expose internal identifiers in public-facing URLs or APIs.**
Use opaque, non-sequential identifiers.

**Migrations are append-only.** Never modify a migration that has
already been applied. Always create a new migration for changes.

**No optional fields without a documented reason.** Default to
required. If a field is nullable, explain why in a comment.

**Indexes are not optional.** Every foreign key is indexed. Every
column used in a filter on a large table is indexed.

**No N+1 queries.** If a view needs parent + children, fetch them
together. Review slow queries before each release.

### V. APIs and Server-Side Logic

**All writes happen server-side.** Client code never mutates data
directly.

**Third-party webhooks are the source of truth for external state.**
Never trust a synchronous API response alone for state that a webhook
will also confirm. Always reconcile via the webhook and persist to your
own database.

**All secrets are server-side only.** API keys, tokens, and credentials
never reach the client under any circumstances.

**Rate limiting is mandatory on all public endpoints.** Log usage.
Enforce limits. Abuse detection is not optional.

**Error responses are consistent across the entire application.** Pick
one shape for errors and one shape for success. Never deviate.

### VI. Authentication and Authorization

**Authorization is centralized.** Access control logic lives in one
place — middleware, a guard, or a policy layer — not scattered across
individual components or handlers.

**Principle of least privilege.** Every user, role, and service has only
the permissions it needs and nothing more.

**Access levels are explicit and documented.** Define the full set of
access tiers at the start of the project. Adding a new tier requires
updating the project spec.

**Never trust client-supplied identity claims.** Always verify
server-side.

### VII. Frontend

**Render on the server by default.** Only move rendering to the client
when there is a specific, documented reason — interactivity, browser
APIs, real-time state.

**No loading states for fast operations.** Show a spinner only for
operations that will visibly take time. Optimistic UI is preferred over
spinners where the outcome is predictable.

**No inline styles.** Use the project's styling system. Exceptions
require a comment.

**Form validation runs on both client and server.** Client validation
is for UX. Server validation is for correctness. Never rely on client
validation alone.

**Accessibility is not optional.** Semantic HTML, keyboard navigation,
and sufficient color contrast are baseline requirements, not
enhancements.

### VIII. Testing

**Test business logic, not implementation details.** Tests assert
outcomes and behavior, not internal state or method calls.

**Tests MUST be fast.** No test takes more than 2 seconds. Mock all
external services and APIs.

**Three test types, used proportionally:**
- Unit: pure functions and business logic
- Integration: the boundary between layers (API handlers, data access)
- End-to-end: critical user paths only — the shortest path from intent
  to outcome

**Tests run before every commit.** CI blocks merges on failing tests.
A broken test is never merged and fixed later.

**A test that is hard to write is a signal the code is too coupled.**
Refactor the code, not the test.

### IX. Performance

**Performance is a feature, not a phase.** Do not defer performance
work to "after launch."

**Measure before optimizing.** Never guess at a bottleneck. Profile
first.

**Set explicit targets before writing code** — response time, page
load, query time — and verify them before shipping.

**Media assets are served from a CDN.** Never serve large binary assets
through the application server.

### X. Security

**Secrets never touch version control.** Use environment variables.
Rotate any secret that is accidentally committed.

**All user-supplied content is treated as untrusted.** Sanitize before
storing. Escape before rendering. Never render user content as raw
markup.

**Privacy and compliance requirements are built in from day one.** Data
retention, deletion, and export are not features to add later — design
the data model to support them from the start.

**Dependencies are audited regularly.** Check for known vulnerabilities
before each release.

## Governance

- **This constitution supersedes all other conventions.** If a
  framework's docs, a tutorial, or a library's recommended pattern
  conflicts with this document, this document wins.
- **Amendments require a written reason.** No silent updates. If a rule
  changes, document why.
- **Complexity MUST be justified.** Any PR that introduces a new
  abstraction, a new dependency, or a new pattern requires a
  one-paragraph explanation.
- **When in doubt, do less.** Ship the simpler version. Extend based on
  real usage, not assumptions.
- **Versioning policy:** MAJOR for principle removals or redefinitions,
  MINOR for new principles or material expansions, PATCH for
  clarifications and wording fixes.
- **Compliance review:** Every plan and PR MUST be checked against these
  principles before approval.

**Version**: 1.0.0 | **Ratified**: 2026-04-01 | **Last Amended**: 2026-04-01
