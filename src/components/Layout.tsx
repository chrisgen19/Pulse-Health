"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Plus, TrendingUp, Sun, Moon, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

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
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await signOut();
    // If sign-out failed, the session cookie may still be set — don't navigate,
    // or middleware would just bounce the user back to the app.
    if (error) return;
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    // Sync React theme state with document head class
    const isLight = document.documentElement.classList.contains("light");
    const timer = setTimeout(() => {
      setTheme(isLight ? "light" : "dark");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

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

          {/* Theme Toggle Nav Item */}
          <button 
            onClick={toggleTheme} 
            className="sidebar-nav-item theme-toggle-sidebar"
          >
            {theme === "dark" ? (
              <>
                <Sun className="sidebar-nav-icon" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="sidebar-nav-icon" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Sign Out Nav Item */}
          <button onClick={handleSignOut} className="sidebar-nav-item">
            <LogOut className="sidebar-nav-icon" />
            <span>Sign out</span>
          </button>
        </nav>

        <button onClick={onAddClick} className="sidebar-add-btn glow-sleep">
          <Plus className="sidebar-add-icon" />
          <span>Log New Data</span>
        </button>
      </aside>

      {/* Main Section */}
      <div className="app-main-layout">
        {/* Mobile Header Bar */}
        <div className="mobile-header-bar">
          <div className="mobile-logo">
            <span className="logo-icon-sphere"></span>
            <span className="logo-text">PulseHealth</span>
          </div>
          <div className="mobile-header-actions">
            <button onClick={toggleTheme} className="theme-toggle-mobile-btn" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="theme-icon" /> : <Moon className="theme-icon" />}
            </button>
            <button onClick={handleSignOut} className="theme-toggle-mobile-btn" aria-label="Sign out">
              <LogOut className="theme-icon" />
            </button>
          </div>
        </div>

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
          background-color: var(--bg-primary);
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: var(--text-primary);
          overflow-x: hidden;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-app-gradient);
          width: 100%;
          transition: background 0.3s ease;
        }

        .desktop-sidebar {
          display: none;
        }

        /* Mobile Header Bar */
        .mobile-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: var(--bg-sidebar);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-bottom: 1px solid var(--border-color);
          width: 100%;
          box-sizing: border-box;
          z-index: 100;
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-logo .logo-icon-sphere {
          width: 10px;
          height: 10px;
          background: var(--color-sleep-gradient);
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
          display: inline-block;
        }

        .mobile-logo .logo-text {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        html.light .mobile-logo .logo-text {
          background: linear-gradient(135deg, #1e293b 0%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mobile-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .theme-toggle-mobile-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-button-secondary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .theme-toggle-mobile-btn:active {
          transform: scale(0.9);
        }

        .theme-icon {
          width: 18px;
          height: 18px;
        }

        .app-main-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 69px);
          position: relative;
          background-color: var(--bg-secondary);
          transition: background-color 0.3s ease;
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
          background: var(--bg-bottom-nav);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0 16px 12px 16px;
          z-index: 100;
          transition: background 0.3s ease;
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
          .app-container {
            flex-direction: row;
          }

          .desktop-sidebar {
            display: flex;
            flex-direction: column;
            width: 260px;
            background: var(--bg-sidebar);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border-right: 1px solid var(--border-color);
            padding: 30px 20px;
            height: 100vh;
            position: sticky;
            top: 0;
            z-index: 10;
            box-sizing: border-box;
            transition: background-color 0.3s ease;
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

          html.light .logo-text {
            background: linear-gradient(135deg, #1e293b 0%, #6366f1 100%);
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
            background: var(--bg-sidebar-hover);
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

          .app-main-layout {
            height: 100vh;
            overflow: hidden;
            min-height: auto;
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
