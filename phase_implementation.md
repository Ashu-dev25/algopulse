# 📖 AlgoPulse: Phase-Wise Implementation & Reference

---

## 🗺️ Roadmap & Current Status (Full-Stack Phase-by-Phase Model)

| Phase | Title | Scope (Backend + Frontend together) | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Backend Core, Auth, User & Problem CRUD, Strict URL Validator + Phase 1 Client UI** | **Backend**: FastAPI, MongoDB Async, JWT Auth, User & Problem CRUD, URL Proof Validator.<br>**Frontend**: Sleek Cyberpunk UI, Register/Login views, Problem CRUD workspace with live URL validation, User Profile modal, and Interactive Validator Playground. | 🟡 **Active & Ready for Full-Stack Testing** |
| **Phase 2** | **LeetCode Sync Engine & Streak Engine + Sync UI** | **Backend**: LeetCode GraphQL fetcher, timezone timestamp mapping, deduplication, streak target $N$ engine.<br>**Frontend**: LeetCode sync button with status indicators, Streak HUD counter, live target progress bar. | ⚪ Pending Phase 1 Validation |
| **Phase 3** | **Command-Driven Analytics & Agentic CRUD Intake** | **Backend**: period-scoped analytics, natural-language intent parsing, clarification state, validator-backed problem creation and CRUD actions.<br>**Frontend**: command console, clarification prompts, current week/month analytics views. | ⚪ Pending Phase 2 Validation |
| **Phase 4** | **Learning Coach, Revision Agent & Notifications** | **Backend**: evidence-grounded habit analysis, tried-topic weakness detection, spaced-revision scheduler, recommendation queue, notification preferences.<br>**Frontend**: learning analysis, revision sheet, recommendation explanations, due notifications. | ⚪ Pending Phase 3 Validation |
| **Phase 5** | **Agent Evaluation, Reliability & Production Polish** | Agent evals, guardrails, auditability, end-to-end tests, security checks, notification delivery tests, and production build verification. | ⚪ Pending Phase 4 Validation |

---

# 🚀 Phase 1: Complete Breakdown (What, How, and Why)

### 📋 Phase 1 Feature Checklist:
- [x] **1.1** Create FastAPI app structure with CMD-compatible scripts (`setup_backend.bat`, `start_backend.bat`, `setup_phase1.bat`, `start_phase1.bat`).
- [x] **1.2** Setup Async Motor connection with indexes on `user_id`, `date`, `status`, `sub_id`.
- [x] **1.3** Implement lean Pydantic models (<350 bytes footprint).
- [x] **1.4** Build strict Multi-Platform Submission URL Regex Validator.
- [x] **1.5** Implement the DB connection pool with async lifespan management.
- [x] **1.6** Implement the CRUD operations of users (`/users/profile`, `/users/account`) and problems (`/problems`).
- [x] **1.7** Implement User Authentication (`/auth/register`, `/auth/login`, `/auth/logout`, `/auth/isLoggedIn`).
- [x] **1.8** Implement proper error handling using `try-except` blocks and numbered step comments on every function.
- [x] **1.9** **Phase 1 Frontend Client (`frontend/`)**:
  - `AuthView.jsx`: Futuristic Signup / Signin view.
  - `ProblemCRUD.jsx`: Interactive Problem CRUD with live submission proof validator.
  - `ProfileModal.jsx`: User profile viewer, updater, and account deletion.
  - `ValidatorPlayground.jsx`: Testing laboratory to paste and verify any problem/submission link.

---

## 1. What Was Built in Phase 1 (Full Stack)

### 🔹 Backend Architecture
1. **`app/core/config.py`**: Reads `.env` for database URL, JWT secrets, target defaults.
2. **`app/core/security.py`**: Bcrypt password hashing (`get_password_hash`, `verify_password`) and JWT encode/decode.
3. **`app/core/database.py`**: Async MongoDB connection pool with sparse compound indexes.
4. **`app/models/schemas.py`**: Ultra-lean schemas (<350 bytes/doc) for Users, Problems, and URL Validation.
5. **`app/services/validator.py`**: Strict regex proof verification for Codeforces, CodeChef, GFG, AtCoder, HackerRank, LeetCode.
6. **`app/api/auth.py`**: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/isLoggedIn`.
7. **`app/api/users.py`**: `/users/profile` (Read & Update), `/users/account` (Delete).
8. **`app/api/problems.py`**: `/problems` (`POST`, `GET`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`).
9. **`app/api/validator.py`**: `/validate/submission-url`.

### 🔹 Frontend Client (`frontend/`)
1. **`api/client.js`**: Centralized API client automatically injecting JWT `Authorization: Bearer <token>` into fetch requests.
2. **`components/AuthView.jsx`**: Sleek login and registration view with input validation.
3. **`components/ProblemCRUD.jsx`**:
   - Filter by status (All, Solved, Tried), platform, difficulty, and search text.
   - Add problem modal with **live real-time URL validation** (rejects generic problem links with warning tips).
   - Edit modal to update status, notes, difficulty, and tags.
   - Delete problem button.
4. **`components/ProfileModal.jsx`**: Manage LeetCode handle, daily target $N$, timezone, and delete account.
5. **`components/ValidatorPlayground.jsx`**: Dedicated test lab with 1-click test samples to verify that bare problem links are rejected and submission proofs are accepted.


