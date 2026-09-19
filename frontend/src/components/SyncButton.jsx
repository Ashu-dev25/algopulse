import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { syncApi } from "../api/client";

export default function SyncButton({ user, onSynced }) {
  const [configured, setConfigured] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runSync = async (isAutomatic = false) => {
    setLoading(true);
    setError("");
    try {
      const result = await syncApi.syncLeetCode();
      setLastSyncedAt(result.last_synced_at);
      onSynced?.(result);
    } catch (err) {
      if (!isAutomatic || err.message) {
        setError(err.message || "LeetCode sync failed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadStatusAndSync = async () => {
      try {
        const status = await syncApi.getStatus();
        if (active) {
          setConfigured(status.configured);
          setLastSyncedAt(status.last_synced_at);
          if (status.configured) {
            await runSync(true);
          }
        }
      } catch (err) {
        if (active) setError(err.message || "Sync status unavailable");
      }
    };
    loadStatusAndSync();
    return () => {
      active = false;
    };
  }, [user?.lc_handle]);

  const handleSync = async () => {
    await runSync();
  };

  return (
    <div className="sync-control">
      <button
        className="btn-secondary"
        onClick={handleSync}
        disabled={!configured || loading}
        title={
          !configured
            ? "Add a LeetCode handle in Profile Settings"
            : "Sync recent LeetCode submissions"
        }
      >
        <RefreshCw size={15} className={loading ? "spin" : ""} />
        {loading ? "Syncing..." : "Sync LeetCode"}
      </button>
      <span className="sync-meta">
        {error ||
          (configured
            ? lastSyncedAt
              ? `Last sync ${new Date(lastSyncedAt).toLocaleString()}`
              : "Not synced yet"
            : "Solved activity only; add tried problems manually")}
      </span>
    </div>
  );
}
