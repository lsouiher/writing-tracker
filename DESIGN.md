# Design System — IAlgeria

## Product Context
- **What this is:** French-first AI learning platform with free video courses and a paid Pro tier (labs, AI tutor, certificates)
- **Who it's for:** Francophone professionals, students, and developers in France, Quebec, and the Maghreb (Algeria, Morocco, Tunisia)
- **Space/industry:** EdTech / AI education (peers: DeepLearning.AI, OpenClassrooms, Coursera)
- **Project type:** Web application (Next.js, SSR, marketing + learning app)

## Aesthetic Direction
- **Direction:** Editorial/Magazine with Mediterranean warmth
- **Decoration level:** Intentional (subtle grain texture, geometric zellige-inspired accents)
- **Mood:** A modern French institution of learning with North African soul. Serious about craft, warm in tone. NOT American SaaS, NOT generic tech-blue. Think Le Monde meets a modern web app.
- **Reference sites:** DeepLearning.AI (structure reference, not aesthetic), OpenClassrooms (French peer), Coursera (scale reference)
- **Zellige accents:** Geometric patterns inspired by Islamic art used sparingly as border accents, section dividers, and background textures. CSS-only, not image-based.

## Typography
- **Display/Hero:** Instrument Serif — Elegant modern serif with French sensibility. Sets IAlgeria apart from every sans-serif edtech platform. Signals "institution" over "startup."
- **Body:** DM Sans — Clean geometric sans with excellent French character support (accents, cedillas). Not overused like Inter/Roboto.
- **UI/Labels:** DM Sans (same as body, medium weight for labels)
- **Data/Tables:** DM Sans with tabular-nums OpenType feature
- **Code:** JetBrains Mono — Industry standard for code, ligatures for readability
- **Loading:** Google Fonts `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=JetBrains+Mono:wght@400;500&display=swap`
- **Scale:**
  - xs: 12px (0.75rem) — meta, timestamps
  - sm: 14px (0.875rem) — labels, secondary text
  - base: 16px (1rem) — body text
  - lg: 18px (1.125rem) — lead paragraphs
  - xl: 22px (1.375rem) — card titles (Instrument Serif)
  - 2xl: 28px (1.75rem) — section headings (Instrument Serif)
  - 3xl: 40px (2.5rem) — page titles (Instrument Serif)
  - 4xl: 56px (3.5rem) — hero headings (Instrument Serif)

## Color
- **Approach:** Restrained + warm
- **Primary:** #1B6B4A — Deep Mediterranean green. Growth, knowledge, nature. Nods to Algeria without being literal.
- **Primary Light:** #2A8F64 — Hover states, lighter accents
- **Primary Dark:** #145237 — Active states, deep emphasis
- **Accent:** #D4652E — Terracotta. Warmth, North African earth. Used for CTAs, highlights, badges.
- **Accent Light:** #E8845A — Hover states for accent elements
- **Neutrals (warm grays):**
  - Background: #F7F5F2
  - Surface: #FFFFFF
  - Surface Alt: #EDEAE6
  - Border: #D8D4CF
  - Text Light: #9B9590
  - Text Muted: #6B6560
  - Text: #1A1A1A
- **Semantic:**
  - Success: #1B6B4A (same as primary — green IS success here)
  - Warning: #D4952E
  - Error: #C44234
  - Info: #2E6BD4
- **Dark mode strategy:** Invert surfaces (bg: #141210, surface: #1E1C19), reduce primary saturation slightly (#3AAF7A for light variant), warm dark grays instead of pure black. Neutrals shift to warm dark tones (#2A2723, #3A3530).

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable (learning app slightly more compact than marketing pages)
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px) 4xl(80px)
- **Section padding:** Marketing pages 64px vertical, app pages 32px vertical
- **Card padding:** 24px

## Layout
- **Approach:** Hybrid — grid-disciplined for learning app, creative-editorial for marketing pages
- **Grid:** 12 columns, 24px gap
  - Marketing: max-width 1200px, centered
  - App: sidebar 280px + fluid content area
  - Mobile: single column, 24px horizontal padding
- **Max content width:** 1200px (marketing), fluid (app with sidebar)
- **Border radius:**
  - sm: 4px (badges, inline elements)
  - md: 8px (buttons, inputs, small cards)
  - lg: 12px (cards, modals, panels)
  - full: 9999px (pills, avatars)

## Motion
- **Approach:** Intentional — subtle animations that aid comprehension without being playful
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **Usage:**
  - Card hover: translateY(-4px) + shadow, 200ms ease-out
  - Page transitions: fade 200ms
  - Progress bar fill: 300ms ease-in-out
  - Modal enter: fade + scale from 0.95, 250ms ease-out
  - No bouncy, no spring, no playful motion — this is a serious learning institution

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-01 | Initial design system created | /design-consultation based on competitive research of edtech space |
| 2026-04-01 | Serif display font (Instrument Serif) | Differentiates from every sans-serif edtech platform. Signals French institution. |
| 2026-04-01 | Green + terracotta palette | Cultural authenticity for Maghreb audience. Mediterranean warmth over tech-blue. |
| 2026-04-01 | Zellige geometric accents | Meaningful decoration for Maghreb audience. CSS-only implementation. |
| 2026-04-01 | Warm gray neutrals (#F7F5F2 base) | Avoids clinical white. Warmer feel aligned with Mediterranean aesthetic. |
