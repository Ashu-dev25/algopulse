from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from app.core.database import get_db
from app.models.schemas import UserResponse, UserProfileUpdate, user_response_from_doc
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["User Profile CRUD"])

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """
    CRUD - READ: Returns current authenticated user profile.
    """
    try:
        # 1) Return the authenticated user model
        return current_user
    except Exception as e:
        # 2) Handle error
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch profile: {str(e)}")

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    update_in: UserProfileUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    CRUD - UPDATE: Updates user preferences (daily target, LeetCode handle, timezone).
    """
    try:
        # 1) Get database handle
        db = await get_db()
        
        # 2) Construct update payload dictionary
        update_data = {}
        if update_in.lc_handle is not None:
            update_data["lc_handle"] = update_in.lc_handle.strip() if update_in.lc_handle else None
        if update_in.daily_target is not None:
            update_data["daily_target"] = update_in.daily_target
        if update_in.timezone is not None:
            update_data["timezone"] = update_in.timezone
            
        # 3) Update user document in MongoDB
        if update_data:
            await db.users.update_one(
                {"_id": ObjectId(current_user.id)},
                {"$set": update_data}
            )
            
        # 4) Fetch updated document from DB
        updated_doc = await db.users.find_one({"_id": ObjectId(current_user.id)})
        if not updated_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
            
        # 5) Return updated UserResponse
        return user_response_from_doc(updated_doc)
    except HTTPException:
        raise
    except Exception as e:
        # 6) Catch unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update profile: {str(e)}")

@router.delete("/account", status_code=status.HTTP_200_OK)
async def delete_user_account(current_user: UserResponse = Depends(get_current_user)):
    """
    CRUD - DELETE: Deletes the user account and associated problem logs.
    """
    try:
        # 1) Get database handle
        db = await get_db()
        
        # 2) Delete problems belonging to user
        await db.problems.delete_many({"user_id": current_user.id})
        
        # 3) Delete daily streaks belonging to user
        await db.daily_streaks.delete_many({"user_id": current_user.id})

        # 4) Delete Phase 2 activity, sync markers, and imported submission keys
        await db.daily_activity.delete_many({"user_id": current_user.id})
        await db.sync_state.delete_many({"user_id": current_user.id})
        await db.submissions.delete_many({"user_id": current_user.id})
        
        # 5) Delete user account document
        res = await db.users.delete_one({"_id": ObjectId(current_user.id)})
        if res.deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
            
        # 6) Return success response
        return {
            "status": "success",
            "message": f"Account '{current_user.username}' and associated data have been permanently deleted."
        }
    except HTTPException:
        raise
    except Exception as e:
        # 6) Catch unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete account: {str(e)}")
