# IAlgeria Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-01

## Active Technologies

- TypeScript 5.x, Node.js 20 LTS + Supabase (auth + Postgres + storage + realtime + RLS), Stripe (@stripe/stripe-js + stripe), Bunny.net Stream (video CDN), Claude API (@anthropic-ai/sdk), Resend + React Email, PostHog, Upstash Redis (@upstash/redis), Monaco Editor (@monaco-editor/react), Judge0 API (001-francophone-ai-platform)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x, Node.js 20 LTS: Follow standard conventions

## Recent Changes

- 001-francophone-ai-platform: Added TypeScript 5.x, Node.js 20 LTS + Supabase (auth + Postgres + storage + realtime + RLS), Stripe (@stripe/stripe-js + stripe), Bunny.net Stream (video CDN), Claude API (@anthropic-ai/sdk), Resend + React Email, PostHog, Upstash Redis (@upstash/redis), Monaco Editor (@monaco-editor/react), Judge0 API

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
