import React from 'react';
import { Flame, User, Settings, LogOut } from 'lucide-react';

export default function Header({
  user,
  onOpenProfile,
  onLogout
}) {
  // 1) Render header with brand, user info, and single Add Submission action
  return (
    <header className="glass-panel" style={{ padding: '14px 24px', margin: '16px auto 20px auto', maxWidth: '1300px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      {/* Step A: Logo and Phase 1 Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #00f2fe 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)'
        }}>
          <Flame size={22} color="#08090e" strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #00f2fe, #f3f4f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AlgoPulse
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#00f2fe', letterSpacing: '0.5px', fontWeight: 600 }}>
            PHASE 1: AUTH & PROBLEM TRACKER
          </p>
        </div>
      </div>

      {/* Step B: User Profile Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(12, 14, 22, 0.8)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
        <User size={15} color="#00f2fe" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
          {user?.username}
        </span>
        <span style={{ fontSize: '0.72rem', background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
          Goal: {user?.daily_target || 2} / day
        </span>
      </div>

      {/* Step C: Action Buttons (Profile + Logout) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Profile Settings */}
        <button onClick={onOpenProfile} className="btn-secondary" style={{ padding: '8px 10px' }} title="Profile Settings">
          <Settings size={17} color="var(--text-muted)" />
        </button>

        {/* Logout */}
        <button onClick={onLogout} className="btn-secondary" style={{ padding: '8px 10px' }} title="Logout">
          <LogOut size={17} color="#ef4444" />
        </button>
      </div>
    </header>
  );
}
