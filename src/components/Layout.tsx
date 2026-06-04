"use client";

import React from "react";
import { LayoutDashboard, Plus, TrendingUp } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: "dashboard" | "trends";
  setActiveTab: (tab: "dashboard" | "trends") => void;
  onAddClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onAddClick,
}) => {
  return (
    <div className="app-container">
      {/* Desktop Left Sidebar (Sticky) */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon-sphere"></span>
          <span className="logo-text">PulseHealth</span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`sidebar-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard className="sidebar-nav-icon" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab("trends")} 
            className={`sidebar-nav-item ${activeTab === "trends" ? "active" : ""}`}
          >
            <TrendingUp className="sidebar-nav-icon" />
            <span>Insights & Trends</span>
          </button>
        </nav>
        
        <button onClick={onAddClick} className="sidebar-add-btn glow-sleep">
          <Plus className="sidebar-add-icon" />
          <span>Log New Data</span>
        </button>
      </aside>

      {/* Main Section */}
      <div className="app-main-layout">
        {/* Main Content Area */}
        <main className="app-content-area">{children}</main>

        {/* Bottom Tab Navigation Bar (Mobile only) */}
        <nav className="bottom-nav">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            aria-label="Dashboard"
          >
            <LayoutDashboard className="nav-icon" />
            <span className="nav-label">Overview</span>
          </button>

          {/* Quick Log Floating Button */}
          <div className="add-btn-wrapper">
            <button
              onClick={onAddClick}
              className="add-nav-btn glow-sleep"
              aria-label="Quick Log"
            >
              <Plus className="add-icon" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab("trends")}
            className={`nav-item ${activeTab === "trends" ? "active" : ""}`}
            aria-label="Trends"
          >
            <TrendingUp className="nav-icon" />
            <span className="nav-label">Trends</span>
          </button>
        </nav>
      </div>

      <style jsx global>{`
        /* Global Page Base Setup */
        html, body {
          background-color: #030408;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: var(--text-primary);
          overflow-x: hidden;
        }

        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          background: radial-gradient(circle at 10% 20%, rgba(8, 12, 28, 1) 0%, rgba(3, 4, 8, 1) 90%);
          width: 100%;
        }

        .desktop-sidebar {
          display: none;
        }

        .app-main-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: relative;
          background-color: var(--bg-secondary);
        }

        /* Scrollable content container */
        .app-content-area {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 96px; /* space for nav bar on mobile */
          position: relative;
        }

        /* Bottom Navigation Bar (Mobile only) */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 84px;
          background: rgba(10, 15, 29, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0 16px 12px 16px;
          z-index: 100;
        }

        .nav-item {
          background: none;
          border: none;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 70px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .nav-icon {
          width: 24px;
          height: 24px;
          margin-bottom: 4px;
          transition: var(--transition-bounce);
        }

        .nav-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .nav-item.active {
          color: var(--color-sleep);
        }

        .nav-item.active .nav-icon {
          transform: translateY(-2px) scale(1.1);
          filter: drop-shadow(0 0 6px rgba(129, 140, 248, 0.5));
        }

        /* Floating quick add button */
        .add-btn-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
          margin-top: -30px;
        }

        .add-nav-btn {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: var(--color-sleep-gradient);
          border: none;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
          transition: var(--transition-bounce);
          position: absolute;
          z-index: 101;
        }

        .add-nav-btn:hover {
          transform: scale(1.08) rotate(90deg);
          box-shadow: 0 12px 24px rgba(99, 102, 241, 0.6);
        }

        .add-nav-btn:active {
          transform: scale(0.95) rotate(90deg);
        }

        .add-icon {
          width: 28px;
          height: 28px;
        }

        /* RESPONSIVE DESKTOP LAYOUT */
        @media (min-width: 768px) {
          .desktop-sidebar {
            display: flex;
            flex-direction: column;
            width: 260px;
            background: rgba(10, 15, 29, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-right: 1px solid var(--border-color);
            padding: 30px 20px;
            height: 100vh;
            position: sticky;
            top: 0;
            z-index: 10;
            box-sizing: border-box;
          }

          .sidebar-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 40px;
            padding-left: 8px;
          }

          .logo-icon-sphere {
            width: 14px;
            height: 14px;
            background: var(--color-sleep-gradient);
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
            display: inline-block;
          }

          .logo-text {
            font-size: 19px;
            font-weight: 800;
            color: var(--text-primary);
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
          }

          .sidebar-nav-item {
            display: flex;
            align-items: center;
            gap: 14px;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-align: left;
            transition: var(--transition-smooth);
            width: 100%;
          }

          .sidebar-nav-item:hover {
            background: rgba(255, 255, 255, 0.03);
            color: var(--text-primary);
          }

          .sidebar-nav-item.active {
            background: rgba(129, 140, 248, 0.1);
            color: var(--color-sleep);
          }

          .sidebar-nav-item.active .sidebar-nav-icon {
            filter: drop-shadow(0 0 4px rgba(129, 140, 248, 0.4));
          }

          .sidebar-nav-icon {
            width: 20px;
            height: 20px;
          }

          .sidebar-add-btn {
            background: var(--color-sleep-gradient);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 16px;
            font-size: 14px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
            transition: var(--transition-bounce);
            margin-top: auto;
            width: 100%;
            box-sizing: border-box;
          }

          .sidebar-add-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(99, 102, 241, 0.55);
          }

          .sidebar-add-btn:active {
            transform: translateY(0);
          }

          .sidebar-add-icon {
            width: 18px;
            height: 18px;
          }

          .app-content-area {
            padding: 40px;
            padding-bottom: 40px;
            max-width: 1280px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
          }

          .bottom-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
