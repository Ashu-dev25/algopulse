from datetime import date, datetime, timedelta

from bson import ObjectId
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.schemas import (
    StreakHeatmapResponse,
    StreakOverviewResponse,
    UserResponse,
)
from app.services.streak_engine import get_heatmap_days, recalculate_streak
from app.services.leetcode_sync import get_user_timezone

router = APIRouter(prefix="/streak", tags=["Streak Engine"])


def _user_id(value: str):
    """Convert a normal user ID to ObjectId while supporting test doubles."""
    try:
        return ObjectId(value)
    except Exception:
        return value


@router.get("/overview", response_model=StreakOverviewResponse)
async def get_streak_overview(current_user: UserResponse = Depends(get_current_user)):
    """Recalculate and return the authenticated user's current streak overview."""
    db = await get_db()
    await recalculate_streak(db, current_user.id, current_user.daily_target, current_user.timezone)
    user_doc = await db.users.find_one({"_id": _user_id(current_user.id)})
    today_solved = int((user_doc or {}).get("today_solved", 0))
    today_tried = int((user_doc or {}).get("today_tried", 0))
    today_total = int((user_doc or {}).get("today_total", today_solved + today_tried))
    current_streak = int((user_doc or {}).get("current_streak", 0))
    longest_streak = int((user_doc or {}).get("longest_streak", 0))
    return StreakOverviewResponse(
        current_streak=current_streak,
        longest_streak=longest_streak,
        daily_target=current_user.daily_target,
        today_solved=today_solved,
        today_tried=today_tried,
        today_total=today_total,
        today_target_met=today_total >= current_user.daily_target,
        last_active_date=(user_doc or {}).get("last_active_date"),
    )


@router.post("/reset-before-today")
async def reset_history_before_today(current_user: UserResponse = Depends(get_current_user)):
    """Remove historical activity before today and recalculate from today's app data."""
    db = await get_db()
    today = datetime.now(get_user_timezone(current_user.timezone)).date().isoformat()

    await db.problems.delete_many(
        {
            "user_id": current_user.id,
            "$or": [
                {"last_attempt_local_date": {"$lt": today}},
                {"last_attempt_local_date": {"$exists": False}},
            ],
        }
    )
    await db.daily_activity.delete_many(
        {"user_id": current_user.id, "local_date": {"$lt": today}}
    )
    await db.daily_streaks.delete_many(
        {"user_id": current_user.id, "date": {"$lt": today}}
    )
    await db.sync_state.update_one(
        {"user_id": current_user.id},
        {"$set": {"user_id": current_user.id, "history_start_date": today}},
        upsert=True,
    )
    summary = await recalculate_streak(
        db,
        current_user.id,
        current_user.daily_target,
        current_user.timezone,
    )
    return {"date": today, **summary, "message": "History reset before today."}


@router.get("/heatmap", response_model=StreakHeatmapResponse)
async def get_streak_heatmap(
    days: int = Query(365, ge=1, le=730),
    current_user: UserResponse = Depends(get_current_user),
):
    """Return daily solved counts for the requested recent heatmap window."""
    db = await get_db()
    await recalculate_streak(db, current_user.id, current_user.daily_target, current_user.timezone)
    local_today = datetime.now(get_user_timezone(current_user.timezone)).date()
    start_date = local_today - timedelta(days=days - 1)
    records = await get_heatmap_days(db, current_user.id, start_date, local_today)
    record_map = {record["date"]: record for record in records}
    local_start = local_today - timedelta(days=days - 1)
    all_days = []
    cursor = local_start
    while cursor <= local_today:
        record = record_map.get(cursor.isoformat(), {})
        solved_count = int(record.get("solved_count", 0))
        tried_count = int(record.get("tried_count", 0))
        total_count = int(record.get("total_count", solved_count + tried_count))
        all_days.append(
            {
                "date": cursor.isoformat(),
                "solved_count": solved_count,
                "tried_count": tried_count,
                "total_count": total_count,
                "target_met": total_count >= current_user.daily_target,
            }
        )
        cursor += timedelta(days=1)
    return StreakHeatmapResponse(days=all_days)
