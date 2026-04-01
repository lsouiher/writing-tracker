# Product Requirements Document
## The Writer's Ledger — English Writing Progress Tracker

**Version:** 1.0  
**Last Updated:** March 2026

---

## 1. Overview

The Writer's Ledger is a personal web application for a multilingual writer learning to write in English. It helps the user follow a structured 52-week writing program, track daily writing habits, log weekly reflections, self-assess skill growth, and prepare for a weekly session with a writing mentor.

The app is used solo, by one person, on both mobile and desktop.

---

## 2. Goals

- Give the user a clear, motivating view of their writing journey at all times
- Make it frictionless to log daily writing activity
- Surface the right exercise and mentor prompt for each week automatically
- Let the user track how their skills improve over time
- Persist all progress across sessions so nothing is lost

---

## 3. The 52-Week Program Structure

The program is divided into 4 phases. The app holds all phase content and surfaces it based on where the user is.

### Phase 1 — Foundation (Weeks 1–8)
Focus: Build the writing habit and understand English prose rhythm.  
Weekly goal: Write 3 times per week, 15–30 minutes per session.

### Phase 2 — Craft (Weeks 9–20)
Focus: Develop voice, narrative flow, and genre awareness.  
Weekly goal: Write 4 times per week; one longer piece (500–800 words) per week.

### Phase 3 — Range (Weeks 21–36)
Focus: Write across target genres — stories, business blogs, biography.  
Weekly goal: One complete piece per week in a rotating genre.

### Phase 4 — Refinement (Weeks 37–52)
Focus: Polish work to publishable quality and begin a sustained real project.  
Weekly goal: Work on one sustained project; publish or share at least one piece publicly.

Each phase contains:
- A description and overall focus
- 4 skill tags (what the user is building)
- A weekly goal statement
- 8 writing exercises (rotated weekly)
- A weekly friend session prompt (what to bring to the mentor meeting)

---

## 4. Core Features

### 4.1 Phase Plan View

**What it is:** A full overview of all 4 phases.

**User flow:**
1. User opens the app and lands on the Plan tab by default on first visit.
2. All 4 phases are listed as cards showing: phase name, week range, one-line description, and skill tags.
3. The user's current phase is visually highlighted with a "current" label.
4. Tapping any phase card expands it to reveal:
   - The weekly goal
   - All 8 exercises for that phase, numbered
   - The weekly friend session prompt
5. Tapping the current phase card also marks it as active (changes the current phase).
6. Only one phase is expanded at a time.

**Key rules:**
- The app always remembers which phase the user is on.
- Changing phase is manual — the user decides when they move forward.

---

### 4.2 This Week View

**What it is:** The user's weekly workspace. This is the most-used view.

**User flow:**
1. User taps the "This Week" tab.
2. The view shows the current week number (e.g. "Week 3") and the phase it belongs to.
3. The user can navigate to any week using back/forward arrows.
4. **Day tracker:** Seven buttons, one per day of the week (Mon–Sun). The user taps each day they wrote. Tapped days turn highlighted. Tapping again un-marks the day.
5. Below the day tracker, a short message reflects progress: "great week" (4+ days), "keep going" (2–3 days), or "get writing" (0–1 days).
6. **Exercise of the week:** The app automatically shows one exercise from the current phase, cycling through the 8 exercises week by week.
7. **Notes field:** A free-text area where the user can write reflections — what they wrote, what their friend said, what felt hard or easy. Notes are saved per week.
8. **Friend session prompt:** Displayed below notes. Automatically pulled from the current phase. Reminds the user what to bring or discuss at the weekly mentor meeting.

**Key rules:**
- Day logs and notes are stored per week and never lost.
- Navigating away and back restores the exact state.
- The current week is remembered between sessions.

---

### 4.3 Skills Self-Assessment View

**What it is:** A place for the user to honestly rate their progress on 6 core writing skills, and revisit those ratings over time.

**The 6 skills tracked:**
1. Sentence variety
2. Paragraph structure
3. Voice & tone
4. Storytelling
5. Business writing
6. Editing / revision

**User flow:**
1. User opens the Skills tab.
2. Each skill is shown as a row with its name and a 5-pip rating bar (like stars, but rectangular).
3. The user taps a pip to set their rating. Tapping the same pip again clears it back to zero.
4. A text label reflects the rating: — / beginner / learning / developing / confident / strong.
5. Ratings are saved and persist across sessions.
6. Below the skill tracker, a reading list is shown — 5 recommended books with title, author, and a one-line reason to read it. These are static content, not interactive.

**Key rules:**
- The user should be encouraged (via copy) to revisit their ratings every 4–6 weeks, not constantly.
- There is no history graph in v1 — just the current self-rating.

---

### 4.4 Progress Log View

**What it is:** A bird's-eye view of the full 52-week journey.

**User flow:**
1. User opens the Log tab.
2. A 52-cell grid is shown (13 columns × 4 rows), one cell per week, numbered 1–52.
3. Cell shading reflects how many days the user wrote that week: no days = very dark/empty, 1–2 days = faint, 3–4 days = medium, 5–7 days = fully lit.
4. The current week is outlined/highlighted.
5. Tapping any cell navigates the user to that week in the "This Week" view.
6. Below the grid, 4 summary stats are shown: Weeks Active, Total Days Written, Current Phase, Current Week.
7. Below the stats, recent weekly notes are shown (last 5 weeks with notes), truncated to a preview with the week number.

