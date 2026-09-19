import React, { useState, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import AuthView from "./components/AuthView";
import Header from "./components/Header";
import ProblemCRUD from "./components/ProblemCRUD";
import ProfileModal from "./components/ProfileModal";
import StreakHUD from "./components/StreakHUD";
import SyncButton from "./components/SyncButton";
import Sidebar from "./components/Sidebar";
import StreakCalendar from "./components/StreakCalendar";
import { authApi, getAuthToken, removeAuthToken } from "./api/client";

export default function App() {
  // 1) App Root State
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [problemRefreshKey, setProblemRefreshKey] = useState(0);
  const [streakRefreshKey, setStreakRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState("today");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2) Toast Notification Helper
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

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
    window.addEventListener("algopulse:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("algopulse:unauthorized", handleUnauthorized);
  }, []);

  // 4) Auth Handlers
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${userData.username}!`, "success");
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
    showToast("Logged out successfully", "info");
  };

  const handleAccountDeleted = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    setIsProfileOpen(false);
    showToast("Account deleted successfully", "info");
  };

  // 5) Render Loading State
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#00f2fe",
        }}
      >
        <p style={{ fontWeight: 600, letterSpacing: "1px" }}>
          INITIALIZING ALGOPULSE...
        </p>
      </div>
    );
  }

  // 6) Render Login / Register View if Unauthenticated
  if (!isAuthenticated) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // 7) Render authenticated dashboard
  return (
    <div style={{ padding: "0 16px 40px 16px" }}>
      {/* Toast Notification */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* Header */}
      <button
        className="menu-trigger btn-icon"
        onClick={() => setIsSidebarOpen(true)}
        title="Open navigation"
      >
        <Menu size={18} />
      </button>
      <Header
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
      />

      {/* Problem CRUD workspace with Phase 2 sync controls */}
      <main>
        {activeView === "today" && (
          <div className="phase-two-toolbar">
            <StreakHUD refreshKey={streakRefreshKey} />
            <SyncButton
              user={user}
              onSynced={(result) => {
                setProblemRefreshKey((value) => value + 1);
                setStreakRefreshKey((value) => value + 1);
                showToast(
                  `${result.synced_count} new, ${result.updated_count} updated from LeetCode.`,
                  "success",
                );
              }}
            />
          </div>
        )}
        <ProblemCRUD
          onNotify={showToast}
          onProblemDeleted={() => setStreakRefreshKey((value) => value + 1)}
          refreshKey={problemRefreshKey}
          view={activeView}
        />
        {activeView === "today" && (
          <StreakCalendar refreshKey={streakRefreshKey} />
        )}
      </main>

      <Sidebar
        isOpen={isSidebarOpen}
        activeView={activeView}
        onNavigate={setActiveView}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onProfileUpdated={(updated) => {
          setUser(updated);
          showToast("Profile updated!", "success");
        }}
        onAccountDeleted={handleAccountDeleted}
        onActivityReset={() => {
          setProblemRefreshKey((value) => value + 1);
          setStreakRefreshKey((value) => value + 1);
          showToast("History reset. Streak now starts from today.", "info");
        }}
      />
    </div>
  );
}