## 2. How and Why Each Component Was Built

### 🔹 1. Frontend-Backend Token Flow

### 🔹 2. Live URL Validation in Frontend

### 🔹 3. 512MB MongoDB Optimization


## 3. How to Test Phase 1 (Command Prompt)

### Option A: 1-Click Launch (Recommended)
Open your **Command Prompt (`cmd.exe`)**:
```cmd
cd /d "d:\python projects\test"
start_phase1.bat
```
*(If first time running, run `setup_phase1.bat` first to install Python & npm dependencies)*.

This opens:


### Option B: Interactive Client Testing Steps
1. Open **`http://localhost:3000`** in your browser.
2. Click **"Create Account"** $\rightarrow$ Register a test account.
3. Once logged in:
   - Click **"+ Add Problem"** $\rightarrow$ Try pasting a generic problem link (e.g. `https://codeforces.com/problemset/problem/1800/E`) $\rightarrow$ Observe the instant rejection warning!
   - Now paste a valid submission proof link (e.g. `https://codeforces.com/contest/1800/submission/278912301`) $\rightarrow$ Click **"Create Problem"**.
   - Test filtering by status (`Solved` vs `Tried`), platform, and difficulty.
   - Click **"Edit"** on a problem card to update notes or status.
   - Click **"URL Validator"** in the top bar to open the testing playground and click sample links.
   - Click the **Settings icon** $\rightarrow$ Update daily target $N$ or test account deletion.
   - Click **Logout** $\rightarrow$ Verify session cleanup.


---

# Phase 3: Command-Driven Analytics & Agentic CRUD Intake

> Status: Pending Phase 2 browser validation

## What to build

- Add `POST /api/v1/agent/command` for add, list, update, delete, and week/month analysis requests.
- Keep CRUD, URL validation, and analytics services as the source of truth. The model may choose an intent and extract fields, but it must not query MongoDB or mutate records directly.
- For `add <problem link>`, validate the link, detect the platform, collect missing title/status/difficulty/tags, show a preview, and require confirmation before creating the normal problem record.
- For update and delete requests, return matching candidates and require an explicit record choice and confirmation before mutation.
- Resolve current calendar week/month boundaries in the user's timezone and return exact dates, solved/tried totals, daily activity, and platform counts.

## How to build it

1. Define Pydantic schemas for intents, slots, clarification questions, confirmation previews, and typed results.
2. Implement an orchestration service that calls narrow server-owned tools for validation, candidate lookup, analytics, and confirmed CRUD.
3. Store only resumable clarification state in `agent_conversations`, with a TTL index; do not store full prompts or transcripts by default.
4. Add command-console states for loading, clarification, confirmation, validation errors, retry, and model unavailability.

## Exit checks

- Complete and incomplete `add <link>` commands work.
- Generic problem links are rejected by the existing validator.
- Update and delete never execute without confirmation.
- Week/month analytics use calendar boundaries in the user's timezone.
- Fixed CRUD and analytics endpoints work when the model is unavailable.

---

# Phase 4: Learning Coach, Revision Agent & Notifications

> Status: Pending Phase 3 validation

## What to build

- Preserve attempts, first-attempt time, solved transition time, normalized tags, and `stuck_category` in problem telemetry.
- Add `analyse my current learning`, learning evidence, due revision, and review endpoints.
- Score tried problems using recency, repeated attempts, unresolved status, failure category, supported weak tags, and overdue reviews.
- Create compact `revision_items` records using 1, 3, 7, 14, and 30-day intervals, adjusted by `again`, `hard`, `good`, or `easy` review results.
- Include solved problems only when their review is due or they reinforce a weak topic. Recommendations must include source IDs and state when evidence is insufficient.
- Add idempotent in-app notifications and notification preferences.

## How to build it

1. Produce deterministic evidence and candidate IDs before invoking the model.
2. Give the model aggregated evidence only; it may explain and rank candidates but cannot invent facts or write to the database.
3. Group the revision sheet into due today, upcoming, and recently completed, with reasons and a mark-reviewed action.
4. Create due notifications once per revision item through a retryable background mechanism.

## Exit checks

- Repeated failures rank above isolated failures in fixture tests.
- Recommendations contain source IDs, evidence counts, reason codes, and review dates.
- Missing tags do not become invented weaknesses.
- Revision and notification queries are user-scoped and idempotent.

---

# Phase 5: Agent Evaluation, Reliability & Production Polish

> Status: Pending Phase 4 validation

## What to build

- Add offline eval fixtures for intent detection, missing-field extraction, timezone ranges, platform summaries, CRUD confirmation, and revision ranking.
- Test prompt injection in URLs/notes, malformed model output, unsupported commands, timeouts, duplicate commands, model outages, and partial notification failures.
- Enforce Pydantic or Guardrails validation before tool calls, plus request limits, model timeouts, rate limits, token budgets, and redacted audit logs.
- Verify MongoDB indexes and TTL cleanup, frontend production build, accessibility, mobile layouts, and browser flows.

## Exit checks

- Agent eval results meet agreed thresholds and regressions are tracked.
- Unauthorized data access and unconfirmed mutations are rejected.
- Due notifications are idempotent and retried safely.
- Secrets and sensitive user data are absent from logs and traces.
- CRUD and fixed analytics fallbacks pass during model outages.





