# 🚀 AlgoPulse — Daily Problem Tracking & Streak System

> A full-stack competitive programming tracker built with **FastAPI + React (Vite) + MongoDB**.
> This file is the **single source of truth** for the project. Any new IDE, developer, or AI agent starting
> work on this project must follow every rule and constraint listed here before writing a single line of code.

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Strict Development Rules](#2-strict-development-rules) ← **Read before any implementation**
3. [Tech Stack](#3-tech-stack)
4. [Phase Status — What Is Done & What Is Next](#4-phase-status)
5. [Database Schema](#5-database-schema)
6. [REST API Map](#6-rest-api-map)
7. [UI Design System](#7-ui-design-system) ← **Updated with professional design rules**
8. [Feature Specifications](#8-feature-specifications)
9. [File & Folder Structure](#9-file--folder-structure)

---

## 1. Project Overview

| Feature                     | Description                                                                          |
| :-------------------------- | :----------------------------------------------------------------------------------- |
| **Dual Workspaces**         | 🟢 **Solved Archive** + 🟠 **Tried & Unsolved Lab** with 1-click promotion           |
| **Streak Engine**           | User-configurable daily target $N$. Auto-evaluates at midnight in user timezone      |
| **LeetCode Sync**           | On-demand GraphQL sync with deduplication and timezone-correct date attribution      |
| **URL Validator**           | Strict regex proof-URL checker. Rejects generic problem links. Auto-detects platform |
| **Analytics**               | Current week/month summaries with exact date ranges, daily activity, and platform counts |
| **MongoDB 512MB Optimized** | All documents < 350 bytes. Links replace blobs                                       |
| **Agentic Workflow**        | Prompt-driven CRUD, clarification, confirmation, learning analysis, revision, and notifications |

---

## 2. Strict Development Rules

> ⚠️ These rules are **non-negotiable**. Every developer or AI agent working on this project must follow all of them.

### Rule 1 — One Phase at a Time

- **Never start Phase N+1 before Phase N is fully tested and verified** by the user in the browser.
- Each phase = backend code + frontend UI for that phase + user approval before moving on.

### Rule 2 — Phase Implementation Documentation

- Every phase must have a written section in `phase_implementation.md` that explains:
  - **WHAT** was built
  - **HOW** it was built (implementation approach)
  - **WHY** it was done that way (reasoning behind choices)
- This must be updated as each phase is completed.

### Rule 3 — Numbered Step Comments in Every Function

Every function — backend (Python) and frontend (JavaScript/JSX) — **must** have numbered step comments:

```python
# Example: Python backend
async def login(credentials, db):
    # 1) Validate input fields are not empty
    # 2) Fetch user from DB by email
    # 3) Verify bcrypt password hash
    # 4) Generate JWT token
    # 5) Return token and user object
```

```javascript
// Example: Frontend JSX
const handleCreateProblem = async (e) => {
  // Step A: Prevent default form submission
  // Step B: Validate URL is not a generic problem link
  // Step C: Submit to backend API
  // Step D: Reset form state and close modal
};
```

### Rule 4 — Simple Implementation First

- Choose the **simplest implementation** that works correctly.
- No premature optimization, no over-engineering, no complex abstractions unless truly needed.
- If two approaches achieve the same outcome, always pick the simpler one.

### Rule 5 — Terminal: Command Prompt Only

- ⚠️ **Never use PowerShell**. All commands must be run in `cmd.exe` (Command Prompt).
- All `.bat` scripts must be compatible with `cmd.exe` syntax.

### Rule 6 — MongoDB 512MB Free Tier

- Every document must stay **under 350 bytes**.
- Never store large text (code, editorials, descriptions) in the database. Store **links/URLs** instead.
- Fields: `sub_url`, `p_url`, `notes_url` — external links, never raw content.

### Rule 7 — Validation Must Be Integrated

- URL validation is **not a separate step** — it runs inside `handleCreateProblem` / `addSubmission`.
- Only one submit button exists. Validation runs automatically before the API call.
- The platform field must **auto-detect** from the URL. The user should never need to manually pick a platform if they provide a URL from a known platform.

### Rule 8 — State Management: Minimize Re-renders

- Prefer `useRef` over `useState` for values that do not affect rendering (timers, previous values).
- Use `useCallback` and `useMemo` where functions/values are passed as props to child components.
- Use a single `useContext` (or a shared parent state) instead of prop-drilling the same data through 3+ levels.
- Never create a new state variable if an existing one can serve the same purpose.

### Rule 9 — Design Must Be Premium (Not Just Functional)

- The frontend **must not look like a basic CRUD form**. It must feel like a professional dashboard.
- See **Section 7 (UI Design System)** for exact color tokens, typography, spacing, animation, and component rules.
- Every component must reference the design system — no ad-hoc inline colors that contradict the palette.

---

## 3. Tech Stack

| Layer           | Technology                                                       | Notes                                  |
| :-------------- | :--------------------------------------------------------------- | :------------------------------------- |
| **Backend**     | Python 3.11+, FastAPI, Motor (async), Pydantic v2                | Async everywhere                       |
| **Database**    | MongoDB Atlas (Free Tier 512MB)                                  | Indexed on `user_id`, `status`, `date` |
| **Auth**        | JWT Bearer tokens via `python-jose`, bcrypt via `passlib`        | Stored in `localStorage`               |
| **Frontend**    | React 18, Vite, Vanilla CSS (no Tailwind)                        | Recharts for analytics                 |
| **API Client**  | Centralized `client.js` with auto Bearer injection               | Handles 401 globally                   |
| **Dev Runtime** | `cmd.exe` scripts only — `start_phase1.bat`, `setup_backend.bat` | Never PowerShell                       |

---

## 4. Phase Status

### ✅ PHASE 1 — COMPLETE (Backend + Frontend)

> Status: **Tested and ready for user validation**

#### What was built:

**Backend (`backend/`):**

- `app/core/config.py` — `.env` reader for DB URL, JWT secret, defaults
- `app/core/security.py` — bcrypt password hashing + JWT encode/decode
- `app/core/database.py` — Async Motor pool with compound indexes
- `app/models/schemas.py` — Lean Pydantic models (< 350 bytes/doc)
- `app/services/validator.py` — Multi-platform strict URL regex validator with auto-detection
- `app/api/auth.py` — `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/isLoggedIn`
- `app/api/users.py` — `/users/profile` (GET, PUT), `/users/account` (DELETE)
- `app/api/problems.py` — `/problems` (POST, GET, GET/:id, PUT/:id, DELETE/:id)
- `app/api/validator.py` — `/validate/submission-url`
- `main.py` — FastAPI app with lifespan DB connect/disconnect

**Frontend (`frontend/src/`):**

- `api/client.js` — Centralized API client with auto Bearer injection + 401 global handler
- `components/AuthView.jsx` — Login + Register view
- `components/Header.jsx` — Logo, user badge, profile/logout buttons
- `components/ProblemCRUD.jsx` — Problem list with filters, single "Add Problem" button, live URL validator, auto platform detection (⚡ badge), edit/delete modals
- `components/ProfileModal.jsx` — LeetCode handle, daily target, timezone, account delete
- `components/ValidatorPlayground.jsx` — Standalone URL testing laboratory
- `styles/index.css` — Design system (CSS variables, glassmorphism, buttons, inputs)

#### Platform Validator Rules (currently enforced):

| Platform                        | Submission URL Required                     | Falls Under                                                |
| :------------------------------ | :------------------------------------------ | :--------------------------------------------------------- |
| LeetCode                        | `leetcode.com/problems/slug/submissions/ID` | Strict regex                                               |
| Codeforces                      | `codeforces.com/contest/ID/submission/ID`   | Strict regex                                               |
| CodeChef                        | `codechef.com/viewsolution/ID`              | Strict regex                                               |
| AtCoder                         | `atcoder.jp/contests/ID/submissions/ID`     | Strict regex                                               |
| GFG, HackerRank, and all others | Any valid `https://...` URL                 | `other` category — no shareable submission links available |

---

### 🔜 PHASE 2 — NEXT (LeetCode Sync + Streak Engine)

> Status: **Pending Phase 1 user validation**

**What to build:**

**Backend:**

- `app/services/leetcode_sync.py` — Async GraphQL fetcher using `recentSubmissionList(username, limit: 20)`
  - Auto-converts Unix timestamps to user timezone (e.g. `Asia/Kolkata`)
  - Anti-bleed: submission at `23:30 yesterday` is dated yesterday, not today
  - Deduplication via unique index `(user_id, platform, p_id)`
  - `Accepted` → `solved`, everything else → `tried`
- `app/services/streak_engine.py` — Daily streak calculator
  - Reads today's `solved_count` from `daily_streaks` collection
  - Increments `current_streak` if `solved_count >= daily_target`
  - Resets streak to 0 if missed day; updates `longest_streak` if new record
- `app/api/sync.py` — `POST /sync/leetcode`, `GET /sync/status`
- `app/api/streak.py` — `GET /streak/overview`, `GET /streak/heatmap`
- New collection: `daily_streaks` (`~120 bytes/doc`)

**Frontend:**

- `components/StreakHUD.jsx` — Streak pill: `🔥 7 Days | Today 2/3 ◻◻◼`
- `components/SyncButton.jsx` — LeetCode sync trigger with spinner + last-synced timestamp
- Progress bar in Header showing today's `solved / target`

---

### ⚪ PHASE 3 — Analytics Dashboard (Pending Phase 2)

**Purpose:** Add a natural-language command surface while keeping the existing CRUD and validator services as the source of truth. Commands such as `add <problem link>`, `analyse my current week`, and `analyse my current month` resolve into typed intents.

**Backend:**

- Add an `app/agents/` orchestration layer with typed intents: `add_problem`, `list_problems`, `update_problem`, `delete_problem`, and `analyse_period`.
- Add `POST /agent/command`, which returns a clarification question, a confirmation preview, or a typed result. The model never accesses MongoDB directly.
- Add `GET /analytics/summary?period=week|month` and `GET /analytics/platforms?period=week|month`. Resolve calendar boundaries using the user's timezone and return the exact `from`/`to` dates.
- For `add <link>`, extract what is safe, call the existing submission URL validator, ask for missing title/status/difficulty/tags, then submit a normal `ProblemCreate` payload.
- For conversational CRUD, return candidate records and require the user to choose and confirm before update/delete mutations.

**Frontend:**

- Add a command console and transcript with loading, clarification, confirmation, validation-error, and retry states.
- Add week/month analytics controls. Results must show solved totals, tried totals, exact date range, daily activity, and a platform breakdown, including a message such as “This week you solved X problems on LeetCode and Y across other platforms.”

**Guardrails:** Validate every intent and argument with Pydantic schemas; never invent URLs, dates, platform facts, or DB results; keep normal CRUD and fixed analytics endpoints available if the model is unavailable.

---

### ⚪ PHASE 4 — Learning Coach, Revision Agent & Notifications (Pending Phase 3)

**Purpose:** Use the user's tried problems, repeated failures, tags, stuck categories, attempts, and recency to identify weak topics and produce a revision sheet using a spaced-repetition cycle.

**Backend:**

- Add deterministic, user-scoped telemetry for status, tags, `stuck_category`, attempts, `first_attempt_at`, `solved_at`, and recency. Missing tags are insufficient evidence, not permission to guess.
- Extend the command agent for `analyse my current learning`; add `GET /agent/learning/summary`, `GET /agent/revision/due`, and `POST /agent/revision/{id}/review`.
- Give the LLM only aggregated evidence and candidate problem IDs. It explains and ranks candidates but cannot create facts or write directly to the database.
- Add compact `revision_items` records with `problem_id`, `next_review_at`, `review_count`, `last_review_at`, `review_result`, and `reason_codes`. Use intervals such as 1, 3, 7, 14, and 30 days, adjusted by review outcome.
- Add in-app notification records and notification preferences. Create a due notification once per revision item, rather than on every dashboard load.
- Prioritize recent tried problems, repeated failure categories, weak tags with enough evidence, and overdue reviews. Include solved problems only when their review is due or they anchor a weak topic.

**Frontend:**

- Add “Current learning” results with evidence counts, weak topics, confidence, and links to source problems.
- Add a revision sheet grouped into `due today`, `upcoming`, and `recently completed`, with recommendation reasons and a mark-reviewed action.
- Add an in-app notification center and preference controls.

**Acceptance checks:** Recommendations are reproducible from fixtures, include source problem IDs, rank repeated failures appropriately, state when evidence is insufficient, and never cross user boundaries.

---

### ⚪ PHASE 5 — Agent Evaluation, Reliability & Production Polish (Pending Phase 4)

- Create offline evals for intent detection, missing-field extraction, date-range resolution, platform summaries, CRUD confirmation, and revision ranking.
- Test prompt injection in URLs/notes, malformed model output, unsupported requests, timeouts, duplicate commands, and partial notification failures.
- Add Pydantic/Guardrails validation, rate limits, token and timeout budgets, redacted audit logs, and optional LangSmith tracing with sensitive data excluded.
- Verify MongoDB indexes and TTL retention for transient conversations/notifications, frontend production build, accessibility, mobile layouts, and end-to-end browser flows.

---

## 5. Database Schema

### `users` (~250 bytes/doc)

```json
{
  "_id": "ObjectId",
  "username": "coder123",
  "email": "coder@example.com",
  "password_hash": "$2b$12$...",
  "lc_handle": "johndoe_lc",
  "daily_target": 2,
  "timezone": "Asia/Kolkata",
  "current_streak": 5,
  "longest_streak": 24,
  "last_active_date": "2026-09-18",
  "today_solved": 3,
  "created_at": "2026-09-01T00:00:00Z"
}
```

### `problems` (~320 bytes/doc)

> Links replace blobs. Never store raw code, editorials, or long text.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "platform": "codeforces",
  "p_id": "codeforces-recent-actions",
  "title": "Recent Actions",
  "sub_url": "https://codeforces.com/contest/1800/submission/278912301",
  "p_url": "https://codeforces.com/contest/1800/problem/A",
  "difficulty": "Medium",
  "tags": ["Two Pointers", "Greedy"],
  "status": "solved",
  "attempts": 1,
  "solved_at": "2026-09-18T10:15:00Z",
  "first_attempt_at": "2026-09-18T10:00:00Z",
  "brief_note": "Greedy scan with two pointers (max 280 chars)",
  "notes_url": null,
  "stuck_category": null,
  "created_at": "2026-09-18T10:15:00Z",
  "updated_at": "2026-09-18T10:15:00Z"
}
```

### `daily_streaks` (~120 bytes/doc) — Added in Phase 2

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "date": "2026-09-18",
  "solved_count": 3,
  "target_met": true,
  "target_req": 2,
  "month": "2026-09"
}
```

### Phase 3-4 Agent Data Additions
These planned model changes remain lean and user-scoped.

#### `agent_conversations` (transient)
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "state": "awaiting_details|awaiting_confirmation|complete|expired",
  "intent": "add_problem|update_problem|delete_problem|analyse_period|analyse_learning",
  "slots": {"title": "...", "status": "tried"},
  "candidate_ids": ["ObjectId"],
  "expires_at": "2026-09-18T12:00:00Z"
}
```
Use a TTL index on `expires_at`; do not store full prompts or model transcripts by default.

#### `revision_items`
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "problem_id": "ObjectId",
  "priority": 82,
  "reason_codes": ["recent_tried", "repeated_logic_gap"],
  "next_review_at": "2026-09-21T09:00:00Z",
  "last_review_at": "2026-09-18T09:00:00Z",
  "review_count": 1,
  "review_result": "again|hard|good|easy"
}
```

#### `notifications`
Store only `user_id`, `revision_id`, `kind`, `scheduled_for`, `read_at`, and `created_at`. Add a unique key for `(user_id, revision_id, kind, scheduled_for)` to prevent duplicate due notifications.

#### Required existing-model adjustments
- Ensure `attempts` increments when a tried submission is logged or a problem is retried; the current create/upsert flow must not silently reset it.
- Preserve immutable `first_attempt_at`; update `solved_at` only on a transition to solved.
- Normalize tags and stuck categories so telemetry can group them consistently.
- Add indexes for `(user_id, status, updated_at)`, `(user_id, tags)`, `(user_id, next_review_at)`, and all transient/notification TTL fields.

---

## 6. REST API Map

```text
/api/v1
│
├── /auth
│   ├── POST   /auth/register          # Create account
│   ├── POST   /auth/login             # Get JWT token
│   ├── POST   /auth/logout            # Invalidate session
│   └── GET    /auth/isLoggedIn        # Verify token is still valid
│
├── /users
│   ├── GET    /users/profile          # Read profile + streak meta
│   ├── PUT    /users/profile          # Update lc_handle, daily_target, timezone
│   └── DELETE /users/account          # Delete account + all problems
│
├── /problems
│   ├── GET    /problems               # List (filter: status, platform, difficulty, search)
│   ├── POST   /problems               # Create with strict URL validation
│   ├── GET    /problems/{id}          # Single problem detail
│   ├── PUT    /problems/{id}          # Update title, status, note, difficulty
│   └── DELETE /problems/{id}          # Delete problem
│
├── /validate
│   └── POST   /validate/submission-url  # URL proof validator (returns is_valid + detected_platform)
│
├── /sync          ← Phase 2
│   ├── POST   /sync/leetcode
│   └── GET    /sync/status
│
├── /streak        ← Phase 2
│   ├── GET    /streak/overview
│   └── GET    /streak/heatmap
│
├── /analytics     ← Phase 3
│   ├── GET    /analytics/summary?period=week|month
│   ├── GET    /analytics/platforms?period=week|month
│   ├── GET    /analytics/monthly-volume
│   └── GET    /analytics/progress-timeline?month=YYYY-MM
│
└── /agent         ← Phases 3–4
  ├── POST   /agent/command
  ├── GET    /agent/learning/summary
  ├── GET    /agent/revision/due
  ├── POST   /agent/revision/{id}/review
  ├── GET    /agent/notifications
  └── PUT    /agent/notifications/preferences
```

---

## 7. UI Design System

> ⚠️ The current frontend UI is basic and must be significantly improved. Every new component and every redesign of existing components must follow these rules exactly.

### 7.1 — The Problem With the Current UI

The current design has these issues that must be fixed:

- Cards look like plain HTML boxes — no depth, no hierarchy
- Typography is too uniform — every text element looks the same weight/size
- The color palette is applied too timidly — neon accents should define the design, not be sprinkled
- Input fields and dropdowns look like browser defaults with a dark background
- The problem list grid has no visual interest — every card looks identical regardless of content
- Spacing is inconsistent and elements crowd each other

### 7.2 — Design Inspirations

Take inspiration from:

- **Linear.app** — ultra-clean dark UI, excellent spacing, clear type hierarchy
- **Vercel Dashboard** — dark panel system, subtle borders, excellent status indicators
- **Raycast** — sharp typography, perfect use of color as semantic signal
- **Codeforces profile** reimagined — data-dense but visually calm
- **GitHub contribution heatmap** — elegant data visualization

### 7.3 — Color Tokens (Use These Exactly)

```css
/* Background layers — distinct depth levels */
--bg-base: #070810; /* page background */
--bg-surface: #0d0f1a; /* card background */
--bg-elevated: #13162a; /* modal / elevated card */
--bg-overlay: #1a1d32; /* hover state, selected row */
--bg-input: #0a0c18; /* form inputs */

/* Borders */
--border-faint: rgba(255, 255, 255, 0.05);
--border-subtle: rgba(255, 255, 255, 0.09);
--border-strong: rgba(255, 255, 255, 0.16);
--border-cyan: rgba(0, 230, 255, 0.35);
--border-purple: rgba(139, 92, 246, 0.35);

/* Accent colors — use deliberately, not everywhere */
--cyan: #00e5ff; /* primary CTA, links, active state */
--purple: #8b5cf6; /* secondary accent, gradients */
--green: #22c55e; /* solved status, success */
--amber: #f59e0b; /* tried status, warning */
--red: #ef4444; /* error, delete, hard difficulty */

/* Text hierarchy */
--text-primary: #f1f3f9; /* headings, important values */
--text-secondary: #b0b8d1; /* body text, labels */
--text-muted: #6b7799; /* placeholder, metadata, timestamps */
--text-disabled: #3d4460; /* disabled states */
```

### 7.4 — Typography Rules

- **Import**: `Inter` (body) + `JetBrains Mono` (code, IDs, tags) from Google Fonts
- **Scale**:
  - Page title: `1.75rem`, `font-weight: 800`, `letter-spacing: -0.03em`
  - Section heading: `1.1rem`, `font-weight: 700`
  - Card title: `0.95rem`, `font-weight: 600`
  - Body: `0.875rem`, `font-weight: 400`, `line-height: 1.6`
  - Label/Meta: `0.75rem`, `font-weight: 500`, `letter-spacing: 0.02em`, color: `var(--text-muted)`
  - Monospace pill (tag, ID): `0.72rem`, font: `JetBrains Mono`
- **Never use** default browser font or `font-weight: 400` for headings

### 7.5 — Component Specification

#### Cards (Problem Cards)

```
- Background: var(--bg-surface)
- Border: 1px solid var(--border-faint)
- Border-radius: 10px
- Padding: 18px 20px
- Left accent bar: 3px solid (green for solved, amber for tried) — use border-left, not a separate div
- On hover: border-color → var(--border-subtle), background → var(--bg-overlay), translateY(-1px)
- Box-shadow on hover: 0 4px 24px rgba(0,0,0,0.4)
- Transition: all 0.18s ease
```

#### Buttons

```
Primary (CTA):
  - Background: linear-gradient(135deg, #00e5ff, #8b5cf6)
  - Color: #070810 (dark text on bright button)
  - Font-weight: 700
  - Border-radius: 8px
  - Padding: 9px 20px
  - Box-shadow: 0 0 16px rgba(0, 229, 255, 0.3)
  - Hover: brightness(1.1), translateY(-1px), shadow increases

Secondary:
  - Background: transparent
  - Border: 1px solid var(--border-subtle)
  - Color: var(--text-secondary)
  - Hover: background → var(--bg-overlay), border-color → var(--border-strong)

Danger (delete):
  - Background: rgba(239, 68, 68, 0.1)
  - Border: 1px solid rgba(239, 68, 68, 0.3)
  - Color: #f87171
  - Hover: background → rgba(239, 68, 68, 0.2)
```

#### Form Inputs

```
- Background: var(--bg-input)
- Border: 1px solid var(--border-subtle)
- Border-radius: 8px
- Padding: 10px 14px
- Font: inherit, 0.875rem
- Color: var(--text-primary)
- Placeholder color: var(--text-disabled)
- Focus: border-color → var(--cyan), box-shadow: 0 0 0 3px rgba(0,229,255,0.12)
- Transition: border-color 0.15s, box-shadow 0.15s
- Select arrows: styled, not browser default (use appearance: none + custom SVG arrow)
```

#### Status Badges

```
Solved:  background: rgba(34,197,94,0.12), color: #4ade80, border: 1px solid rgba(34,197,94,0.25)
Tried:   background: rgba(245,158,11,0.12), color: #fbbf24, border: 1px solid rgba(245,158,11,0.25)
Easy:    background: rgba(34,197,94,0.1),  color: #86efac, border: 1px solid rgba(34,197,94,0.2)
Medium:  background: rgba(251,191,36,0.1), color: #fcd34d, border: 1px solid rgba(251,191,36,0.2)
Hard:    background: rgba(239,68,68,0.1),  color: #fca5a5, border: 1px solid rgba(239,68,68,0.2)
All badges: padding: 2px 8px, border-radius: 5px, font-size: 0.72rem, font-weight: 600
```

#### Header

```
- Background: rgba(7, 8, 16, 0.85) with backdrop-filter: blur(20px)
- Border-bottom: 1px solid var(--border-faint)
- Position: sticky, top: 0, z-index: 100
- Height: 60px
- Contains: Logo (gradient text) | Spacer | User badge | Settings icon | Logout icon
- NO separate "Add" button in header. Add button lives in the content area.
```

#### Modals

```
- Overlay: rgba(0, 0, 0, 0.7) with backdrop-filter: blur(12px)
- Panel: var(--bg-elevated), border: 1px solid var(--border-subtle)
- Border-radius: 14px
- Max-width: 520px, width: 100%
- Padding: 28px
- Box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6)
- Close button: top-right, icon only, hover: color → var(--text-primary)
- Appear animation: fadeIn + translateY(8px → 0) over 0.2s
```

### 7.6 — Spacing System

Use a consistent 4px base unit:

- `4px` — tight (icon gap, badge padding)
- `8px` — compact (button icon gap, input icon offset)
- `12px` — small (between related elements)
- `16px` — medium (card padding top/bottom, section gap)
- `20px` — card padding horizontal
- `24px` — between cards in grid, modal padding
- `32px` — section gap
- `48px` — page section separation

### 7.7 — Layout Rules

- Max content width: `1320px`, centered with `margin: 0 auto`
- Problem grid: `grid-template-columns: repeat(auto-fill, minmax(360px, 1fr))`
- Sidebar (future): 260px fixed, content fills remaining space
- All modals: centered in overlay, max-height: 90vh with `overflow-y: auto`
- Responsive: below 768px → single column grid, simplified header

### 7.8 — Micro-animations (Required)

- Button hover: `translateY(-1px)` + shadow increase — `0.15s ease`
- Card hover: `translateY(-2px)` + border brightens — `0.18s ease`
- Modal open: `opacity 0→1` + `translateY(12px→0)` — `0.2s ease-out`
- Toast appear: `slideInRight` from 40px — `0.25s ease`
- Input focus: border + shadow change — `0.15s ease`
- Status badge pulse (optional): subtle glow keyframe animation on solved badges
- **No** heavy animations, no rotation, no scale > 1.02, no 3D transforms

### 7.9 — Things to NEVER Do

- Never use plain white (`#ffffff`) anywhere
- Never use `background: black` — always use dark tokens with blue undertone
- Never use `font-size: 16px` for labels (too big)
- Never put a green button next to a red button without visual separation
- Never let a card have no visual hierarchy (every card must have a title, at least one badge, and an action)
- Never use border-radius > 14px on panels or > 10px on cards
- Never use `box-shadow: none` — every elevated surface must cast at least a subtle shadow
- Never use inline styles for colors — always reference CSS variables

---

## 8. Feature Specifications

### Feature 1 — Problem Tracker (Dual Workspace)

- Filter bar: Status (All/Solved/Tried), Platform, Difficulty, Search text
- Grid layout: Solved cards have green left border, Tried cards have amber left border
- Card shows: Platform badge, Difficulty badge, Status badge, Title, brief note, tags, Verdict link, Edit/Delete actions
- Empty state: centered icon + descriptive message, not just blank space

### Feature 2 — Submission URL Validator

- One submit button only — "Add Problem" opens modal, validation runs on submit
- Debounced live validation as user types URL (300ms delay)
- Auto-detects platform from URL domain — shows ⚡ Auto-detected badge
- Platforms with no shareable submission links (GFG, HackerRank) → accept any valid HTTPS URL
- Platform dropdown glows cyan when auto-detected; manual change removes glow/badge

### Feature 3 — Streak Engine (Phase 2)

- Configurable `N` problems/day — default 2
- Daily count resets at midnight in user's timezone
- Streak HUD in header: `🔥 7 | 2/3 today`
- Progress bar: thin bar below header, fills cyan as today's count approaches target

### Feature 4 — LeetCode Sync (Phase 2)

- Button triggers `POST /sync/leetcode` — spinner while loading
- Shows last synced timestamp after completion
- Newly synced problems appear in the problem grid immediately
- Deduplication — same submission never added twice

### Feature 5 — Analytics (Phase 3)

- Monthly bar chart: Jan–Dec, click any bar to drilldown
- Line chart defaults to current month, updates on bar click
- Metrics: Daily solved count, cumulative solved, current streak, weekly pace
- Heatmap: GitHub-style contribution grid, color intensity = volume

---

## 9. File & Folder Structure

```text
d:\python projects\test\
├── plan.md                    ← This file (source of truth)
├── phase_implementation.md    ← What/How/Why for each phase
├── .gitignore
├── README.md
│
├── backend\
│   ├── .env                   ← Never commit. Contains MONGO_URL, JWT_SECRET
│   ├── .env.example           ← Safe template to commit
│   ├── main.py                ← FastAPI app entry point with lifespan
│   ├── requirements.txt
│   ├── setup_backend.bat      ← pip install -r requirements.txt (cmd.exe)
│   ├── start_backend.bat      ← uvicorn main:app --reload (cmd.exe)
│   └── app\
│       ├── core\
│       │   ├── config.py      ← Read .env settings
│       │   ├── database.py    ← Async Motor connection pool + indexes
│       │   └── security.py    ← bcrypt + JWT helpers
│       ├── models\
│       │   └── schemas.py     ← Pydantic models (lean, < 350 bytes)
│       ├── services\
│       │   ├── validator.py   ← Submission URL regex engine
│       │   └── (streak.py, leetcode_sync.py added in Phase 2)
│       └── api\
│           ├── deps.py        ← get_current_user dependency
│           ├── auth.py        ← /auth routes
│           ├── users.py       ← /users routes
│           ├── problems.py    ← /problems routes
│           └── validator.py   ← /validate routes
│
└── frontend\
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── setup_frontend.bat     ← npm install (cmd.exe)
    ├── start_frontend.bat     ← npm run dev (cmd.exe)
    └── src\
        ├── main.jsx           ← App entry
        ├── App.jsx            ← Root: auth state, routing, toast
        ├── api\
        │   └── client.js      ← Centralized API client with Bearer injection
        ├── styles\
        │   └── index.css      ← Full design system (CSS variables, components)
        └── components\
            ├── Header.jsx
            ├── AuthView.jsx
            ├── ProblemCRUD.jsx
            ├── ProfileModal.jsx
            ├── ValidatorPlayground.jsx
            └── (StreakHUD.jsx, SyncButton.jsx added in Phase 2)
```
