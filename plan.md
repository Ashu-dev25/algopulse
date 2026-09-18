# 🚀 AlgoPulse: Daily Problem Tracking & Streak Management System

A high-performance, automated competitive programming and problem-solving tracker built with **FastAPI**, **React (Vite)**, and **MongoDB (Ultra-Lean Free-Tier Optimized)**.

Designed for lightning-fast logging, automated LeetCode ingestion, strict multi-platform submission verification, customizable streak goals ($N$ problems/day), interactive monthly drilldown analytics, and built-in **AI Agent telemetry hooks** for future autonomous productivity agents.

---

## 📌 1. Project Overview & Core Value Proposition

| Feature | Description |
| :--- | :--- |
| **Dual Workspaces** | 🟢 **Solved Archive** (Accepted solutions) & 🟠 **Tried & Unsolved Lab** (Stuck/Failed attempts, blocker tags, 1-click promotion). |
| **Customizable Streak Engine** | Tracks active & longest streaks based on user-defined target $N$ ($N \ge 1$). Auto-evaluates daily status at 23:59:59 in user's timezone. |
| **Automated LeetCode Ingestion** | Background and on-demand sync via LeetCode's public GraphQL API. Auto-sorts verdicts into Solved vs Tried with deduplication. |
| **Strict Submission Link Validator** | Enforces submission/verdict proof URLs (Codeforces, CodeChef, GFG, AtCoder, HackerRank, etc.) and strictly rejects generic problem links. |
| **Interactive Analytics & Drilldown** | 📊 Monthly Bar Graph + 📈 Interactive Month Drilldown Line Graph (Current Streak, Longest Streak, Cumulative Solved, Weekly Pace). Clicking any month dynamically updates the detailed daily timeline. |
| **512MB MongoDB Free-Tier Optimization** | Ultra-lean schema design (~300 bytes/document). Offloads heavy blobs by using URLs/links, ensuring 1,000,000+ problems can fit comfortably. |
| **Agentic AI Architecture Readiness** | Structured behavioral telemetry (`stuck_category`, `attempt_intervals`, `topic_decay`) and `/agent/` API hooks ready for future autonomous AI coaching agents. |
| **Futuristic & Lightweight UI** | Sleek cyberpunk/dark-obsidian aesthetic with neon accents, glassmorphic cards, and crisp micro-interactions without heavy graphic lag. |

---

## 🛠️ 2. Constraints & Engineering Principles

1. **Command Execution**:
   - ⚠️ **NO PowerShell**: All development and runtime commands must be executed using **Command Prompt (`cmd.exe`)**.
2. **MongoDB Free Tier Optimization (512MB Limit)**:
<<<<<<< HEAD
   - Zero redundant storage: problem descriptions, large editorials, and heavy source code are referenced via external URLs / links (`sub_url`, `notes_url`, `p_url`) rather than storing multi-kilobyte text blobs in the DB.
   - Target document size: **< 350 bytes**, allowing hundreds of thousands of entries on the 512MB free tier.
3. **Full-Stack Phase-by-Phase Validation**:
   - Every phase develops both Backend APIs and Frontend UI together so that you can directly test and verify in the browser before moving to the next phase.
4. **Step-by-Step Numbered Comments**:
   - Every function across backend and frontend contains explicit `# 1)`, `# 2)` step comments.
5. **Futuristic, Lightweight Aesthetic**:
   - Dark obsidian background (`#08090e`), glassmorphic panels, glowing neon cyan/purple accents, and smooth 60fps micro-interactions with zero graphic bloat.

---

## 🗺️ 3. Full-Stack Phase Roadmap

