import React, { useState, useEffect } from 'react';
import AuthView from './components/AuthView';
import Header from './components/Header';
import ProblemCRUD from './components/ProblemCRUD';
import ProfileModal from './components/ProfileModal';
import ValidatorPlayground from './components/ValidatorPlayground';
import { authApi, getAuthToken, removeAuthToken } from './api/client';

export default function App() {
  // 1) App Root State
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isValidatorOpen, setIsValidatorOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // 2) Toast Notification Helper
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 3) Session Check on Component Mount
  useEffect(() => {
    const verifySession = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Step A: Verify active session with backend API
        const statusRes = await authApi.isLoggedIn();
        if (statusRes && statusRes.is_logged_in && statusRes.user) {
          setUser(statusRes.user);
          setIsAuthenticated(true);
        } else {
          removeAuthToken();
          setIsAuthenticated(false);
        }
      } catch (e) {
        removeAuthToken();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifySession();

    // Step B: Listen for 401 unauthorized events
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setUser(null);
    };
    window.addEventListener('algopulse:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('algopulse:unauthorized', handleUnauthorized);
  }, []);

  // 4) Auth Handlers
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${userData.username}!`, 'success');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const handleAccountDeleted = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    setIsProfileOpen(false);
    showToast('Account deleted successfully', 'info');
  };

  // 5) Render Loading State
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe' }}>
        <p style={{ fontWeight: 600, letterSpacing: '1px' }}>INITIALIZING ALGOPULSE PHASE 1...</p>
      </div>
    );
  }

  // 6) Render Login / Register View if Unauthenticated
  if (!isAuthenticated) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // 7) Render Authenticated Phase 1 Dashboard
  return (
    <div style={{ padding: '0 16px 40px 16px' }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(18, 20, 32, 0.95)',
          border: toast.type === 'error' ? '1px solid #ef4444' : '1px solid rgba(0, 242, 254, 0.5)',
          color: '#f3f4f6',
          padding: '12px 18px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          fontSize: '0.88rem',
          fontWeight: 500
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <Header
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

      {/* Phase 1 Problem CRUD Workspace */}
      <main>
        <ProblemCRUD onNotify={showToast} />
      </main>

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onProfileUpdated={(updated) => {
          setUser(updated);
          showToast('Profile preferences updated!', 'success');
        }}
        onAccountDeleted={handleAccountDeleted}
      />

      {/* URL Validator Playground Modal */}
      <ValidatorPlayground
        isOpen={isValidatorOpen}
        onClose={() => setIsValidatorOpen(false)}
      />
    </div>
  );
}
