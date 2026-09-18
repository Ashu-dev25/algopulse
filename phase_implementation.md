# 📖 AlgoPulse: Phase-Wise Implementation & Reference

---

## 🗺️ Roadmap & Current Status (Full-Stack Phase-by-Phase Model)

| Phase | Title | Scope (Backend + Frontend together) | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Backend Core, Auth, User & Problem CRUD, Strict URL Validator + Phase 1 Client UI** | **Backend**: FastAPI, MongoDB Async, JWT Auth, User & Problem CRUD, URL Proof Validator.<br>**Frontend**: Sleek Cyberpunk UI, Register/Login views, Problem CRUD workspace with live URL validation, User Profile modal, and Interactive Validator Playground. | 🟡 **Active & Ready for Full-Stack Testing** |
| **Phase 2** | **LeetCode Sync Engine & Streak Engine + Sync UI** | **Backend**: LeetCode GraphQL fetcher, timezone timestamp mapping, deduplication, streak target $N$ engine.<br>**Frontend**: LeetCode sync button with status indicators, Streak HUD counter, live target progress bar. | ⚪ Pending Phase 1 Validation |
| **Phase 3** | **Interactive Analytics & Progress Graphs + Analytics UI** | **Backend**: Monthly volume aggregator, progress timeline drilldown.<br>**Frontend**: Monthly Volume Bar Chart (click-to-drilldown), Multi-Metric Progress Line Chart, 6-Month Heatmap. | ⚪ Pending Phase 2 Validation |
| **Phase 4** | **Agentic AI Telemetry Layer & Coach Assistant** | **Backend**: `/agent/telemetry/patterns`, topic decay analysis.<br>**Frontend**: AI recommendation panel and revision reminders. | ⚪ Pending Phase 3 Validation |
| **Phase 5** | **End-to-End Testing & Final Production Polish** | Comprehensive test suites, security checks, production build verification. | ⚪ Pending Phase 4 Validation |

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

---

## 2. How and Why Each Component Was Built

### 🔹 1. Frontend-Backend Token Flow
- **WHAT**: JWT Bearer token stored in browser `localStorage` and sent in the HTTP `Authorization` header.
- **HOW**: `api/client.js` automatically checks for stored token, attaches `Authorization: Bearer <token>`, and handles 401 token expiry by resetting to the Login view.
- **WHY**: Works seamlessly in modern browsers without cookie domain or CORS issues, and maintains login state across page reloads.

### 🔹 2. Live URL Validation in Frontend
- **WHAT**: As the user types or pastes a link into the "Add Problem" modal or "Validator Playground", the client calls `/api/v1/validate/submission-url`.
- **HOW**: The backend regex engine checks if the URL matches a valid verdict/submission proof path (e.g. `codeforces.com/contest/1800/submission/...`) and rejects generic problem links (e.g. `codeforces.com/problemset/problem/1800/E`).
- **WHY**: Provides immediate visual feedback to the user before they submit the form.

### 🔹 3. 512MB MongoDB Optimization
- **WHAT**: Average document size kept below 350 bytes.
- **HOW**: Storing external URLs and short notes instead of multi-megabyte raw code and editorial text.
- **WHY**: Guarantees that MongoDB's 512MB free tier can store 1,000,000+ problem logs without running out of disk space.

---

## 3. How to Test Phase 1 (Command Prompt)

### Option A: 1-Click Launch (Recommended)
Open your **Command Prompt (`cmd.exe`)**:
```cmd
cd /d "d:\python projects\test"
start_phase1.bat
```
*(If first time running, run `setup_phase1.bat` first to install Python & npm dependencies)*.

This opens:
- 🌐 **Frontend UI Client**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

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





