from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.schemas import UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    """
    Extracts and validates current authenticated user from Bearer JWT token.
    """
    # 1) Check if token is present in the Authorization header
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2) Decode and verify JWT token signature
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3) Extract user_id from token payload
    user_id = payload["sub"]
    db = await get_db()
    
    # 4) Fetch user document from MongoDB
    user_doc = None
    try:
        user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    if not user_doc:
        user_doc = await db.users.find_one({"username": user_id})
        
    # 5) Raise 404 if user no longer exists in DB
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    
    # 6) Return standardized UserResponse
    return UserResponse(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        email=user_doc["email"],
        lc_handle=user_doc.get("lc_handle"),
        daily_target=int(user_doc.get("daily_target", 2)),
        timezone=user_doc.get("timezone", "Asia/Kolkata"),
        current_streak=int(user_doc.get("current_streak", 0)),
        longest_streak=int(user_doc.get("longest_streak", 0)),
        today_solved=int(user_doc.get("today_solved", 0)),
        last_active_date=user_doc.get("last_active_date"),
        created_at=user_doc.get("created_at")
    )
