import React, { useState } from 'react';
import { Flame, Lock, User, Mail, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { authApi, setAuthToken } from '../api/client';

export default function AuthView({ onAuthSuccess }) {
  // 1) Component local state
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lcHandle, setLcHandle] = useState('');
  const [dailyTarget, setDailyTarget] = useState(2);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2) Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      // Step A: Register or Login based on toggle
      if (isRegister) {
        res = await authApi.register({
          username: username.trim(),
          email: email.trim(),
          password,
          lc_handle: lcHandle.trim() || undefined,
          daily_target: parseInt(dailyTarget, 10),
          timezone
        });
      } else {
        res = await authApi.login({
          username_or_email: username.trim(),
          password
        });
      }

      // Step B: Save JWT token and notify parent
      if (res && res.access_token) {
        setAuthToken(res.access_token);
        onAuthSuccess(res.user);
      }
    } catch (err) {
      // Step C: Catch and display error
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel-glow" style={{ width: '100%', maxWidth: '440px', padding: '36px 30px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #a855f7 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0, 242, 254, 0.4)',
            marginBottom: '12px'
          }}>
            <Flame size={28} color="#08090e" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f3f4f6' }}>
            {isRegister ? 'Create AlgoPulse Account' : 'AlgoPulse Sign In'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isRegister ? 'Phase 1: User & Problem Tracker Testing Client' : 'Sign in to access your problems workspace and validator'}
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.82rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Username {isRegister ? '' : 'or Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="text"
                required
                placeholder={isRegister ? 'coder123' : 'username or email'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* Email (If Registering) */}
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: '36px' }}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
              />
            </div>
          </div>

          {/* Extra Preferences (If Registering) */}
          {isRegister && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  LeetCode Handle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="lc_user"
                  value={lcHandle}
                  onChange={(e) => setLcHandle(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Daily Goal N
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px', padding: '10px' }}>
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                style={{ background: 'transparent', border: 'none', color: '#00f2fe', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                style={{ background: 'transparent', border: 'none', color: '#00f2fe', fontWeight: 600, cursor: 'pointer' }}
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
