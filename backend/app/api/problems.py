from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
import re

from app.core.database import get_db
from app.models.schemas import (
    ProblemCreate, ProblemUpdate, ProblemResponse,
    ProblemStatusEnum, PlatformEnum, DifficultyEnum, UserResponse
)
from app.services.validator import validate_submission_url
from app.services.leetcode_sync import get_user_timezone
from app.services.streak_engine import local_date, record_daily_activity, recalculate_streak
from app.api.deps import get_current_user

router = APIRouter(prefix="/problems", tags=["Problem CRUD"])

def format_problem_doc(doc: dict) -> ProblemResponse:
    """
    Helper function to convert a MongoDB document into a typed ProblemResponse.
    """
    # 1) Map dictionary fields to ProblemResponse model
    return ProblemResponse(
        id=str(doc["_id"]),
        user_id=str(doc.get("user_id")),
        platform=doc.get("platform", PlatformEnum.OTHER),
        p_id=doc.get("p_id", ""),
        title=doc.get("title", ""),
        sub_url=doc.get("sub_url", ""),
        p_url=doc.get("p_url"),
        difficulty=doc.get("difficulty", DifficultyEnum.MEDIUM),
        tags=doc.get("tags", []),
        status=doc.get("status", ProblemStatusEnum.SOLVED),
        attempts=int(doc.get("attempts", 1)),
        solved_at=doc.get("solved_at"),
        first_attempt_at=doc.get("first_attempt_at"),
        brief_note=doc.get("brief_note"),
        notes_url=doc.get("notes_url"),
        stuck_category=doc.get("stuck_category"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
        manual_frequency=int(doc.get("manual_frequency", 0)),
    )

@router.post("", response_model=ProblemResponse, status_code=status.HTTP_201_CREATED)
async def create_problem(
    payload: ProblemCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    CRUD - CREATE: Creates a problem entry with strict submission URL proof validation.
    """
    try:
        # 1) Validate the submission URL using strict regex rules (rejects generic problem links)
        is_valid, detected_plat, err_msg = validate_submission_url(payload.sub_url, payload.platform)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

        # 2) Get database handle
        db = await get_db()
        now = datetime.now(timezone.utc)

        # 3) Generate clean slug problem ID
        slug = re.sub(r'[^a-zA-Z0-9]', '-', payload.title.lower()).strip('-')
        p_id = f"{payload.platform.value}-{slug[:50]}"

        # 4) Keep solved activity in the daily ledger; persist only tried history
        is_solved = payload.status == ProblemStatusEnum.SOLVED

        # 5) Prepare ultra-lean problem document
        problem_doc = {
            "user_id": current_user.id,
            "platform": payload.platform.value,
            "p_id": p_id,
            "title": payload.title.strip(),
            "sub_url": payload.sub_url.strip(),
            "p_url": payload.p_url.strip() if payload.p_url else None,
            "difficulty": payload.difficulty.value,
            "tags": [t.strip() for t in payload.tags if t.strip()][:4],
            "status": "tried",
            "attempts": 1,
            "solved_at": None,
            "first_attempt_at": now,
            "last_attempt_at": now,
            "last_attempt_local_date": local_date(now, current_user.timezone).isoformat(),
            "brief_note": payload.brief_note.strip() if payload.brief_note else None,
            "notes_url": payload.notes_url.strip() if payload.notes_url else None,
            "stuck_category": payload.stuck_category.value if payload.stuck_category else None,
            "created_at": now,
            "updated_at": now,
            "manual_frequency": payload.manual_frequency,
            "source": "manual",
        }

        if is_solved:
            await record_daily_activity(
                db,
                current_user.id,
                current_user.timezone,
                {**problem_doc, "problem_key": p_id, "status": "solved", "occurred_at": now},
            )
            await recalculate_streak(db, current_user.id, current_user.daily_target, current_user.timezone)
            created = await db.daily_activity.find_one(
                {"user_id": current_user.id, "local_date": local_date(now, current_user.timezone), "problem_key": p_id}
            )
        else:
            await db.problems.update_one(
                {"user_id": current_user.id, "platform": payload.platform.value, "p_id": p_id},
                {
                    "$set": {
                        key: value
                        for key, value in problem_doc.items()
                        if key not in {"attempts", "first_attempt_at", "created_at", "manual_frequency"}
                    },
                    "$setOnInsert": {
                        "first_attempt_at": now,
                        "created_at": now,
                        "manual_frequency": payload.manual_frequency,
                    },
                    "$inc": {"attempts": 1},
                },
                upsert=True,
            )
            created = await db.problems.find_one(
                {"user_id": current_user.id, "platform": payload.platform.value, "p_id": p_id}
            )

        # 8) Return formatted response
        return format_problem_doc(created)

    except HTTPException:
        raise
    except Exception as e:
        # 9) Catch unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create problem: {str(e)}")

@router.get("", response_model=List[ProblemResponse])
async def list_problems(
    status_filter: Optional[ProblemStatusEnum] = Query(None, alias="status"),
    platform_filter: Optional[PlatformEnum] = Query(None, alias="platform"),
    difficulty_filter: Optional[DifficultyEnum] = Query(None, alias="difficulty"),
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    view: str = Query("today", pattern="^(today|tried|all)$"),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    CRUD - READ LIST: Lists problems with optional filtering and pagination.
    """
    try:
        # 1) Get database handle
        db = await get_db()
        
        # 2) Build MongoDB query filter for tried history or all legacy records
        query = {"user_id": current_user.id}
        if view == "tried":
            query["status"] = "tried"
        elif view == "today":
            today = datetime.now(get_user_timezone(current_user.timezone)).date().isoformat()
            activity_cursor = db.daily_activity.find({"user_id": current_user.id, "local_date": today})
            activity_docs = await activity_cursor.to_list(length=limit)
            tried_cursor = db.problems.find({"user_id": current_user.id, "status": "tried", "last_attempt_local_date": today}).sort("last_attempt_at", -1).limit(limit)
            tried_docs = await tried_cursor.to_list(length=limit)
            combined = {str(doc.get("p_id")): doc for doc in activity_docs + tried_docs}
            today_docs = list(combined.values())
            if status_filter:
                requested_status = status_filter.value
                today_docs = [doc for doc in today_docs if doc.get("status") == requested_status]
            if platform_filter:
                today_docs = [doc for doc in today_docs if doc.get("platform") == platform_filter.value]
            if difficulty_filter:
                today_docs = [doc for doc in today_docs if doc.get("difficulty") == difficulty_filter.value]
            if search:
                search_value = search.lower()
                today_docs = [doc for doc in today_docs if search_value in doc.get("title", "").lower()]
            return [format_problem_doc(doc) for doc in today_docs[:limit]]
        if status_filter:
            query["status"] = "tried" if status_filter == ProblemStatusEnum.SOLVED else status_filter.value
        if platform_filter:
            query["platform"] = platform_filter.value
        if difficulty_filter:
            query["difficulty"] = difficulty_filter.value
        if search:
            query["title"] = {"$regex": re.escape(search), "$options": "i"}
            
        # 3) Query database with sorting by latest attempt/creation time
        cursor = db.problems.find(query).sort("created_at", -1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        
        # 4) Return list of formatted problem responses
        return [format_problem_doc(d) for d in docs]
        
    except Exception as e:
        # 5) Catch unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch problems: {str(e)}")

@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem_by_id(
    problem_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    CRUD - READ SINGLE: Retrieves a specific problem by ID.
    """
    try:
        # 1) Get database handle
        db = await get_db()
        
        # 2) Find problem by ID and user_id
        try:
            doc = await db.problems.find_one({"_id": ObjectId(problem_id), "user_id": current_user.id})
        except Exception:
            doc = None
            
        # 3) Raise 404 if not found
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found.")
            
        # 4) Return formatted problem response
        return format_problem_doc(doc)
        
    except HTTPException:
        raise
    except Exception as e:
        # 5) Catch unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch problem: {str(e)}")

@router.put("/{problem_id}", response_model=ProblemResponse)
async def update_problem(
    problem_id: str,
    payload: ProblemUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    CRUD - UPDATE: Updates problem details (notes, difficulty, tags, status).
    """
    try:
        # 1) Get database handle
        db = await get_db()
        now = datetime.now(timezone.utc)
        
        # 2) Build update dictionary
        update_fields = {"updated_at": now}
        if payload.title is not None:
            update_fields["title"] = payload.title.strip()
        if payload.difficulty is not None:
            update_fields["difficulty"] = payload.difficulty.value
        if payload.tags is not None:
            update_fields["tags"] = [t.strip() for t in payload.tags if t.strip()][:4]
        if payload.status is not None:
            if payload.status == ProblemStatusEnum.SOLVED:
                existing = await db.problems.find_one({"_id": ObjectId(problem_id), "user_id": current_user.id})
                if existing:
                    await record_daily_activity(
                        db, current_user.id, current_user.timezone,
                        {**existing, "problem_key": existing.get("p_id", problem_id), "status": "solved", "occurred_at": now},
                    )
                    await db.problems.delete_one({"_id": ObjectId(problem_id), "user_id": current_user.id})
                    await recalculate_streak(db, current_user.id, current_user.daily_target, current_user.timezone)
                    activity = await db.daily_activity.find_one({"user_id": current_user.id, "problem_key": existing.get("p_id", problem_id), "local_date": local_date(now, current_user.timezone)})
                    return format_problem_doc(activity)
            else:
                update_fields["status"] = "tried"
                update_fields["last_attempt_at"] = now
                update_fields["last_attempt_local_date"] = local_date(now, current_user.timezone).isoformat()
        if payload.manual_frequency is not None:
            update_fields["manual_frequency"] = payload.manual_frequency
        if payload.brief_note is not None:
            update_fields["brief_note"] = payload.brief_note.strip()
        if payload.notes_url is not None:
            update_fields["notes_url"] = payload.notes_url.strip()
        if payload.stuck_category is not None:
            update_fields["stuck_category"] = payload.stuck_category.value

        # 3) Execute update query
        try:
            res = await db.problems.update_one(
                {"_id": ObjectId(problem_id), "user_id": current_user.id},
                {"$set": update_fields}
            )
        except Exception:
            res = None

        # 4) Raise 404 if not matched
        if not res or res.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found.")

        # 5) Fetch and return updated document
        updated_doc = await db.problems.find_one({"_id": ObjectId(problem_id)})
        return format_problem_doc(updated_doc)

    except HTTPException:
        raise
    except Exception as e:
        # 6) Catch unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update problem: {str(e)}")

@router.delete("/{problem_id}", status_code=status.HTTP_200_OK)
async def delete_problem(
    problem_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    CRUD - DELETE: Deletes a problem from the database.
    """
    try:
        # 1) Get database handle
        db = await get_db()
        
        # 2) Delete a tried-history record when the card belongs to problems.
        try:
            res = await db.problems.delete_one({"_id": ObjectId(problem_id), "user_id": current_user.id})
        except Exception:
            res = None

        # 3) Today's solved cards belong to daily_activity, not problems.
        deleted_from_activity = False
        if not res or res.deleted_count == 0:
            try:
                activity_result = await db.daily_activity.delete_one(
                    {"_id": ObjectId(problem_id), "user_id": current_user.id}
                )
            except Exception:
                activity_result = None
            deleted_from_activity = bool(activity_result and activity_result.deleted_count > 0)

        # 4) Raise 404 only when neither source contained the user's record.
        if (not res or res.deleted_count == 0) and not deleted_from_activity:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found.")

        if deleted_from_activity:
            await recalculate_streak(
                db,
                current_user.id,
                current_user.daily_target,
                current_user.timezone,
            )

        # 5) Return success confirmation
        return {
            "status": "success",
            "message": f"Problem '{problem_id}' deleted successfully."
        }

    except HTTPException:
        raise
    except Exception as e:
        # 5) Catch unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete problem: {str(e)}")
