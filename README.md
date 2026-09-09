# 🚀 AlgoPulse

> **Daily Problem Tracking & Streak Management System** with Automated LeetCode Ingestion, Multi-Platform Proof Verification, Lean 512MB MongoDB Optimization, and Agentic AI Readiness.

---

## 📌 Features

- **📂 Dual Workspaces**: Dedicated **Solved Archive** and **Tried & Unsolved Lab** (with blocker categories and 1-click promotion).
- **🔥 Smart Daily Streak Engine**: User-configurable target $N$ problems/day with real-time progress HUD and activity heatmaps.
- **⚡ Automated LeetCode Ingestion**: Public GraphQL sync with exact timestamp attribution and deduplication.
- **🛡️ Strict Multi-Platform Proof Validator**: Validates submission URLs (Codeforces, CodeChef, GFG, AtCoder, HackerRank) and rejects generic problem links.
- **📊 Interactive Analytics & Monthly Drilldown**:
  - Monthly Volume Bar Chart with interactive click-to-filter.
  - Multi-metric Progress Line Graph (Current Streak, Longest Streak, Cumulative Solved, Weekly Pace) dynamically syncing to the selected month.
- **🗄️ 512MB MongoDB Free-Tier Optimization**: Ultra-lean models (<350 bytes/doc) for storing 1,000,000+ problem logs without database bloat.
- **🤖 Agentic AI Telemetry Layer**: Built-in `/api/v1/agent/` hooks for future autonomous productivity coaching agents.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Recharts, Lucide Icons, Cyberpunk Dark/Glassmorphism CSS
- **Backend**: FastAPI, Async Motor (MongoDB), Pydantic v2, HTTPX
- **Database**: MongoDB (Atlas Cloud 512MB Free Tier / Local)
- **Auth**: JWT-based Authentication (`/api/v1/auth/`)

---

## 📋 Project Documentation

- Detailed architecture, schemas, and API contracts: [`plan.md`](./plan.md)
- Environment diagnostic tool: [`check_prerequisites.bat`](./check_prerequisites.bat)
