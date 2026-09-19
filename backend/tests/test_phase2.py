import os
import sys
from datetime import datetime, timezone

# Allow direct execution from the backend directory, matching test_phase1.py.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.leetcode_sync import get_user_timezone, submission_datetime
from app.services.streak_engine import calculate_current_streak, local_date


def test_submission_timestamp_uses_utc_and_local_timezone():
    """A UTC submission near midnight belongs to the correct local calendar date."""
    submitted_at = submission_datetime("1727397000")
    assert submitted_at.tzinfo == timezone.utc
    assert local_date(submitted_at, "Asia/Kolkata").isoformat() == "2024-09-27"


def test_invalid_timezone_falls_back_to_utc():
    """Legacy profiles with an invalid timezone remain synchronizable."""
    assert get_user_timezone("not/a-real-zone").key == "UTC"


def test_naive_database_timestamp_is_treated_as_utc():
    """Older naive MongoDB timestamps are interpreted consistently as UTC."""
    value = datetime(2024, 9, 26, 23, 30)
    assert local_date(value, "Asia/Kolkata").isoformat() == "2024-09-27"


def test_current_streak_keeps_previous_completed_day_until_today_is_met():
    """Yesterday remains streak one; completing today extends it to two."""
    yesterday = datetime(2024, 9, 26).date()
    today = datetime(2024, 9, 27).date()
    solved_counts = {yesterday: {"problem-yesterday"}, today: set()}
    assert calculate_current_streak(solved_counts, today, 1) == 1
    solved_counts[today].add("problem-today")
    assert calculate_current_streak(solved_counts, today, 1) == 2


if __name__ == "__main__":
    test_submission_timestamp_uses_utc_and_local_timezone()
    test_invalid_timezone_falls_back_to_utc()
    test_naive_database_timestamp_is_treated_as_utc()
    test_current_streak_keeps_previous_completed_day_until_today_is_met()
    print("Phase 2 timezone regression tests passed.")