```text
Phase 1: Backend Foundation, Auth, User & Problem CRUD + Phase 1 Client UI [CURRENT]
├── 1.1 Create FastAPI app structure with CMD-compatible scripts (setup_phase1.bat, start_phase1.bat).
├── 1.2 Setup Async Motor connection with compound indexes on user_id, date, status, sub_id.
├── 1.3 Implement lean Pydantic models (<350 bytes footprint).
├── 1.4 Build strict Multi-Platform Submission URL Regex Validator (Codeforces, CodeChef, GFG, AtCoder, HackerRank, LeetCode).
├── 1.5 Implement the DB connection pool with async lifespan management.
├── 1.6 Implement User CRUD (/users/profile, /users/account) & Problem CRUD (/problems).
├── 1.7 Implement User Authentication (/auth/register, /auth/login, /auth/logout, /auth/isLoggedIn).
├── 1.8 Implement proper error handling for all operations using try-except blocks.
└── 1.9 Build Phase 1 Frontend Client (React + Vite):
    ├── AuthView.jsx (Signup & Signin)
    ├── ProblemCRUD.jsx (Interactive Problem list, filters, edit, delete, and live URL validator)
    ├── ProfileModal.jsx (User profile & account settings)
    └── ValidatorPlayground.jsx (Testing lab for submission links)

Phase 2: LeetCode Engine, Streak Calculator & Sync UI [NEXT]
├── 2.1 Implement async LeetCode GraphQL fetcher for user submissions.
├── 2.2 Build auto-classification & deduplication pipeline with timezone timestamp mapping.
├── 2.3 Implement Streak Calculation Engine (target N validation, daily rollups).
└── 2.4 Build Phase 2 Frontend components (LeetCode instant sync button, Streak HUD badge, live progress bar).

Phase 3: Interactive Analytics & Progress Drilldowns + Analytics UI
├── 3.1 Implement /analytics/monthly-volume (Monthly Solved Bar Chart data).
├── 3.2 Implement /analytics/progress-timeline?month=YYYY-MM (Daily Progress Line Chart drilldown).
└── 3.3 Build Phase 3 Frontend (Recharts Monthly Bar Chart with click-to-drilldown, Multi-Metric Line Graph, Heatmap).

Phase 4: Agentic AI Telemetry Layer & Assistant Hooks
├── 4.1 Implement /agent/telemetry/patterns (failure clusters, topic decay, velocity).
└── 4.2 Build Phase 4 Frontend AI recommendations & revision queues.

Phase 5: End-to-End Integration, Testing & Final Polish
=======
   - Zero redundant storage: problem descriptions, large editorials, and heavy source code are referenced via external URLs / links (`submission_url`, `notes_url`) rather than storing multi-kilobyte text blobs in the DB.
   - Target document size: **< 350 bytes**, allowing hundreds of thousands of entries on the 512MB free tier.
3. **Agentic System Readiness**:
   - DB schemas include structured learning telemetry (`stuck_reason_code`, `attempts_count`, `solve_duration_min`, `tags`).
   - Dedicated API surface (`/api/v1/agent/patterns`) to feed future autonomous agents for pattern learning, weak-topic detection, and adaptive revision queues.
4. **Futuristic, Lightweight Aesthetic**:
   - Dark mode (`#08090d`), glowing neon borders (`#00f5ff`, `#7928ca`), glassmorphic panels, and high-FPS CSS/SVG micro-animations with zero graphic bloat.

---

## 🏗️ 3. System Architecture

```mermaid
flowchart TD
    subgraph Frontend["Frontend (React + Vite + Recharts)"]
        UI[Futuristic Glassmorphic Dark UI]
        BarChart[Monthly Solve Volume Bar Chart]
        LineChart[Interactive Progress Line Chart]
        Heatmap[Daily Activity Heatmap Grid]
        SolvedTab[Solved Archive & Filter Grid]
        TriedTab[Tried & Unsolved Lab]
        AddModal[Submission Proof Validator Modal]
        SyncBtn[LeetCode Instant Sync]
    end

    subgraph Backend["Backend (FastAPI + Async Motor)"]
        Router[REST API Endpoints]
        StreakEngine[Daily Target & Streak Evaluator]
        LCSync[LeetCode GraphQL Sync Worker]
        ProofValidator[Submission URL Regex & Inspector]
        AgentHooks[Agentic Telemetry & Pattern API]
    end

    subgraph DB["MongoDB Free-Tier (Ultra-Lean Schema)"]
        UsersCol[(users ~250B/doc)]
        ProblemsCol[(problems ~320B/doc)]
        StreaksCol[(daily_streaks ~120B/doc)]
    end

    subgraph External["External Platforms"]
        LC[LeetCode GraphQL API]
        CF[Codeforces API / Submissions]
        Other[CodeChef / GFG / AtCoder]
    end

    UI --> Router
    BarChart -- "Click Month Filter" --> LineChart
    LineChart --> Router
    Heatmap --> Router
    SolvedTab --> Router
    TriedTab --> Router
    AddModal --> Router
    SyncBtn --> Router

    Router --> StreakEngine
    Router --> ProofValidator
    Router --> LCSync
    Router --> AgentHooks

    LCSync <--> LC
    ProofValidator <--> CF
    ProofValidator <--> Other

    StreakEngine --> StreaksCol
    StreakEngine --> UsersCol
    Router --> ProblemsCol
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
```

