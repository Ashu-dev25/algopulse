import re
from typing import Tuple, Optional
from app.models.schemas import PlatformEnum

# Platform-specific validation rules for platforms with verifiable submission URLs
PLATFORM_VALIDATION_RULES = {
    PlatformEnum.CODEFORCES: {
        "name": "Codeforces",
        "submission_regex": re.compile(
            r"https?://(?:www\.)?codeforces\.com/(?:contest/\d+/submission/\d+|problemset/submission/\d+/\d+|gym/\d+/submission/\d+|group/[^/]+/contest/\d+/submission/\d+)",
            re.IGNORECASE
        ),
        "generic_problem_regex": re.compile(
            r"https?://(?:www\.)?codeforces\.com/(?:problemset/problem/\d+/\w+|contest/\d+/problem/\w+|gym/\d+/problem/\w+)",
            re.IGNORECASE
        ),
        "example_valid": "https://codeforces.com/contest/1800/submission/278912301",
        "example_invalid": "https://codeforces.com/problemset/problem/1800/E"
    },
    PlatformEnum.CODECHEF: {
        "name": "CodeChef",
        "submission_regex": re.compile(
            r"https?://(?:www\.)?codechef\.com/(?:viewsolution/\d+|status/[^/]+,\w+)",
            re.IGNORECASE
        ),
        "generic_problem_regex": re.compile(
            r"https?://(?:www\.)?codechef\.com/problems/[A-Za-z0-9_]+",
            re.IGNORECASE
        ),
        "example_valid": "https://www.codechef.com/viewsolution/108923412",
        "example_invalid": "https://www.codechef.com/problems/FLOW001"
    },
    PlatformEnum.ATCODER: {
        "name": "AtCoder",
        "submission_regex": re.compile(
            r"https?://(?:www\.)?atcoder\.jp/contests/[^/]+/submissions/\d+",
            re.IGNORECASE
        ),
        "generic_problem_regex": re.compile(
            r"https?://(?:www\.)?atcoder\.jp/contests/[^/]+/tasks/[^/]+",
            re.IGNORECASE
        ),
        "example_valid": "https://atcoder.jp/contests/abc340/submissions/50123984",
        "example_invalid": "https://atcoder.jp/contests/abc340/tasks/abc340_a"
    },
    PlatformEnum.LEETCODE: {
        "name": "LeetCode",
        "submission_regex": re.compile(
            r"https?://(?:www\.)?leetcode\.com/(?:submissions/detail/\d+|problems/[^/]+/submissions/\d+)",
            re.IGNORECASE
        ),
        "generic_problem_regex": re.compile(
            r"https?://(?:www\.)?leetcode\.com/problems/[^/]+/?$",
            re.IGNORECASE
        ),
        "example_valid": "https://leetcode.com/problems/two-sum/submissions/13840001/",
        "example_invalid": "https://leetcode.com/problems/two-sum/"
    }
}

def detect_platform(url: str) -> PlatformEnum:
    """
    Auto-detects platform from URL. Platforms without direct public submission URLs (e.g. GFG, HackerRank) fall under OTHER.
    """
    # 1) Clean URL to lowercase
    url_lower = url.lower().strip()
    
    # 2) Match platforms that support direct public submission URLs
    if "codeforces.com" in url_lower:
        return PlatformEnum.CODEFORCES
    elif "codechef.com" in url_lower:
        return PlatformEnum.CODECHEF
    elif "atcoder.jp" in url_lower:
        return PlatformEnum.ATCODER
    elif "leetcode.com" in url_lower:
        return PlatformEnum.LEETCODE
        
    # 3) All other platforms (GFG, HackerRank, CSES, SPOJ, etc.) fall under OTHER
    return PlatformEnum.OTHER

def validate_submission_url(url: str, platform: Optional[PlatformEnum] = None) -> Tuple[bool, PlatformEnum, Optional[str]]:
    """
    Validates submission URLs. For platforms with public submission links (Codeforces, CodeChef, AtCoder, LeetCode),
    it strictly enforces submission link patterns and rejects generic problem links.
    For all other platforms (GFG, HackerRank, etc. categorized as OTHER), it verifies general URL validity.
    Returns: (is_valid, detected_platform, error_message)
    """
    # 1) Check for empty URL
    if not url or not url.strip():
        return False, PlatformEnum.OTHER, "Submission URL is required."

    url = url.strip()

    # 2) Auto-detect platform from URL if not explicitly selected or if marked as other
    detected = detect_platform(url)
    target_platform = platform if platform and platform != PlatformEnum.OTHER else detected

    # 3) Handle OTHER category (GFG, HackerRank, CSES, etc. where sharable submission URLs are unavailable)
    if target_platform == PlatformEnum.OTHER:
        # Step A: Validate standard HTTP/HTTPS URL format
        if re.match(r"^https?://[^\s/$.?#].[^\s]*$", url):
            return True, PlatformEnum.OTHER, None
        return False, PlatformEnum.OTHER, "Invalid URL format. Please enter a valid http/https link."

    # 4) Fetch validation rule for platforms with verifiable submission URLs
    rule = PLATFORM_VALIDATION_RULES.get(target_platform)
    if not rule:
        return True, target_platform, None

    # 5) Check if user pasted a generic problem description URL
    if rule["generic_problem_regex"].search(url):
        return (
            False,
            target_platform,
            f"❌ That is a generic {rule['name']} problem link. Please provide your direct submission proof link (e.g., '{rule['example_valid']}')."
        )

    # 6) Check if URL matches the platform's valid submission pattern
    if rule["submission_regex"].search(url):
        return True, target_platform, None

    # 7) Return rejection if pattern does not match submission format
    return (
        False,
        target_platform,
        f"❌ Invalid {rule['name']} submission link format. Expected pattern like: '{rule['example_valid']}'."
    )
