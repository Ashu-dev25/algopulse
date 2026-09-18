import React from 'react';
import { Flame, User, Settings, LogOut } from 'lucide-react';

export default function Header({ user, onOpenProfile, onLogout }) {
  // 1) Render sticky header with brand, user badge, and action icons
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(7, 8, 16, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-faint)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: '60px',
      maxWidth: '1320px', margin: '0 auto',
    }}>

      {/* Step A: Brand logo and title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--cyan) 0%, var(--purple) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--glow-cyan)',
        }}>
          <Flame size={20} color="#070810" strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em',
            background: 'linear-gradient(90deg, var(--cyan), #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', lineHeight: 1.2,
          }}>
            AlgoPulse
          </h1>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 500 }}>
            PROBLEM TRACKER
          </p>
        </div>
      </div>

      {/* Step B: User info + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* User badge pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          padding: '6px 14px', borderRadius: '20px',
        }}>
          <User size={13} color="var(--cyan)" />
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.username}
          </span>
          <span style={{
            fontSize: '0.69rem', fontWeight: 600, letterSpacing: '0.02em',
            background: 'rgba(0, 229, 255, 0.1)', color: 'var(--cyan)',
            padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(0,229,255,0.2)',
          }}>
            {user?.daily_target || 2}/day
          </span>
        </div>

        {/* Settings icon button */}
        <button onClick={onOpenProfile} className="btn-icon" title="Profile & Settings">
          <Settings size={16} />
        </button>

        {/* Logout icon button */}
        <button
          onClick={onLogout}
          className="btn-icon"
          title="Logout"
          style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