---

## 🗄️ 4. Ultra-Lean Database Schema (MongoDB Free-Tier Optimized)

<<<<<<< HEAD
=======
To guarantee the entire application operates seamlessly within MongoDB's **512MB free tier** for years without bloat, each model is designed with high data density.

>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
### 4.1. `users` Collection (`~250 bytes / doc`)
```json
{
  "_id": "ObjectId",
  "username": "coder123",
<<<<<<< HEAD
  "email": "coder@example.com",
  "password_hash": "$2b$12$...",
=======
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
  "lc_handle": "johndoe_lc",
  "daily_target": 2,
  "timezone": "Asia/Kolkata",
  "current_streak": 5,
  "longest_streak": 24,
<<<<<<< HEAD
  "last_active_date": "2026-09-18",
=======
  "last_active_date": "2026-09-09",
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
  "today_solved": 3,
  "created_at": "2026-09-01T00:00:00Z"
}
```

### 4.2. `problems` Collection (`~320 bytes / doc`)
<<<<<<< HEAD
=======
> **Optimization Strategy**: We store essential searchable metadata and link pointers (`submission_url`, `notes_url`) instead of huge raw text/code snippets.
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
<<<<<<< HEAD
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
  "brief_note": "Greedy scan with two pointers",
  "notes_url": null,
  "stuck_category": null,
  "created_at": "2026-09-18T10:15:00Z",
  "updated_at": "2026-09-18T10:15:00Z"
=======
  "platform": "leetcode", 
  "p_id": "lc-15",
  "title": "3Sum",
  "p_url": "https://leetcode.com/problems/3sum/",
  "sub_url": "https://leetcode.com/submissions/detail/123456789/",
  "difficulty": "Medium",
  "tags": ["Array", "Two Pointers"],
  "status": "solved",
  "attempts": 2,
  "solved_at": "2026-09-09T10:15:00Z",
  "first_attempt_at": "2026-09-08T14:20:00Z",
  
  "brief_note": "Two pointers with sorted array; skip dups.",
  "notes_url": "https://gist.github.com/... or notion link (optional)",
  
  "stuck_category": "tle",
  "review_due": "2026-09-16"
}
```

### 4.3. `daily_streaks` Collection (`~120 bytes / doc`)
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "date": "2026-09-09",
  "solved_count": 3,
  "target_met": true,
  "target_req": 2,
  "month": "2026-09"
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b
}
```

---

## 🎯 5. Core Feature Specifications

### 📂 Feature 1: Dual Workspaces ("Solved Archive" vs "Tried Lab")
- **🟢 Solved Archive**:
  - Filterable by Platform, Difficulty (🟢 Easy, 🟡 Medium, 🔴 Hard), Tags, and Date Range.
  - Card / Compact Table view with quick link to submission proof and external problem link.
  - Quick note drawer for high-level insight (time/space complexity + approach summary).
- **🟠 Tried & Unsolved Lab**:
  - Highlights problems attempted but unresolved.
  - Blocker category selector: `Time Limit Exceeded (TLE)`, `Wrong Answer (WA)`, `Memory Limit`, `Logic Gap`, `Need Algorithm Insight`.
  - **1-Click "Promote to Solved"**: Instantly promotes problem to "Solved", updates attempt count, and logs it to today's streak count.

---

### 🔥 Feature 2: Smart Daily Streak & Habit Engine
- **Target-Driven ($N$ Problems / Day)**:
  - User-configurable daily goal (e.g., $N = 2$).
  - Live progress bar: `2 / 2 problems solved today (100% 🔥 Streak Saved!)`.
  - Automatic streak increment if $\text{solved} \ge N$; resets to 0 if under target at midnight.
- **Activity Heatmap Grid**:
  - GitHub/LeetCode style contribution map with color intensity matching volume solved.

---

### 📊 Feature 3: Interactive Monthly & Daily Analytics (User Drilldown Specification)
- **1. Monthly Solved Bar Graph**:
  - Interactive bar chart displaying total problems solved per month (e.g., Jan, Feb, Mar, ..., Dec).
  - Hover tooltip displays monthly volume, completion rate, and active days.
- **2. Interactive Click-to-Drilldown Mechanism**:
  - **Clicking any month bar**: Filters the line graph and problem timeline specifically for that selected month!
  - **Deselecting / Default**: If no month is selected, the line graph automatically displays the **Current Month** daily breakdown.
