from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from typing import Dict, List

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.leetcode_sync import get_user_timezone


def local_date(value: datetime, timezone_name: str) -> date:
    """Convert a stored timestamp into the user's local calendar date."""
    aware_value = value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value
    return aware_value.astimezone(get_user_timezone(timezone_name)).date()


def calculate_current_streak(
    activity_counts: Dict[date, set],
    today: date,
    daily_target: int,
) -> int:
    """Count consecutive target-met days ending today or the latest completed day."""
    completed_days = [
        activity_date
        for activity_date, problem_keys in activity_counts.items()
        if activity_date <= today and len(problem_keys) >= daily_target
    ]
    if not completed_days:
        return 0

    cursor = max(completed_days)
    streak = 0
    while cursor >= min(activity_counts):
        if len(activity_counts.get(cursor, set())) < daily_target:
            break
        streak += 1
        cursor -= timedelta(days=1)
    return streak


async def record_daily_activity(
    db: AsyncIOMotorDatabase,
    user_id: str,
    timezone_name: str,
    activity: dict,
) -> None:
    """Record one logical problem in today's activity ledger without duplication."""
    occurred_at = activity.get("occurred_at") or datetime.now(timezone.utc)
    activity_date = local_date(occurred_at, timezone_name).isoformat()
    activity_document = {
        "user_id": user_id,
        "local_date": activity_date,
        "problem_key": activity["problem_key"],
        "platform": activity.get("platform", "other"),
        "title": activity["title"],
        "p_id": activity["p_id"],
        "sub_url": activity.get("sub_url"),
        "p_url": activity.get("p_url"),
        "status": activity.get("status", "solved"),
        "difficulty": activity.get("difficulty", "Medium"),
        "tags": activity.get("tags", [])[:4],
        "occurred_at": occurred_at,
    }
    await db.daily_activity.update_one(
        {
            "user_id": user_id,
            "local_date": activity_date,
            "problem_key": activity["problem_key"],
        },
        {"$set": activity_document},
        upsert=True,
    )


