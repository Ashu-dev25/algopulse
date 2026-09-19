from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.schemas import SyncResponse, SyncStatusResponse, UserResponse
from app.services.leetcode_sync import sync_user_submissions

router = APIRouter(prefix="/sync", tags=["LeetCode Sync"])


@router.post("/leetcode", response_model=SyncResponse)
async def sync_leetcode(
    limit: int = Query(20, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user),
):
    """Fetch and idempotently import the authenticated user's recent LeetCode submissions."""
    try:
        db = await get_db()
        result = await sync_user_submissions(db, current_user, limit=limit)
        return SyncResponse(**result, message="LeetCode submissions synchronized.")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"LeetCode sync failed: {exc}")


@router.get("/status", response_model=SyncStatusResponse)
async def get_sync_status(current_user: UserResponse = Depends(get_current_user)):
    """Return the configured LeetCode handle and last successful sync time."""
    db = await get_db()
    state = await db.sync_state.find_one({"user_id": current_user.id})
    return SyncStatusResponse(
        configured=bool(current_user.lc_handle),
        lc_handle=current_user.lc_handle,
        last_synced_at=state.get("last_synced_at") if state else None,
    )
