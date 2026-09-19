from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# --- 1) Platform Enum (Platforms with direct sharable submission URLs + Other) ---
class PlatformEnum(str, Enum):
    CODEFORCES = "codeforces"
    CODECHEF = "codechef"
    ATCODER = "atcoder"
    LEETCODE = "leetcode"
    OTHER = "other"  # For GFG, HackerRank, CSES, and all other platforms

# --- 2) Problem Status & Difficulty Enums ---
class ProblemStatusEnum(str, Enum):
    SOLVED = "solved"
    TRIED = "tried"

class DifficultyEnum(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class StuckCategoryEnum(str, Enum):
    TLE = "tle"
    WA = "wa"
    MLE = "mle"
    LOGIC_GAP = "logic_gap"
    ALGO_INSIGHT = "algo_insight"
    EDGE_CASE = "edge_case"
    SYNTAX = "syntax"
    OTHER = "other"

# --- 3) User & Authentication Schemas ---
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    lc_handle: Optional[str] = Field(None, max_length=100)
    daily_target: int = Field(2, ge=1, le=50)
    timezone: str = Field("Asia/Kolkata")

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserProfileUpdate(BaseModel):
    lc_handle: Optional[str] = None
    daily_target: Optional[int] = Field(None, ge=1, le=50)
    timezone: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    lc_handle: Optional[str] = None
    daily_target: int = 2
    timezone: str = "Asia/Kolkata"
    current_streak: int = 0
    longest_streak: int = 0
    today_solved: int = 0
    last_active_date: Optional[str] = None
    created_at: Optional[datetime] = None


def user_response_from_doc(user_doc: dict) -> UserResponse:
    """Convert a MongoDB user document into the public user response model."""
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
        created_at=user_doc.get("created_at"),
    )

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AuthStatusResponse(BaseModel):
    is_logged_in: bool
    user: Optional[UserResponse] = None

# --- 4) Ultra-Lean Problem Schemas (<350 bytes/doc) ---
class ProblemCreate(BaseModel):
    platform: PlatformEnum = PlatformEnum.CODEFORCES
    title: str = Field(..., min_length=1, max_length=200)
    sub_url: str = Field(..., min_length=5, max_length=500)
    p_url: Optional[str] = None
    difficulty: DifficultyEnum = DifficultyEnum.MEDIUM
    tags: List[str] = Field(default_factory=list)
    status: ProblemStatusEnum = ProblemStatusEnum.SOLVED
    brief_note: Optional[str] = Field(None, max_length=280)
    notes_url: Optional[str] = Field(None, max_length=500)
    stuck_category: Optional[StuckCategoryEnum] = None
    manual_frequency: int = Field(0, ge=0, le=100000)

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    difficulty: Optional[DifficultyEnum] = None
    tags: Optional[List[str]] = None
    status: Optional[ProblemStatusEnum] = None
    brief_note: Optional[str] = Field(None, max_length=280)
    notes_url: Optional[str] = Field(None, max_length=500)
    stuck_category: Optional[StuckCategoryEnum] = None
    manual_frequency: Optional[int] = Field(None, ge=0, le=100000)

class ProblemResponse(BaseModel):
    id: str
    user_id: str
    platform: PlatformEnum
    p_id: str
    title: str
    sub_url: str
    p_url: Optional[str] = None
    difficulty: DifficultyEnum
    tags: List[str] = []
    status: ProblemStatusEnum
    attempts: int = 1
    solved_at: Optional[datetime] = None
    first_attempt_at: Optional[datetime] = None
    brief_note: Optional[str] = None
    notes_url: Optional[str] = None
    stuck_category: Optional[StuckCategoryEnum] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    manual_frequency: int = 0

# --- 5) URL Validation Schemas ---
class ValidateUrlRequest(BaseModel):
    url: str
    platform: Optional[PlatformEnum] = None

class ValidateUrlResponse(BaseModel):
    is_valid: bool
    detected_platform: Optional[PlatformEnum] = None
    error_message: Optional[str] = None

# --- 6) Phase 2 Sync and Streak Schemas ---
class SyncResponse(BaseModel):
    synced_count: int = 0
    updated_count: int = 0
    skipped_count: int = 0
    failed_count: int = 0
    last_synced_at: Optional[datetime] = None
    message: str

class SyncStatusResponse(BaseModel):
    configured: bool
    lc_handle: Optional[str] = None
    last_synced_at: Optional[datetime] = None

class StreakDayResponse(BaseModel):
    date: str
    solved_count: int
    tried_count: int = 0
    total_count: int = 0
    target_met: bool

class StreakOverviewResponse(BaseModel):
    current_streak: int
    longest_streak: int
    daily_target: int
    today_solved: int
    today_tried: int = 0
    today_total: int = 0
    today_target_met: bool
    last_active_date: Optional[str] = None

class StreakHeatmapResponse(BaseModel):
    days: List[StreakDayResponse]
