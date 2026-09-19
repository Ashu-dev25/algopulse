import React, { useEffect, useState } from "react";
import { Flame, Target } from "lucide-react";
import { streakApi } from "../api/client";

export default function StreakHUD({ refreshKey = 0 }) {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadOverview = async () => {
      try {
        const data = await streakApi.getOverview();
        if (active) {
          setOverview(data);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Streak unavailable");
      }
    };
    loadOverview();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (error) return <div className="streak-hud streak-error">{error}</div>;
  if (!overview)
    return <div className="streak-hud streak-loading">Loading streak...</div>;

  const todayTotal = overview.today_total ?? overview.today_solved;
  const progress = Math.min(
    100,
    Math.round((todayTotal / overview.daily_target) * 100),
  );
  return (
    <section className="streak-hud" aria-label="Daily streak overview">
      <div className="streak-metric">
        <Flame size={20} color="var(--amber)" />
        <div>
          <span className="streak-value">{overview.current_streak}</span>
          <span className="streak-label">day streak</span>
        </div>
      </div>
      <div className="streak-metric">
        <Target size={18} color="var(--cyan)" />
        <div>
          <span className="streak-value">
            {todayTotal}/{overview.daily_target}
          </span>
          <span className="streak-label">today</span>
        </div>
      </div>
      <div
        className="streak-progress"
        aria-label={`${overview.today_solved} of ${overview.daily_target} solved today`}
      >
        <div className="streak-progress-track">
          <div
            className="streak-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span>
          {overview.today_target_met
            ? "Target met"
            : `${overview.daily_target - todayTotal} to go`}
        </span>
      </div>
    </section>
  );
}
