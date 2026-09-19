from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.schemas import UserRegister, UserLogin, UserResponse, Token, AuthStatusResponse, user_response_from_doc
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["User Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserRegister):
    """
    Registers a new user account, stores password hash, and returns JWT access token.
    """
    try:
        # 1) Fetch database handle
        db = await get_db()
        
        # 2) Check if username or email already exists in database
        existing_user = await db.users.find_one({
            "$or": [
                {"username": user_in.username.lower().strip()},
                {"email": user_in.email.lower().strip()}
            ]
        })
        if existing_user:
            if existing_user.get("username") == user_in.username.lower().strip():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already taken.")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")
        
        # 3) Hash the plain-text password using bcrypt
        password_hash = get_password_hash(user_in.password)
        
        # 4) Construct the ultra-lean user document
        now = datetime.now()
        user_doc = {
            "username": user_in.username.lower().strip(),
            "email": user_in.email.lower().strip(),
            "password_hash": password_hash,
            "lc_handle": user_in.lc_handle.strip() if user_in.lc_handle else None,
            "daily_target": user_in.daily_target,
            "timezone": user_in.timezone or "Asia/Kolkata",
            "current_streak": 0,
            "longest_streak": 0,
            "today_solved": 0,
            "last_active_date": None,
            "created_at": now
        }
        
        # 5) Insert document into users collection
        result = await db.users.insert_one(user_doc)
        user_id_str = str(result.inserted_id)
        
        # 6) Generate signed JWT access token containing user ID
        access_token = create_access_token(data={"sub": user_id_str})
        
        # 7) Format UserResponse object
        user_res = UserResponse(
            id=user_id_str,
            username=user_doc["username"],
            email=user_doc["email"],
            lc_handle=user_doc["lc_handle"],
            daily_target=user_doc["daily_target"],
            timezone=user_doc["timezone"],
            current_streak=0,
            longest_streak=0,
            today_solved=0,
            last_active_date=None,
            created_at=now
        )
        
        # 8) Return token and user profile
        return Token(access_token=access_token, token_type="bearer", user=user_res)
        
    except HTTPException:
        raise
    except Exception as e:
        # 9) Handle unexpected server/DB errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=Token)
async def login_user(login_in: UserLogin):
    """
    Authenticates user credentials and issues a signed JWT access token.
    """
    try:
        # 1) Fetch database handle
        db = await get_db()
        ident = login_in.username_or_email.lower().strip()
        
        # 2) Find user by username or email
        user_doc = await db.users.find_one({
            "$or": [{"username": ident}, {"email": ident}]
        })
        
        # 3) Check user existence and verify password hash
        if not user_doc or not verify_password(login_in.password, user_doc.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password."
            )
        
        # 4) Extract user ID and generate JWT access token
        user_id_str = str(user_doc["_id"])
        access_token = create_access_token(data={"sub": user_id_str})
        
        # 5) Build UserResponse object
        user_res = user_response_from_doc(user_doc)
        
        # 6) Return token and user profile
        return Token(access_token=access_token, token_type="bearer", user=user_res)
        
    except HTTPException:
        raise
    except Exception as e:
        # 7) Handle unexpected server/DB errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Login failed: {str(e)}")

@router.post("/logout")
async def logout_user(current_user: UserResponse = Depends(get_current_user)):
    """
    Logs out the user session. Since JWT is stateless, the client clears the token.
    """
    try:
        # 1) Verify user is authenticated via dependency
        # 2) Return confirmation response to clear client token
        return {
            "status": "success",
            "message": f"User {current_user.username} successfully logged out.",
            "is_logged_in": False
        }
    except Exception as e:
        # 3) Catch any unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Logout error: {str(e)}")

@router.get("/isLoggedIn", response_model=AuthStatusResponse)
@router.get("/me", response_model=AuthStatusResponse)
async def check_is_logged_in(current_user: UserResponse = Depends(get_current_user)):
    """
    Checks if the user has a valid active session/token and returns user profile.
    """
    try:
        # 1) Return login status True with current user profile
        return AuthStatusResponse(
            is_logged_in=True,
            user=current_user
        )
    except Exception as e:
        # 2) Return false on any error
        return AuthStatusResponse(
            is_logged_in=False,
            user=None
        )
