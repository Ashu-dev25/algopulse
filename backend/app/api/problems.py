from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import re

from app.core.database import get_db
from app.models.schemas import (
    ProblemCreate, ProblemUpdate, ProblemResponse,
    ProblemStatusEnum, PlatformEnum, DifficultyEnum, UserResponse
)
from app.services.validator import validate_submission_url
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
        updated_at=doc.get("updated_at")
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
        now = datetime.now()

        # 3) Generate clean slug problem ID
        slug = re.sub(r'[^a-zA-Z0-9]', '-', payload.title.lower()).strip('-')
        p_id = f"{payload.platform.value}-{slug[:50]}"

        # 4) Determine status and solve timestamp
        is_solved = (payload.status == ProblemStatusEnum.SOLVED)
        solved_dt = now if is_solved else None

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
            "status": payload.status.value,
            "attempts": 1,
            "solved_at": solved_dt,
            "first_attempt_at": now,
            "brief_note": payload.brief_note.strip() if payload.brief_note else None,
            "notes_url": payload.notes_url.strip() if payload.notes_url else None,
            "stuck_category": payload.stuck_category.value if payload.stuck_category else None,
            "created_at": now,
            "updated_at": now
        }

        # 6) Upsert problem document in MongoDB
        await db.problems.update_one(
            {"user_id": current_user.id, "platform": payload.platform.value, "p_id": p_id},
            {"$set": problem_doc},
            upsert=True
        )

        # 7) Fetch inserted document
        created = await db.problems.find_one({
            "user_id": current_user.id,
            "platform": payload.platform.value,
            "p_id": p_id
        })

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
    current_user: UserResponse = Depends(get_current_user)
):
    """
    CRUD - READ LIST: Lists problems with optional filtering and pagination.
    """
    try:
        # 1) Get database handle
        db = await get_db()
        
        # 2) Build MongoDB query filter
        query = {"user_id": current_user.id}
        if status_filter:
            query["status"] = status_filter.value
        if platform_filter:
            query["platform"] = platform_filter.value
        if difficulty_filter:
            query["difficulty"] = difficulty_filter.value
        if search:
            query["title"] = {"$regex": re.escape(search), "$options": "i"}
            
        # 3) Query database with sorting by solved_at/created_at
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
        now = datetime.now()
        
        # 2) Build update dictionary
        update_fields = {"updated_at": now}
        if payload.title is not None:
            update_fields["title"] = payload.title.strip()
        if payload.difficulty is not None:
            update_fields["difficulty"] = payload.difficulty.value
        if payload.tags is not None:
            update_fields["tags"] = [t.strip() for t in payload.tags if t.strip()][:4]
        if payload.status is not None:
            update_fields["status"] = payload.status.value
            if payload.status == ProblemStatusEnum.SOLVED:
                update_fields["solved_at"] = now
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
        
        # 2) Execute delete operation
        try:
            res = await db.problems.delete_one({"_id": ObjectId(problem_id), "user_id": current_user.id})
        except Exception:
            res = None

        # 3) Raise 404 if not found
        if not res or res.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Problem not found.")

        # 4) Return success confirmation
        return {
            "status": "success",
            "message": f"Problem '{problem_id}' deleted successfully."
        }

    except HTTPException:
        raise
    except Exception as e:
        # 5) Catch unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete problem: {str(e)}")