- **3. Multi-Metric Progress Line Graph**:
  - Displays daily trajectory for:
    - ⚡ Current Streak progression
    - 🏆 Longest Streak milestone
    - 📈 Cumulative Problems Solved
    - ⏱️ Weekly Pace / Velocity

---

### ⚡ Feature 4: Automated LeetCode Ingestion
- **Zero-Friction Public Sync**:
  - Queries LeetCode's public GraphQL API for user's recent submissions:
    - `recentSubmissionList(username, limit: 20)`
    - Each item returns: `id` (unique submission ID), `title`, `titleSlug`, `statusDisplay` (`Accepted`, `Wrong Answer`, etc.), and `timestamp` (exact Unix epoch seconds).
- **Date Attribution & Anti-Bleed Logic**:
  - **Exact Timestamp Conversion**: Each submission's Unix timestamp is converted to the user's local timezone (e.g., `Asia/Kolkata`) to determine its exact calendar date (`YYYY-MM-DD`).
  - **No False Today Attribution**: If the 20th submission was solved yesterday at 23:30, it is attributed to yesterday's date (`2026-09-08`), NOT today's date (`2026-09-09`). It will never bleed into today's streak count.
- **Idempotency & Deduplication**:
  - Unique index on `(user_id, platform, p_id)` or `sub_id`.
  - Already-recorded submissions from past syncs are skipped instantly, preventing duplicate records or duplicate streak increments.
  - `Accepted` $\rightarrow$ Added to `Solved Archive` & attributed to its specific solve date.
  - `Wrong Answer` / `TLE` $\rightarrow$ Added to `Tried Lab` (if not already solved).

---

### 🛡️ Feature 5: Multi-Platform Ingestion & Strict Submission Link Validator
- Prevents users from accidentally adding generic problem links.
- **Strict Verification Rules**:
  | Platform | Valid Submission URL Pattern | Rejected Invalid Pattern |
  | :--- | :--- | :--- |
  | **Codeforces** | `codeforces.com/contest/1800/submission/278912301` | `codeforces.com/problemset/problem/1800/E` ❌ |
  | **CodeChef** | `codechef.com/viewsolution/108923412` | `codechef.com/problems/FLOW001` ❌ |
  | **GeeksforGeeks** | `geeksforgeeks.org/problems/.../submission/...` | `geeksforgeeks.org/problems/two-sum/1` ❌ |
  | **AtCoder** | `atcoder.jp/contests/abc340/submissions/50123984` | `atcoder.jp/contests/abc340/tasks/abc340_a` ❌ |
  | **HackerRank** | `hackerrank.com/challenges/.../submissions/...` | `hackerrank.com/challenges/solve-me-first` ❌ |
- Instant client-side & server-side regex validation with helpful feedback error tips.

---

### 🤖 Feature 6: Agentic AI Readiness Layer (Future-Proof Architecture)
To support autonomous AI agents that will analyze user habits and optimize productivity in later phases:
- **Telemetry Endpoints**:
  - `GET /api/v1/agent/telemetry/patterns`: Aggregates fail/retry patterns, topic decay (topics untouched for >14 days), and stuck categories.
  - `GET /api/v1/agent/telemetry/velocity`: Calculates time gaps between attempts and streak volatility.
  - `POST /api/v1/agent/queue/recommend`: Standardized hook allowing an AI agent to inject smart daily recommendations or revision tasks.

---

## 🔌 6. REST API Architecture (FastAPI)

```text
/api/v1
│
├── /user
│   ├── GET  /user/profile               # User profile, streak status, current target N
│   └── PUT  /user/settings              # Update target N, timezone, LC handle
│
├── /problems
│   ├── GET  /problems                   # List problems (filter: status, platform, difficulty, month)
│   ├── POST /problems/manual            # Manually add external problem (strict URL validation)
│   ├── GET  /problems/{id}              # Problem details & metadata
│   ├── PUT  /problems/{id}              # Update brief note, notes_url, stuck_category
│   ├── PUT  /problems/{id}/promote      # 1-Click promote 'tried' -> 'solved'
│   └── DELETE /problems/{id}            # Delete problem
│
├── /sync
│   ├── POST /sync/leetcode              # Trigger LeetCode sync
│   └── GET  /sync/status                # Last sync timestamp & stats
│
├── /streak
│   ├── GET  /streak/overview            # Current streak, target progress, records
│   └── GET  /streak/heatmap             # Year-to-date daily count grid
│
├── /analytics
│   ├── GET  /analytics/monthly-volume   # Bar chart data: monthly solved counts
│   ├── GET  /analytics/progress-timeline?month=YYYY-MM # Line chart data for selected/current month
│   └── GET  /analytics/topic-distribution # Topic mastery distribution
│
└── /agent (Future Agentic Hooks)
    ├── GET  /agent/telemetry/patterns   # Learning curve & failure clusters
    └── POST /agent/queue/recommend      # Ingest AI-curated revision queue
```

