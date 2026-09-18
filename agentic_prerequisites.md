# AlgoPulse Agentic AI Prerequisites

This document defines what must be available before AlgoPulse moves from the Phase 1-2 CRUD application to the Phase 3-5 agentic system.

## 1. Product Contracts

- Phase 1-2 CRUD and URL validation remain usable without an LLM.
- Supported command intents are explicit: add, list, update, delete, analyse week/month, and analyse current learning.
- Mutating commands show a typed preview and require confirmation after all missing fields are collected.
- Analytics always states the exact date range and user's timezone.
- Learning analysis is based on the authenticated user's database records only.
- A recommendation includes source problem IDs, reason codes, review timing, and an evidence/confidence indicator.

## 2. Current Application Baseline

- Python 3.11+, FastAPI, Pydantic v2, Motor, MongoDB, JWT authentication, and React/Vite are installed and working.
- Phase 1 tests pass and Phase 2 sync/streak behavior is verified before Phase 3 begins.
- Every problem has reliable `user_id`, status, platform, timestamps, tags, attempts, and `stuck_category` values where known.
- The user's timezone is valid and used for all week/month boundaries and notification scheduling.
- MongoDB indexes and the 512MB storage constraint are reviewed before adding new collections.

## 3. Model Provider Requirements

Choose one hosted or local chat model that supports structured JSON/tool calling, with:

- Environment-configured API key and model name; never commit secrets.
- Request timeout, retry, rate-limit, and token-budget settings.
- A model capable of extracting intent and slots, asking clarification questions, and producing concise explanations.
- No direct database credentials or unrestricted code execution available to the model.
- A provider fallback or deterministic response path when the model is unavailable.

Suggested initial approach: use the provider's native structured-output API behind a small adapter. The target design is a supervisor-style multi-agent system, but Phase 3 should start with one deployed command supervisor and a small number of specialized agent nodes. Add LangChain only if its message/tool abstractions materially simplify the project. Use LangGraph for durable routing and resumable clarification -> validation -> confirmation -> execution workflows. Do not introduce both libraries before a concrete need exists.

The system is multi-agent by responsibility, not by unrestricted agent-to-agent conversation. The command supervisor routes to specialized agents for CRUD intake, analytics, learning analysis, revision planning, and notifications. Agents communicate through typed state and tool results, never by sharing database credentials or writing directly to MongoDB.

## 4. Agent Runtime and Tools

The agent should call narrow server-owned tools, not arbitrary Python functions:

- `resolve_command_intent`
- `get_problem_candidates`
- `validate_submission_url`
- `get_period_analytics`
- `get_learning_evidence`
- `create_problem_after_confirmation`
- `update_problem_after_confirmation`
- `delete_problem_after_confirmation`
- `schedule_revision`
- `mark_revision_reviewed`
- `create_due_notification`

Each tool must validate input with Pydantic, enforce `current_user.id`, return typed output, and be independently unit-testable. Tool results are the only source of database facts shown to the model.

## 5. Data and Schema Prerequisites

Add compact, user-scoped models for:

- `agent_conversations`: intent, state, extracted slots, candidate IDs, and `expires_at` for TTL cleanup.
- `revision_items`: problem ID, priority, reason codes, review outcome, review count, and next review time.
- `notifications`: revision ID, kind, schedule time, read state, and creation time.

Required existing-data rules:

- Increment `attempts` on retries instead of resetting it during upsert.
- Preserve `first_attempt_at` and only set `solved_at` on a transition to solved.
- Normalize tags and stuck categories before aggregation.
- Add indexes for user/status/time, user/tags, due revisions, uniqueness of due notifications, and TTL fields.
- Do not store raw prompts, raw model transcripts, source code, editorials, or large generated sheets in MongoDB.

## 6. Analytics and Revision Logic

Deterministic services must calculate facts before the LLM explains them.

### Week and month analysis

- Convert `now` to the user's timezone.
- Resolve the current calendar week/month, not a rolling 7/30-day window.
- Query only the inclusive range and return `from`, `to`, solved, tried, total, daily activity, and platform counts.
- Compare with the previous equivalent period when enough history exists.

### Learning analysis

- Group tried problems by normalized tag and stuck category.
- Score recency, repeated attempts, unresolved tried status, failure category, and overdue reviews.
- Require a minimum evidence threshold before labeling a topic weak.
- Rank candidate problem IDs deterministically; let the model explain and prioritize within the candidate set.
- Use a spaced cycle such as 1, 3, 7, 14, and 30 days, adjusted by `again`, `hard`, `good`, or `easy` review outcomes.
- Include solved problems for revision when their interval is due or they reinforce a weak topic.

## 7. Safety, Privacy, and Guardrails

- Validate model output with Pydantic or Guardrails before any tool call.
- Treat user-provided URLs, titles, notes, and problem text as untrusted input and defend against prompt injection.
- Require confirmation for create, update, delete, and bulk actions.
- Never permit cross-user candidate lookup or recommendation retrieval.
- Redact tokens, passwords, URLs containing secrets, and unnecessary prompt content from logs and traces.
- Add request size limits, model timeouts, rate limits, and an audit record containing intent, tool calls, confirmation, and result IDs.
- Do not present an inferred weakness as a fact when the database evidence is insufficient.

## 8. Evaluation Prerequisites

Create a small versioned fixture dataset containing solved and tried problems across platforms, tags, failure categories, timestamps, attempts, and review outcomes. Add expected cases for:

- `add <link>` with complete fields.
- `add <link>` with missing title, status, difficulty, or tags.
- Invalid and generic problem URLs.
- Current week/month boundaries across timezones.
- Platform summaries with one or several platforms.
- Ambiguous update/delete requests and confirmation rejection.
- Repeated tried problems and weak-topic ranking.
- Insufficient evidence and overdue revision items.
- Duplicate commands, malformed model JSON, tool timeout, and model outage.

Track intent accuracy, slot extraction, correct date ranges, tool-call validity, unauthorized-data rate, recommendation precision, and groundedness. Keep deterministic analytics and scheduler tests independent of the model provider.

## 9. Infrastructure and Operations

- Development `.env` entries for model provider, model name, timeout, token budget, and optional trace provider.
- Separate development and production keys and database credentials.
- Optional LangSmith or equivalent tracing with redaction enabled; tracing is not required for core functionality.
- In-app notification delivery first; email or push delivery can follow after the in-app workflow is reliable.
- Background scheduling mechanism for due notifications, with idempotency and retry handling.
- Monitoring for model latency, failure rate, token spend, tool errors, notification failures, and evaluation regressions.

## Definition of Ready for Phase 3

Phase 2 is browser-verified, the model adapter returns validated structured output, the tool boundary enforces authentication, period analytics has timezone tests, and the new collections/index plan is approved.

## Definition of Ready for Phase 4

Phase 3 command flows pass clarification and confirmation tests, tried records contain usable evidence, and analytics results are deterministic and available without the model.

## Definition of Done for Phase 5

The system has passing unit, integration, and browser tests; offline agent evals meet agreed thresholds; unsafe or ungrounded tool calls are rejected; due notifications are idempotent; secrets are redacted; and the CRUD fallback works during model outages.
