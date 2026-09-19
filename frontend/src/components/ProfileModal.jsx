import React, { useState } from 'react';
import { X, User, Settings, Trash2, Globe, Target } from 'lucide-react';
import { streakApi, usersApi } from '../api/client';

export default function ProfileModal({ isOpen, onClose, user, onProfileUpdated, onAccountDeleted, onActivityReset }) {
  // 1) Component local state
  const [lcHandle, setLcHandle] = useState(user?.lc_handle || '');
  const [dailyTarget, setDailyTarget] = useState(user?.daily_target || 2);
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Kolkata');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  // 2) Profile update handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // Step A: Call backend user profile update API
      const updated = await usersApi.updateProfile({
        lc_handle: lcHandle.trim() || null,
        daily_target: parseInt(dailyTarget, 10),
        timezone
      });

      // Step B: Notify parent and close modal
      onProfileUpdated(updated);
      onClose();
    } catch (err) {
      // Step C: Catch and show error
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // 3) Account delete handler
  const handleDeleteAccount = async () => {
    try {
      // Step A: Call backend user delete account API
      await usersApi.deleteAccount();
      // Step B: Notify parent to log out
      onAccountDeleted();
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
    }
  };

  const handleResetBeforeToday = async () => {
    setIsResetting(true);
    setError('');
    try {
      await streakApi.resetBeforeToday();
      setShowResetConfirm(false);
      onActivityReset?.();
    } catch (err) {
      setError(err.message || 'Failed to reset history.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '24px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe' }}>
              <User size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>User Profile CRUD</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.82rem', marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Read-Only Account Info */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Username</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#00f2fe' }}>{user?.username}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Email</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>

          {/* LeetCode Handle */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              LeetCode Handle
            </label>
            <input
              type="text"
              placeholder="e.g. johndoe_lc"
              value={lcHandle}
              onChange={(e) => setLcHandle(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Daily Goal N */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <Target size={14} color="#00f2fe" />
              <span>Daily Target (N Problems / Day)</span>
            </label>
            <input
              type="number"
              min={1}
              max={30}
              required
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Timezone */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <Globe size={14} color="#a855f7" />
              <span>Timezone</span>
            </label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={{ width: '100%' }}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC">UTC (GMT +0:00)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
            </select>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Updating...' : 'Save Settings'}
            </button>
          </div>
        </form>

        <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '20px', paddingTop: '16px' }}>
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              style={{ background: 'transparent', border: 'none', color: 'var(--amber)', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Start streak from today
            </button>
          ) : (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.8rem', color: '#fbbf24', marginBottom: '8px' }}>
                Delete all activity before today and recalculate the streak?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={handleResetBeforeToday} disabled={isResetting} className="btn-primary">
                  {isResetting ? 'Resetting...' : 'Start From Today'}
                </button>
                <button type="button" onClick={() => setShowResetConfirm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Account Section */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '20px', paddingTop: '16px' }}>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Trash2 size={14} />
              <span>Delete Account & Wipe Problem Data</span>
            </button>
          ) : (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.8rem', color: '#f87171', marginBottom: '8px' }}>
                ⚠️ Are you sure? This will permanently delete your account and all problem logs.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Yes, Permanently Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
