import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { streakApi } from "../api/client";

export default function StreakCalendar({ refreshKey = 0, days = 365 }) {
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadActivity = async () => {
      try {
        const response = await streakApi.getHeatmap(days);
        if (active) {
          setActivity(response.days || []);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Activity history unavailable");
      }
    };
    loadActivity();
    return () => {
      active = false;
    };
  }, [days, refreshKey]);

  return (
    <section
      className="activity-calendar"
      aria-label="Solved and tried activity history"
    >
      <div className="activity-calendar-header">
        <div>
          <span className="label">Consistency</span>
          <h2>Daily activity</h2>
          <p className="activity-calendar-source">
            Based only on AlgoPulse activity
          </p>
        </div>
        <CalendarDays size={19} color="var(--cyan)" />
      </div>
      {error ? (
        <p className="activity-calendar-error">{error}</p>
      ) : (
        <div className="activity-grid">
          {activity.map((day) => (
            <div
              key={day.date}
              className={`activity-cell ${day.target_met ? "target-met" : ""}`}
              data-count={day.total_count}
              title={`${day.date}: ${day.total_count} total (${day.solved_count} solved, ${day.tried_count} tried)${day.target_met ? " - target met" : ""}`}
            />
          ))}
        </div>
      )}
      <div className="activity-calendar-legend">
        <span>Less</span>
        <i className="activity-cell" />
        <i className="activity-cell activity-low" />
        <i className="activity-cell activity-medium" />
        <i className="activity-cell activity-high" />
        <span>More</span>
      </div>
    </section>
  );
}
