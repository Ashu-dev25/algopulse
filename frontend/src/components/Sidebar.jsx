import React from "react";
import { Archive, Home, X } from "lucide-react";

export default function Sidebar({ isOpen, activeView, onNavigate, onClose }) {
  if (!isOpen) return null;

  const navigate = (view) => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      <button
        className="sidebar-backdrop"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="side-menu" aria-label="Main navigation">
        <div className="side-menu-header">
          <div>
            <span className="label">Workspace</span>
            <h2>AlgoPulse</h2>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close menu">
            <X size={17} />
          </button>
        </div>
        <nav className="side-menu-nav">
          <button
            className={
              activeView === "today"
                ? "side-menu-link active"
                : "side-menu-link"
            }
            onClick={() => navigate("today")}
          >
            <Home size={17} />
            Today's activity
          </button>
          <button
            className={
              activeView === "tried"
                ? "side-menu-link active"
                : "side-menu-link"
            }
            onClick={() => navigate("tried")}
          >
            <Archive size={17} />
            Tried problems
          </button>
        </nav>
        <p className="side-menu-note">
          Solved submissions stay in today's activity. Tried problems remain
          available for revision.
        </p>
      </aside>
    </>
  );
}
