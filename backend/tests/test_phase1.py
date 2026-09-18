import sys
import os

# 1) Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.validator import validate_submission_url, detect_platform
from app.models.schemas import PlatformEnum, ProblemCreate, ProblemStatusEnum, DifficultyEnum
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_submission_url_validator():
    """
    Tests strict proof URL validation for platforms with public submission links
    and flexible validation for other platforms (GFG, HackerRank, etc.).
    """
    print("\n--- [TEST 1] Submission Proof URL Validator ---")
    
    # 1) Valid Codeforces submission proof
    valid_cf = "https://codeforces.com/contest/1800/submission/278912301"
    is_valid, plat, err = validate_submission_url(valid_cf)
    assert is_valid is True, f"Expected True for {valid_cf}, got {err}"
    assert plat == PlatformEnum.CODEFORCES
    print("  ✅ Valid Codeforces submission link passed.")

    # 2) Invalid Generic Codeforces problem link (must be rejected!)
    invalid_cf = "https://codeforces.com/problemset/problem/1800/E"
    is_valid, plat, err = validate_submission_url(invalid_cf)
    assert is_valid is False, f"Expected rejection for generic link {invalid_cf}"
    print(f"  ✅ Generic Codeforces problem link correctly rejected: {err[:50]}...")

    # 3) Valid CodeChef viewsolution link
    valid_cc = "https://www.codechef.com/viewsolution/108923412"
    is_valid, plat, err = validate_submission_url(valid_cc)
    assert is_valid is True
    print("  ✅ Valid CodeChef submission link passed.")

    # 4) Invalid Generic CodeChef link (must be rejected!)
    invalid_cc = "https://www.codechef.com/problems/FLOW001"
    is_valid, plat, err = validate_submission_url(invalid_cc)
    assert is_valid is False
    print("  ✅ Generic CodeChef problem link correctly rejected.")

    # 5) Valid AtCoder submission link
    valid_at = "https://atcoder.jp/contests/abc340/submissions/50123984"
    is_valid, plat, err = validate_submission_url(valid_at)
    assert is_valid is True
    print("  ✅ Valid AtCoder submission link passed.")

    # 6) Invalid Generic AtCoder task link
    invalid_at = "https://atcoder.jp/contests/abc340/tasks/abc340_a"
    is_valid, plat, err = validate_submission_url(invalid_at)
    assert is_valid is False
    print("  ✅ Generic AtCoder task link correctly rejected.")

    # 7) Other Platforms (GFG, HackerRank, CSES) fall under OTHER category
    gfg_link = "https://www.geeksforgeeks.org/problems/two-sum/1"
    is_valid, plat, err = validate_submission_url(gfg_link, PlatformEnum.OTHER)
    assert is_valid is True
    assert plat == PlatformEnum.OTHER
    print("  ✅ Other platform link (e.g. GeeksforGeeks) accepted under OTHER category.")

def test_security_auth():
    """
    Tests bcrypt password hashing and JWT token lifecycle.
    """
    print("\n--- [TEST 2] Security & JWT Token Authentication ---")
    
    # 1) Password hashing and verification
    plain_pw = "super_secure_pass_123"
    hashed = get_password_hash(plain_pw)
    assert verify_password(plain_pw, hashed) is True
    assert verify_password("wrong_password", hashed) is False
    print("  ✅ Password hashing and verification passed.")

    # 2) JWT token generation and decoding
    test_user_id = "user_64f123456789abcdef012345"
    token = create_access_token(data={"sub": test_user_id})
    assert isinstance(token, str) and len(token) > 20
    
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == test_user_id
    print("  ✅ JWT token encoding and decoding passed.")

def test_lean_schemas():
    """
    Tests Pydantic schema validation for Problems.
    """
    print("\n--- [TEST 3] Ultra-Lean Schema Validation ---")
    
    # 1) Test ProblemCreate schema
    prob = ProblemCreate(
        platform=PlatformEnum.CODEFORCES,
        title="Recent Actions",
        sub_url="https://codeforces.com/contest/1800/submission/278912301",
        difficulty=DifficultyEnum.MEDIUM,
        tags=["Two Pointers", "Greedy"],
        status=ProblemStatusEnum.SOLVED,
        brief_note="Greedy scan with two pointers"
    )
    assert prob.platform == PlatformEnum.CODEFORCES
    assert len(prob.tags) == 2
    print("  ✅ Ultra-lean problem schema validated successfully.")

if __name__ == "__main__":
    print("===================================================")
    print("         AlgoPulse - Phase 1 Validation Suite      ")
    print("===================================================")
    try:
        # 1) Run URL validator tests
        test_submission_url_validator()
        
        # 2) Run Security & JWT tests
        test_security_auth()
        
        # 3) Run Schema tests
        test_lean_schemas()
        
        print("\n===================================================")
        print("  🎉 ALL PHASE 1 CORE TESTS PASSED SUCCESSFULLY!  ")
        print("===================================================")
    except AssertionError as e:
        print(f"\n❌ Test Assertion Failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        sys.exit(1)