async def recalculate_streak(
    db: AsyncIOMotorDatabase,
    user_id: str,
    daily_target: int,
    timezone_name: str,
) -> Dict[str, int]:
    """Rebuild daily solved counts and current/longest streak values."""
    # Migrate legacy solved records into the activity ledger before calculating counts.
    legacy_cursor = db.problems.find({"user_id": user_id, "status": "solved"})
    async for legacy_problem in legacy_cursor:
        solved_at = legacy_problem.get("solved_at") or legacy_problem.get("updated_at") or datetime.now(timezone.utc)
        await record_daily_activity(
            db,
            user_id,
            timezone_name,
            {
                **legacy_problem,
                "problem_key": legacy_problem.get("p_id", str(legacy_problem.get("_id"))),
                "p_id": legacy_problem.get("p_id", str(legacy_problem.get("_id"))),
                "occurred_at": solved_at,
                "status": "solved",
            },
        )
    await db.problems.delete_many({"user_id": user_id, "status": "solved"})

    solved_counts: Dict[date, set] = defaultdict(set)
    tried_counts: Dict[date, set] = defaultdict(set)
    activity_cursor = db.daily_activity.find(
        {"user_id": user_id, "status": "solved"},
        {"local_date": 1, "problem_key": 1},
    )
    async for activity in activity_cursor:
        activity_day = activity.get("local_date")
        if activity_day:
            solved_counts[date.fromisoformat(activity_day)].add(activity["problem_key"])

    tried_cursor = db.problems.find(
        {"user_id": user_id, "status": "tried"},
        {"last_attempt_local_date": 1, "p_id": 1},
    )
    async for problem in tried_cursor:
        activity_day = problem.get("last_attempt_local_date")
        problem_key = problem.get("p_id")
        if activity_day and problem_key:
            tried_counts[date.fromisoformat(activity_day)].add(problem_key)

    today = datetime.now(get_user_timezone(timezone_name)).date()
    activity_counts = defaultdict(set)
    for activity_day in set(solved_counts) | set(tried_counts):
        activity_counts[activity_day] = solved_counts[activity_day] | tried_counts[activity_day]

    first_date = min(activity_counts.keys(), default=today)
    end_date = max(today, max(activity_counts.keys(), default=today))
    current = 0
    longest = 0
    run = 0
    day = first_date
    while day <= end_date:
        solved_count = len(solved_counts.get(day, set()))
        tried_count = len(tried_counts.get(day, set()))
        count = len(activity_counts.get(day, set()))
        target_met = count >= daily_target
        await db.daily_streaks.update_one(
            {"user_id": user_id, "date": day.isoformat()},
            {
                "$set": {
                    "user_id": user_id,
                    "date": day.isoformat(),
                    "solved_count": count,
                    "tried_count": tried_count,
                    "total_count": count,
                    "target_met": target_met,
                    "target_req": daily_target,
                    "month": day.strftime("%Y-%m"),
                }
            },
            upsert=True,
        )
        if target_met:
            run += 1
            longest = max(longest, run)
        else:
            run = 0
        day += timedelta(days=1)

    current = calculate_current_streak(activity_counts, today, daily_target)

    today_solved = len(solved_counts.get(today, set()))
    today_tried = len(tried_counts.get(today, set()))
    today_total = len(activity_counts.get(today, set()))
    await db.users.update_one(
        {"_id": _object_id_or_string(user_id)},
        {
            "$set": {
                "current_streak": current,
                "longest_streak": longest,
                "today_solved": today_solved,
                "today_tried": today_tried,
                "today_total": today_total,
                "last_active_date": max(activity_counts.keys(), default=None).isoformat() if activity_counts else None,
            }
        },
    )
    return {
        "current_streak": current,
        "longest_streak": longest,
        "today_solved": today_solved,
        "today_tried": today_tried,
        "today_total": today_total,
    }


def _object_id_or_string(user_id: str):
    """Return ObjectId for normal users while keeping test doubles simple."""
    from bson import ObjectId

    try:
        return ObjectId(user_id)
    except Exception:
        return user_id


async def get_heatmap_days(
    db: AsyncIOMotorDatabase,
    user_id: str,
    start_date: date,
    end_date: date,
) -> List[dict]:
    """Return solved, tried, and total counts from AlgoPulse records."""
    activity_cursor = db.daily_activity.find(
        {
            "user_id": user_id,
            "local_date": {
                "$gte": start_date.isoformat(),
                "$lte": end_date.isoformat(),
            },
        },
        {"_id": 0, "local_date": 1, "problem_key": 1, "status": 1},
    )
    counts_by_date = defaultdict(lambda: {"solved": set(), "tried": set()})
    async for activity in activity_cursor:
        activity_date = activity.get("local_date")
        problem_key = activity.get("problem_key")
        if activity_date and problem_key:
            status = "solved" if activity.get("status") == "solved" else "tried"
            counts_by_date[activity_date][status].add(problem_key)

    tried_cursor = db.problems.find(
        {
            "user_id": user_id,
            "status": "tried",
            "last_attempt_local_date": {
                "$gte": start_date.isoformat(),
                "$lte": end_date.isoformat(),
            },
        },
        {"_id": 0, "last_attempt_local_date": 1, "p_id": 1},
    )
    async for problem in tried_cursor:
        activity_date = problem.get("last_attempt_local_date")
        problem_key = problem.get("p_id")
        if activity_date and problem_key:
            counts_by_date[activity_date]["tried"].add(problem_key)

    return [
        {
            "date": activity_date,
            "solved_count": len(counts["solved"]),
            "tried_count": len(counts["tried"]),
            "total_count": len(counts["solved"] | counts["tried"]),
            "target_met": False,
        }
        for activity_date, counts in sorted(counts_by_date.items())
    ]
