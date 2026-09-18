# 🚀 AlgoPulse

> **Daily Problem Tracking & Streak Management System** with Automated LeetCode Ingestion, Multi-Platform Proof Verification, Lean 512MB MongoDB Optimization, and Agentic AI Readiness.

---

## 📌 Features

- **📂 Dual Workspaces**: Dedicated **Solved Archive** and **Tried & Unsolved Lab** (with blocker categories and 1-click promotion).
- **🔥 Smart Daily Streak Engine**: User-configurable target $N$ problems/day with real-time progress HUD and activity heatmaps.
- **⚡ Automated LeetCode Ingestion**: Public GraphQL sync with exact timestamp attribution and deduplication.
- **🛡️ Strict Multi-Platform Proof Validator**: Validates submission URLs (Codeforces, CodeChef, GFG, AtCoder, HackerRank) and rejects generic problem links.
- **📊 Period-Scoped Analytics**: Current week/month summaries with exact date ranges, daily activity, and per-platform solved counts.
- **🤖 Agentic Workflow Roadmap**: Prompt-driven CRUD, clarification and confirmation flows, learning analysis, spaced revision, and due notifications from Phase 3 onward.
- **🤖 Agentic AI Layer**: Phase 3+ command intake, validator-backed CRUD, period analysis, learning analysis, revision recommendations, and notifications.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Recharts, Lucide Icons, Cyberpunk Dark/Glassmorphism CSS
- **Backend**: FastAPI, Async Motor (MongoDB), Pydantic v2, HTTPX
- **Database**: MongoDB (Atlas Cloud 512MB Free Tier / Local)
- **Auth**: JWT-based Authentication (`/api/v1/auth/`)

---

## 📋 Project Documentation

- Detailed architecture, schemas, and API contracts: [`plan.md`](./plan.md)
- Agentic AI prerequisites and readiness criteria: [`agentic_prerequisites.md`](./agentic_prerequisites.md)
- Environment diagnostic tool: [`check_prerequisites.bat`](./check_prerequisites.bat)
