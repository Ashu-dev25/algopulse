from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import httpx
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.schemas import UserResponse

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"
RECENT_SUBMISSIONS_QUERY = """
query recentSubmissions($username: String!, $limit: Int!) {
  recentSubmissionList(username: $username, limit: $limit) {
    id
    title
    titleSlug
    timestamp
    statusDisplay
    lang
  }
}
"""


def get_user_timezone(timezone_name: str) -> ZoneInfo:
    """Return a valid timezone, falling back to UTC for legacy invalid profiles."""
    try:
        return ZoneInfo(timezone_name or "UTC")
    except ZoneInfoNotFoundError:
        return ZoneInfo("UTC")


def submission_datetime(timestamp: Any) -> datetime:
    """Convert a LeetCode Unix timestamp into an aware UTC datetime."""
    return datetime.fromtimestamp(int(timestamp), tz=timezone.utc)


async def fetch_recent_submissions(
    username: str,
    limit: int = 20,
    client: Optional[httpx.AsyncClient] = None,
) -> List[Dict[str, Any]]:
    """Fetch recent public submissions from LeetCode GraphQL."""
    payload = {
        "query": RECENT_SUBMISSIONS_QUERY,
        "variables": {"username": username, "limit": limit},
    }
    owns_client = client is None
    request_client = client or httpx.AsyncClient(timeout=15.0)
    try:
        response = await request_client.post(
            LEETCODE_GRAPHQL_URL,
            json=payload,
            headers={"Content-Type": "application/json", "Referer": "https://leetcode.com/"},
        )
        response.raise_for_status()
        body = response.json()
        if body.get("errors"):
            raise RuntimeError(body["errors"][0].get("message", "LeetCode request failed."))
        return body.get("data", {}).get("recentSubmissionList") or []
    finally:
        if owns_client:
            await request_client.aclose()


def _problem_slug(submission: Dict[str, Any]) -> str:
    """Create a stable problem slug for imported submissions."""
    slug = (submission.get("titleSlug") or submission.get("title") or "unknown-problem").strip().lower()
    return "-".join(part for part in slug.replace("_", "-").split() if part)[:80]


async def sync_user_submissions(
    db: AsyncIOMotorDatabase,
    user: UserResponse,
    limit: int = 20,
) -> Dict[str, Any]:
    """Import recent LeetCode submissions idempotently for one authenticated user."""
    from app.services.streak_engine import record_daily_activity, recalculate_streak

    if not user.lc_handle:
        raise ValueError("Add a LeetCode handle in your profile before syncing.")

    submissions = await fetch_recent_submissions(user.lc_handle, limit=limit)
    synced_count = 0
    updated_count = 0
    skipped_count = 0
    failed_count = 0
    user_timezone = get_user_timezone(user.timezone)
    sync_state = await db.sync_state.find_one({"user_id": user.id})
    history_start_date = (sync_state or {}).get("history_start_date")

    for submission in submissions:
        source_id = str(submission.get("id") or "").strip()
        title = (submission.get("title") or _problem_slug(submission)).strip()
        timestamp = submission.get("timestamp")
        if not source_id or not timestamp:
            failed_count += 1
            continue

        submitted_at = submission_datetime(timestamp)
        submission_local_date = submitted_at.astimezone(user_timezone).date().isoformat()
        if history_start_date and submission_local_date < history_start_date:
            skipped_count += 1
            continue
        status = "solved" if str(submission.get("statusDisplay", "")).lower() == "accepted" else "tried"
        if status != "solved":
            # Sync contributes solved activity only. Tried records are user-created.
            skipped_count += 1
            continue

        slug = _problem_slug(submission)
        marker = await db.submissions.update_one(
            {"user_id": user.id, "sub_id": source_id},
            {
                "$setOnInsert": {
                    "user_id": user.id,
                    "sub_id": source_id,
                    "platform": "leetcode",
                    "submitted_at": submitted_at,
                    "local_date": submission_local_date,
                    "status": status,
                }
            },
            upsert=True,
        )
        is_new_submission = marker.upserted_id is not None
        if not is_new_submission:
            skipped_count += 1

        problem_key = f"leetcode-{slug}"
        query = {"user_id": user.id, "platform": "leetcode", "p_id": problem_key}
        if status == "solved":
            await db.problems.delete_one(query)
            await record_daily_activity(
                db,
                user.id,
                user.timezone,
                {
                    "problem_key": problem_key,
                    "p_id": problem_key,
                    "title": title,
                    "platform": "leetcode",
                    "sub_url": f"https://leetcode.com/problems/{slug}/submissions/{source_id}/",
                    "p_url": f"https://leetcode.com/problems/{slug}/",
                    "difficulty": "Medium",
                    "occurred_at": submitted_at,
                    "status": "solved",
                },
            )
            if is_new_submission:
                synced_count += 1
            continue

    await recalculate_streak(db, user.id, user.daily_target, user.timezone)
    synced_at = datetime.now(timezone.utc)
    await db.sync_state.update_one(
        {"user_id": user.id},
        {"$set": {"user_id": user.id, "last_synced_at": synced_at, "lc_handle": user.lc_handle}},
        upsert=True,
    )
    return {
        "synced_count": synced_count,
        "updated_count": updated_count,
        "skipped_count": skipped_count,
        "failed_count": failed_count,
        "last_synced_at": synced_at,
    }