**Key rules:**
- The grid gives the user a visual sense of momentum — a long streak of lit cells is motivating.
- Clicking a week in the grid is a navigation shortcut, not a separate editing surface.

---

## 5. Navigation

The app has 4 tabs, always visible at the top:

| Tab | Purpose |
|---|---|
| Plan | View all 4 phases; set current phase |
| This Week | Log writing days, read exercise, write notes |
| Skills | Self-rate 6 skills; see reading list |
| Log | 52-week heatmap; view stats and recent notes |

On first visit, the user lands on **Plan**.  
After any session, the app remembers the last active tab.

---

## 6. Data Persistence

All user data must be saved automatically with no manual save step. The following data is persisted:

| Data | Description |
|---|---|
| Current phase | Which of the 4 phases the user is in (0–3) |
| Current week | Which week number is active (1–52) |
| Weekly day logs | For each week, which days were marked as written |
| Weekly notes | Free text note per week |
| Skill ratings | Current self-rating for each of the 6 skills (0–5) |

Data must survive: page refresh, closing the browser, switching devices (if cloud-backed), or returning days later.

---

## 7. Content — Writing Exercises

Each phase has 8 exercises. The app shows one per week, cycling through in order.

**Phase 1 exercises:**
1. Expand one journal entry into a 300-word polished piece
2. Copy a paragraph from a favorite book by hand — study the rhythm
3. Rewrite the same scene in 3 different tones (formal, casual, poetic)
4. Write a moment from your day using only concrete sensory details
5. Read aloud everything you write — hear where it stumbles
6. Translate an idea from your mother tongue, then rewrite it to sound natural in English
7. Describe a person you know in exactly 100 words
8. Write a 200-word intro to an imagined business blog post

**Phase 2 exercises:**
1. Write a scene opening 5 different ways — pick the best
2. Take a blog post you admire and outline its structure
3. Write a 600-word personal story with a clear beginning, middle, and end
4. Rewrite a flat sentence 5 ways — each more vivid
5. Write a business blog intro that hooks in the first sentence
6. Study one author's style for a week — imitate their sentence length patterns
7. Write a biography paragraph about someone you know
8. Cut a 400-word piece down to 250 without losing meaning

**Phase 3 exercises:**
1. Write a 1,000-word short story with a single protagonist and one turning point
2. Draft a 3-part business blog series on a topic you know well
3. Write a biographical sketch of a family member (800 words)
4. Workshop an old piece — rewrite it from scratch after 2 weeks away
5. Write the same event from two different points of view
6. Create an outline for a longer project (biography chapter or blog series)
7. Peer-review a piece your friend wrote — articulate what works
8. Write with a strict time limit: 25 minutes, no stopping

**Phase 4 exercises:**
1. Start a real blog or Substack — publish monthly
2. Write and fully revise a short story (1,500–2,000 words)
3. Draft the opening chapter of your biography
4. Submit a piece to a community, forum, or publication
5. Build a style sheet — your personal rules for your own writing
6. Do a full line-edit of a piece written in Phase 1 — see how far you have come
7. Write a piece you would be proud to show a stranger
8. Plan your next year of writing

---

## 8. Content — Friend Session Prompts

One prompt per phase, shown every week while that phase is active.

- **Phase 1:** Share one piece per week. Ask: Does this sound natural? Where does the rhythm break?
- **Phase 2:** Bring two pieces. Ask: Which voice feels more like me? What is the strongest sentence?
- **Phase 3:** Share a full-length piece. Discuss: structure, pacing, strongest and weakest section.
- **Phase 4:** Discuss your project. Ask: Is this ready to share with the world? What is still missing?

---

## 9. Content — Reading List (Static)

Shown in the Skills tab. Not interactive.

| Title | Author | Why |
|---|---|---|
| On Writing | Stephen King | Voice, process, and story — essential |
| Bird by Bird | Anne Lamott | Permission to write badly first |
| The Elements of Style | Strunk & White | Classic English prose rules |
| Several Short Sentences About Writing | Verlyn Klinkenborg | The power of the short sentence |
| Writing to Learn | William Zinsser | Clarity and non-fiction craft |

---

## 10. Design Principles

- **Mobile-first.** The app is used primarily on a phone. All interactions must work with thumbs.
- **Low friction.** Logging a writing day should take one tap. No confirmation dialogs.
- **Calm and focused.** The visual design should feel like a notebook or journal — warm, quiet, not loud or gamified.
- **No clutter.** Only show what the user needs for the current moment. Phase exercises are hidden until that phase is expanded.
- **Automatic saving.** The user should never think about saving.

---

## 11. Out of Scope (v1)

- Multiple users or accounts
- Sharing progress publicly
- Writing editor or in-app drafting
- AI writing feedback
- Skill history graphs or progress charts over time
- Notifications or reminders
- Export of notes or progress