---

## 🎨 7. Frontend UI Design (Futuristic, Minimalist, Fast)

- **Color Palette**:
  - Background: Obsidian Deep Space `#090a0f`
  - Card Surfaces: Glassmorphism `#12141e` with `backdrop-filter: blur(12px)` and subtle `#1f2438` borders
  - Primary Accent: Cyber Neon Cyan `#00f2fe` / `#4facfe`
  - Secondary Accent: Neon Purple `#a855f7`
  - Solved Green: `#10b981` (with subtle glow)
  - Tried Amber: `#f59e0b`
  - Hard Red: `#ef4444`
- **Component Layout**:
  1. **Top HUD Bar**: Logo, Streak Counter Pill (`🔥 5 Days | Today 2/2 Complete`), LeetCode Sync Button, "+ Log Submission" Button.
  2. **Analytics Command Center**:
     - Monthly Volume Bar Chart (Interactive click filter).
     - Progress & Velocity Line Graph (Dynamically syncs to selected month or current month).
     - Activity Heatmap Grid.
  3. **Dual Workspace View Tabs**:
     - 🟢 **Solved Archive** (Search, Platform filter, Difficulty pills, notes drawer).
     - 🟠 **Tried Lab** (Stuck reason filters, editorial links, Promote to Solved button).
  4. **Modals**:
     - Submission Proof Ingestion Modal (Live URL regex validator).

---

## 🚀 8. Step-by-Step Implementation Roadmap

```text
Phase 1: Backend Foundation & Lean DB (FastAPI + Async Motor)
├── 1.1 Create FastAPI app structure with CMD-compatible scripts.
├── 1.2 Setup Async Motor connection with indexes on user_id, date, status, month.
├── 1.3 Implement lean Pydantic models (<350 bytes footprint).
├── 1.4 Build strict Multi-Platform Submission URL Regex Validator.
<<<<<<< HEAD
├── 1.5 Implement the DB connection.
├── 1.6 Implement the CRUD operations of users and problems.
├── 1.7 Implement User Authentication(login, logout, register, isLoggedIn).
├── 1.8 Implement proper error handling for the above implementation using try-except blocks.




=======
>>>>>>> 1bee731a474e37c2e8fde614a3d99ec1f5c7498b

Phase 2: LeetCode Engine & Streak Calculator
├── 2.1 Implement async LeetCode GraphQL fetcher for user submissions.
├── 2.2 Build auto-classification & deduplication pipeline.
├── 2.3 Implement Streak Calculator (Target N validation, daily rollups, month aggregation).

Phase 3: Analytics & Agentic Telemetry Endpoints
├── 3.1 Implement /analytics/monthly-volume and /analytics/progress-timeline (with month filtering).
├── 3.2 Implement /agent/telemetry hooks for future AI agent integrations.

Phase 4: Frontend Development (React + Vite + Recharts)
├── 4.1 Scaffold React app with futuristic dark/neon glassmorphism design.
├── 4.2 Build Monthly Bar Chart with interactive month click-event drilldown.
├── 4.3 Build Progress Line Graph updating dynamically on month selection.
├── 4.4 Build Solved Archive & Tried Lab workspace tables with drawer modals.
├── 4.5 Build Submission Ingestion Modal with live URL validation feedback.

Phase 5: Verification & Testing
├── 5.1 Run all test suites and verify via Command Prompt (cmd.exe).
├── 5.2 Validate LeetCode sync, invalid URL rejection, and month drilldown graphs.
```

---

## ❓ 9. User Verification & Approval
This plan integrates all your constraints (Command Prompt only, 512MB free tier ultra-lean data model, future AI agent telemetry readiness, futuristic lightweight UI, and interactive monthly bar + drilldown line graphs).

Please review the updated plan! When you are ready, approve and we will begin Phase 1.
