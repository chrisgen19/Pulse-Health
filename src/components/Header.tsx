"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOffsetDateString } from "../context/HealthContext";

interface HeaderProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedDate, setSelectedDate }) => {
  // Format the date label
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "";
    
    const todayStr = getOffsetDateString(0);
    const yesterdayStr = getOffsetDateString(1);

    if (dateStr === todayStr) return "Today";
    if (dateStr === yesterdayStr) return "Yesterday";

    // Split to avoid timezone shift
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    
    const date = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePrevDay = () => {
    // Determine offset of current date or parse it
    const parts = selectedDate.split("-");
    if (parts.length !== 3) return;
    const date = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    date.setDate(date.getDate() - 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDay = () => {
    const parts = selectedDate.split("-");
    if (parts.length !== 3) return;
    const date = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    
    // Don't allow navigating into the future
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date >= today) return;

    date.setDate(date.getDate() + 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  // Determine if next button should be disabled (cannot go to future)
  const isLatestDay = selectedDate === getOffsetDateString(0);

  return (
    <header className="header-container">
      <button onClick={handlePrevDay} className="arrow-btn" aria-label="Previous day">
        <ChevronLeft className="arrow-icon" />
      </button>

      <div className="date-info">
        <h1 className="date-title">{formatDateLabel(selectedDate)}</h1>
        <span className="swipe-hint">← Swipe to change date →</span>
      </div>

      <button
        onClick={handleNextDay}
        className={`arrow-btn ${isLatestDay ? "disabled" : ""}`}
        disabled={isLatestDay}
        aria-label="Next day"
      >
        <ChevronRight className="arrow-icon" />
      </button>

      <style jsx>{`
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 20px 12px 20px;
          background: linear-gradient(to bottom, var(--bg-secondary) 70%, rgba(14, 19, 34, 0) 100%);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .date-info {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .date-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .swipe-hint {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 3px;
        }

        .arrow-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .arrow-btn:active:not(.disabled) {
          background: rgba(255, 255, 255, 0.08);
          transform: scale(0.95);
        }

        .arrow-btn.disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .arrow-icon {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </header>
  );
};
