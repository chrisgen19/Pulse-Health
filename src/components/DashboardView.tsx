"use client";

import React, { useState } from "react";
import { useHealth, FoodLog, HeadacheLog, ArrhythmiaLog } from "../context/HealthContext";
import { useSwipe } from "../hooks/useSwipe";
import { Moon, Utensils, Brain, HeartPulse, Trash2 } from "lucide-react";

interface DashboardViewProps {
  onLogSleep: () => void;
  onLogFood: () => void;
  onLogHeadache: () => void;
  onLogArrhythmia: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onLogSleep,
  onLogFood,
  onLogHeadache,
  onLogArrhythmia,
}) => {
  const {
    logs,
    selectedDate,
    setSelectedDate,
    deleteFood,
    deleteHeadache,
    deleteArrhythmia,
    updateMood,
    getOffsetDateString,
  } = useHealth();

  const currentLog = logs[selectedDate] || {
    date: selectedDate,
    food: [],
    headaches: [],
    arrhythmias: [],
  };

  // Swipe gesture configuration for switching days
  const handleSwipeLeft = () => {
    if (selectedDate === getOffsetDateString(0)) return; // Already at today
    const parts = selectedDate.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateString(d));
  };

  const handleSwipeRight = () => {
    const parts = selectedDate.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateString(d));
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const formatDateString = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Calculations for Sleep Progress Ring
  const SLEEP_TARGET = 8; // 8 hours
  const sleepDuration = currentLog.sleep?.duration || 0;
  const sleepProgress = Math.min(100, (sleepDuration / SLEEP_TARGET) * 100);
  const sleepQuality = currentLog.sleep?.quality || 0;

  // Emojis for Mood
  const moodEmojis = [
    { score: 1, emoji: "😢", label: "Bad" },
    { score: 2, emoji: "😕", label: "Poor" },
    { score: 3, emoji: "😐", label: "Okay" },
    { score: 4, emoji: "🙂", label: "Good" },
    { score: 5, emoji: "😄", label: "Great" },
  ];

  return (
    <div {...swipeHandlers} className="dashboard-wrapper">
      
      {/* 1. OVERVIEW CIRCULAR RING CHART */}
      <section className="dashboard-section">
        <div className="glass-card overview-card">
          <div className="overview-header">
            <h3>Daily Summary</h3>
            {currentLog.mood ? (
              <span className="mood-badge-status glow-mood">
                Mood: {moodEmojis.find((m) => m.score === currentLog.mood)?.label}
              </span>
            ) : (
              <span className="mood-badge-status">Mood: --</span>
            )}
          </div>

          <div className="overview-content">
            <div className="rings-container">
              <div className="sleep-ring-wrapper">
                <svg viewBox="0 0 100 100" className="radial-sleep-donut glow-sleep">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8"/>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="var(--color-sleep)" 
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * sleepProgress) / 100}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.6s ease-in-out" }}
                  />
                </svg>
                <div className="ring-content-display">
                  <span className="ring-val">{sleepDuration > 0 ? `${sleepDuration}h` : "--"}</span>
                  <span className="ring-lbl">Sleep</span>
                </div>
              </div>

              <div className="overview-stats-details">
                <div className="stat-row">
                  <span className="stat-dot sleep-dot"></span>
                  <div>
                    <span className="stat-label">Sleep Target:</span>
                    <p className="stat-value">{sleepDuration} / {SLEEP_TARGET} hrs</p>
                  </div>
                </div>
                <div className="stat-row">
                  <span className="stat-dot quality-dot"></span>
                  <div>
                    <span className="stat-label">Sleep Quality:</span>
                    <p className="stat-value">
                      {sleepQuality > 0 ? "⭐".repeat(sleepQuality) : "Not rated"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overview-divider"></div>

            <div className="overview-mood-picker">
              <h4>How do you feel today?</h4>
              <div className="mood-emojis-container">
                {moodEmojis.map((item) => (
                  <button
                    key={item.score}
                    onClick={() => updateMood(selectedDate, item.score)}
                    className={`mood-emoji-btn ${currentLog.mood === item.score ? "active" : ""}`}
                  >
                    <span className="mood-emoji-char">{item.emoji}</span>
                    <span className="mood-emoji-lbl">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SLEEP TRACKER PANEL */}
      <section className="dashboard-section">
        <div className="glass-card sleep-panel">
          <div className="card-header">
            <div className="header-left">
              <div className="metric-icon sleep-icon-bg">
                <Moon className="svg-icon sleep-color" />
              </div>
              <div>
                <h4>Sleep Analysis</h4>
                <span className="card-sub">Daily quality & restorative sleep</span>
              </div>
            </div>
            <div className="card-header-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {currentLog.sleep ? (
                <span className="sleep-quality-tag">
                  {"⭐".repeat(currentLog.sleep.quality)}
                </span>
              ) : (
                <span className="not-logged-tag" style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Not Logged</span>
              )}
              <button
                onClick={onLogSleep}
                className="btn-add-shortcut"
                style={{
                  color: "var(--color-sleep)",
                  background: "rgba(129, 140, 248, 0.1)",
                  border: "1px solid rgba(129, 140, 248, 0.25)"
                }}
                aria-label="Log sleep"
              >
                {currentLog.sleep ? "Edit" : "+ Add"}
              </button>
            </div>
          </div>

          <div className="sleep-body">
            {currentLog.sleep ? (
              <div className="sleep-metrics-display">
                <div className="sleep-stat">
                  <span className="sleep-stat-label">Duration</span>
                  <span className="sleep-stat-val glow-sleep">{currentLog.sleep.duration} hrs</span>
                </div>
                <div className="sleep-stat">
                  <span className="sleep-stat-label">Rating</span>
                  <span className="sleep-stat-val">
                    {currentLog.sleep.quality === 5 ? "Excellent" :
                     currentLog.sleep.quality === 4 ? "Good" :
                     currentLog.sleep.quality === 3 ? "Fair" :
                     currentLog.sleep.quality === 2 ? "Poor" : "Very Poor"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty-diet-container">
                <p className="empty-message">No sleep record logged for today.</p>
                <button
                  onClick={onLogSleep}
                  className="btn-log-food-center"
                  style={{
                    background: "var(--color-sleep-gradient)",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)"
                  }}
                >
                  + Log Sleep
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. DIET TIMELINE */}
      <section className="dashboard-section">
        <div className="glass-card diet-panel">
          <div className="card-header">
            <div className="header-left">
              <div className="metric-icon food-icon-bg">
                <Utensils className="svg-icon food-color" />
              </div>
              <div>
                <h4>Diet & Food Log</h4>
                <span className="card-sub">Meal tracking timeline</span>
              </div>
            </div>
            <div className="card-header-actions">
              <span className="calories-total glow-food">
                {currentLog.food.reduce((sum, item) => sum + (item.calories || 0), 0)} kcal
              </span>
              <button onClick={onLogFood} className="btn-add-shortcut" aria-label="Log new meal">
                + Add
              </button>
            </div>
          </div>

          <div className="diet-body">
            {currentLog.food.length === 0 ? (
              <div className="empty-diet-container">
                <p className="empty-message">No meals tracked for today.</p>
                <button onClick={onLogFood} className="btn-log-food-center food-btn">
                  + Log Food / Meal
                </button>
              </div>
            ) : (
              <div className="food-timeline">
                {currentLog.food.map((item) => (
                  <SwipeableFoodItem
                    key={item.id}
                    item={item}
                    onDelete={() => deleteFood(selectedDate, item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. SYMPTOM MONITORING: HEADACHE & ARRHYTHMIA */}
      <section className="dashboard-section symptoms-section">
        
        {/* Headache Card */}
        <div className={`glass-card symptom-card headache-symptom ${currentLog.headaches && currentLog.headaches.length > 0 ? "active-episode" : ""}`}>
          <div className="card-header">
            <div className="header-left">
              <div className="metric-icon headache-icon-bg">
                <Brain className="svg-icon headache-color" />
              </div>
              <div>
                <h4>Headache Tracker</h4>
                <span className="card-sub">Episodes & triggers</span>
              </div>
            </div>
            <div className="card-header-actions">
              {currentLog.headaches && currentLog.headaches.length > 0 && (
                <span className="calories-total glow-headache" style={{ color: "var(--color-headache)", background: "rgba(251, 146, 60, 0.1)", fontSize: "11px", fontWeight: "600", padding: "4px 8px", borderRadius: "8px" }}>
                  Max: {Math.max(...currentLog.headaches.map(h => h.severity))}/10
                </span>
              )}
              <button onClick={onLogHeadache} className="btn-add-shortcut" style={{ color: "var(--color-headache)", background: "rgba(251, 146, 60, 0.1)", border: "1px solid rgba(251, 146, 60, 0.25)" }} aria-label="Log new headache">
                + Add
              </button>
            </div>
          </div>

          <div className="symptom-body">
            {currentLog.headaches && currentLog.headaches.length > 0 ? (
              <div className="food-timeline" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                {currentLog.headaches.map((item) => (
                  <SwipeableHeadacheItem
                    key={item.id}
                    item={item}
                    onDelete={() => deleteHeadache(selectedDate, item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-diet-container">
                <p className="empty-message">No headaches logged.</p>
                <button onClick={onLogHeadache} className="btn-log-food-center" style={{ background: "var(--color-headache-gradient)", boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)" }}>
                  + Log Headache
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Arrhythmia Card */}
        <div className={`glass-card symptom-card arrhythmia-symptom ${currentLog.arrhythmias && currentLog.arrhythmias.length > 0 ? "active-episode animate-glow" : ""}`}>
          
          {/* heart rate animation behind card if active */}
          {currentLog.arrhythmias && currentLog.arrhythmias.length > 0 && (
            <div className="heart-wave-bg">
              <svg viewBox="0 0 200 60" className="heart-wave-svg">
                <path
                  d="M0,30 L60,30 L65,15 L70,45 L73,30 L95,30 L99,5 L103,55 L108,30 L120,30 L125,25 L129,35 L132,30 L200,30"
                  fill="none"
                  stroke="rgba(244, 63, 94, 0.25)"
                  strokeWidth="2.5"
                  className="pulse-path"
                />
              </svg>
            </div>
          )}
          
          <div className="card-header">
            <div className="header-left">
              <div className="metric-icon arrhythmia-icon-bg">
                <HeartPulse className={`svg-icon arrhythmia-color ${currentLog.arrhythmias && currentLog.arrhythmias.length > 0 ? "pulse-icon" : ""}`} />
              </div>
              <div>
                <h4>Arrhythmia Tracker</h4>
                <span className="card-sub">ECG & Palpitation logs</span>
              </div>
            </div>
            <div className="card-header-actions">
              {currentLog.arrhythmias && currentLog.arrhythmias.length > 0 && (
                <span className="calories-total glow-arrhythmia" style={{ color: "var(--color-arrhythmia)", background: "rgba(244, 63, 94, 0.1)", fontSize: "11px", fontWeight: "600", padding: "4px 8px", borderRadius: "8px" }}>
                  Max: {Math.max(...currentLog.arrhythmias.map(a => a.bpm))} BPM
                </span>
              )}
              <button onClick={onLogArrhythmia} className="btn-add-shortcut" style={{ color: "var(--color-arrhythmia)", background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.25)" }} aria-label="Log new arrhythmia">
                + Add
              </button>
            </div>
          </div>

          <div className="symptom-body">
            {currentLog.arrhythmias && currentLog.arrhythmias.length > 0 ? (
              <div className="food-timeline" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                {currentLog.arrhythmias.map((item) => (
                  <SwipeableArrhythmiaItem
                    key={item.id}
                    item={item}
                    onDelete={() => deleteArrhythmia(selectedDate, item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-diet-container">
                <p className="empty-message">No episodes logged.</p>
                <button onClick={onLogArrhythmia} className="btn-log-food-center" style={{ background: "var(--color-arrhythmia-gradient)", boxShadow: "0 4px 12px rgba(244, 63, 94, 0.3)" }}>
                  + Log Arrhythmia
                </button>
              </div>
            )}
          </div>
        </div>

      </section>

      <style jsx>{`
        .dashboard-wrapper {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 10px 20px 20px 20px;
          min-height: 100%;
        }

        @media (min-width: 768px) {
          .dashboard-wrapper {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-section:first-child {
            grid-column: span 2;
          }
        }

        @media (min-width: 1024px) {
          .dashboard-wrapper {
            grid-template-columns: repeat(3, 1fr);
          }
          .dashboard-section:first-child {
            grid-column: span 3;
          }
        }

        .dashboard-section {
          width: 100%;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          margin-bottom: 12px;
        }

        .card-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-add-shortcut {
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.25);
          color: var(--color-food);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-add-shortcut:active {
          transform: scale(0.95);
        }

        .header-left {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .metric-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sleep-icon-bg { background: rgba(129, 140, 248, 0.12); }
        .food-icon-bg { background: rgba(52, 211, 153, 0.12); }
        .headache-icon-bg { background: rgba(251, 146, 60, 0.12); }
        .arrhythmia-icon-bg { background: rgba(244, 63, 94, 0.12); }

        .sleep-color { color: var(--color-sleep); }
        .food-color { color: var(--color-food); }
        .headache-color { color: var(--color-headache); }
        .arrhythmia-color { color: var(--color-arrhythmia); }

        h3, h4 {
          font-weight: 600;
          color: var(--text-primary);
        }

        h3 { font-size: 17px; }
        h4 { font-size: 15px; }

        .card-sub {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .empty-message {
          font-size: 13px;
          color: var(--text-secondary);
          text-align: center;
          padding: 6px 0;
        }

        .empty-diet-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
        }

        .btn-log-food-center {
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .food-btn {
          background: var(--color-food-gradient);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-log-food-center:active {
          transform: scale(0.96);
        }

        /* 1. Overview Progress Card styling */
        .overview-card {
          padding: 22px;
        }

        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .mood-badge-status {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-mood);
          background: rgba(45, 212, 191, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .overview-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .overview-divider {
          height: 1px;
          background: var(--border-color);
          width: 100%;
        }

        .overview-mood-picker {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .overview-mood-picker h4 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0;
        }

        .rings-container {
          display: flex;
          align-items: center;
          gap: 20px;
          justify-content: space-around;
        }

        @media (min-width: 768px) {
          .overview-content {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 40px;
          }

          .rings-container {
            flex: 1.2;
            justify-content: flex-start;
            gap: 30px;
          }

          .overview-divider {
            width: 1px;
            height: 80px;
            background: var(--border-color);
          }

          .overview-mood-picker {
            flex: 1.8;
          }
        }

        .sleep-ring-wrapper {
          position: relative;
          width: 85px;
          height: 85px;
        }

        .radial-sleep-donut {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .ring-content-display {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .ring-val {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .ring-lbl {
          font-size: 9px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .overview-stats-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .sleep-dot { background-color: var(--color-sleep); }
        .quality-dot { background-color: #fbbf24; }

        .stat-label {
          font-size: 11px;
          color: var(--text-secondary);
          display: block;
        }

        .stat-value {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Sleep body styling */
        .sleep-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 4px;
        }

        .sleep-quality-tag {
          font-size: 14px;
        }

        .not-logged-tag {
          font-size: 11px;
          padding: 4px 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-secondary);
        }

        .sleep-metrics-display {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 14px;
        }

        .sleep-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sleep-stat-label {
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .sleep-stat-val {
          font-size: 18px;
          font-weight: 700;
        }

        .sleep-quick-picker {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid var(--border-color);
          padding-top: 14px;
        }

        .sleep-quick-picker label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .sleep-slider-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sleep-slider {
          flex: 1;
          accent-color: var(--color-sleep);
          height: 6px;
          border-radius: 3px;
          outline: none;
        }

        .slider-label-val {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-sleep);
          width: 55px;
          text-align: right;
        }

        .sleep-quality-pickers {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }

        .sleep-quality-pickers span {
          color: var(--text-secondary);
        }

        .quality-buttons {
          display: flex;
          gap: 6px;
        }

        .quality-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: rgba(255,255,255,0.02);
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .quality-btn.active {
          background: var(--color-sleep-gradient);
          color: white;
          border: none;
        }

        /* Food list container & timeline */
        .calories-total {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-food);
          background: rgba(52, 211, 153, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .diet-body {
          margin-top: 8px;
        }

        .food-timeline {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Symptom card styles */
        .symptoms-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .symptom-card {
          position: relative;
          overflow: hidden;
        }

        .symptom-card.active-episode {
          border-color: rgba(249, 115, 22, 0.25);
          box-shadow: 0 10px 30px -10px rgba(249, 115, 22, 0.15);
        }

        .arrhythmia-symptom.active-episode {
          border-color: rgba(244, 63, 94, 0.25);
          box-shadow: 0 10px 30px -10px rgba(244, 63, 94, 0.2);
        }

        .severity-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 8px;
          text-transform: uppercase;
        }

        .severity-high {
          background: rgba(251, 146, 60, 0.12);
          color: var(--color-headache);
          border: 1px solid rgba(251, 146, 60, 0.2);
        }

        .severity-severe {
          background: rgba(244, 63, 94, 0.12);
          color: var(--color-arrhythmia);
          border: 1px solid rgba(244, 63, 94, 0.2);
        }

        .symptom-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }

        .symptom-metrics {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .symptom-triggers-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
        }

        .triggers-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .trigger-tag {
          font-size: 11px;
          font-weight: 500;
          background: rgba(251, 146, 60, 0.08);
          color: var(--color-headache);
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid rgba(251, 146, 60, 0.15);
        }

        .trigger-tag.red-tag {
          background: rgba(244, 63, 94, 0.08);
          color: var(--color-arrhythmia);
          border: 1px solid rgba(244, 63, 94, 0.15);
        }

        .symptom-notes {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.5;
          padding: 8px 12px;
          border-left: 2.5px solid var(--border-color);
          background: rgba(255,255,255,0.01);
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }

        .btn-edit-symptom {
          background: transparent;
          border: 1px solid rgba(251, 146, 60, 0.25);
          color: var(--color-headache);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          align-self: flex-start;
          transition: var(--transition-smooth);
        }

        .btn-edit-symptom:active {
          transform: scale(0.97);
        }

        .arrhythmia-edit-btn {
          border-color: rgba(244, 63, 94, 0.25);
          color: var(--color-arrhythmia);
        }

        .symptom-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
        }

        .btn-log-symptom {
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .headache-btn {
          background: var(--color-headache-gradient);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }

        .arrhythmia-btn {
          background: var(--color-arrhythmia-gradient);
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
        }

        .btn-log-symptom:active {
          transform: scale(0.96);
        }

        /* heart rhythm anim vector */
        .heart-wave-bg {
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          height: 60px;
          pointer-events: none;
          z-index: 0;
        }

        .heart-wave-svg {
          width: 100%;
          height: 100%;
        }

        @keyframes drawRhythm {
          0% {
            stroke-dashoffset: 600;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .pulse-path {
          stroke-dasharray: 600;
          animation: drawRhythm 4s infinite linear;
        }

        /* Mood section emojis */
        .mood-tag {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-mood);
          background: rgba(45, 212, 191, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
        }

        .mood-emojis-container {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-top: 10px;
        }

        .mood-emoji-btn {
          background: transparent;
          border: 1px solid transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 8px;
          border-radius: 16px;
          flex: 1;
          transition: var(--transition-bounce);
        }

        .mood-emoji-char {
          font-size: 26px;
          transition: var(--transition-bounce);
        }

        .mood-emoji-lbl {
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .mood-emoji-btn.active {
          background: rgba(45, 212, 191, 0.08);
          border: 1px solid rgba(45, 212, 191, 0.2);
        }

        .mood-emoji-btn.active .mood-emoji-char {
          transform: scale(1.22);
          filter: drop-shadow(0 0 5px rgba(45, 212, 191, 0.5));
        }

        .mood-emoji-btn.active .mood-emoji-lbl {
          color: var(--color-mood);
          font-weight: 600;
        }

        .mood-emoji-btn:active {
          transform: scale(0.9);
        }
      `}</style>
    </div>
  );
};

/* Swipeable Food Item sub-component */
interface SwipeableFoodItemProps {
  item: FoodLog;
  onDelete: () => void;
}

const SwipeableFoodItem: React.FC<SwipeableFoodItemProps> = ({ item, onDelete }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  const dragThreshold = -70; // swipe 70px left to reveal delete

  const onTouchStart = (e: React.TouchEvent) => {
    setStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const diff = e.targetTouches[0].clientX - startX;
    
    if (diff < 0) {
      setCurrentX(isSwipedOpen ? dragThreshold + diff : diff);
    } else if (diff > 0 && isSwipedOpen) {
      setCurrentX(dragThreshold + diff);
    }
  };

  const onTouchEnd = () => {
    if (currentX < dragThreshold / 1.5) {
      setIsSwipedOpen(true);
      setCurrentX(dragThreshold);
    } else {
      setIsSwipedOpen(false);
      setCurrentX(0);
    }
  };

  const mealColors = {
    breakfast: "rgba(251, 191, 36, 0.12)",
    lunch: "rgba(16, 185, 129, 0.12)",
    dinner: "rgba(99, 102, 241, 0.12)",
    snack: "rgba(244, 114, 182, 0.12)",
  };

  const mealLabels = {
    breakfast: "B",
    lunch: "L",
    dinner: "D",
    snack: "S",
  };

  return (
    <div className="food-swipe-container">
      {/* Delete button (revealed behind card) */}
      <button onClick={onDelete} className="food-delete-underlay">
        <Trash2 className="delete-icon" />
      </button>

      {/* Foreground card that swipes */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="food-item-card swipe-transition"
        style={{ transform: `translateX(${Math.min(0, Math.max(-70, currentX))}px)` }}
      >
        <div className="food-item-left">
          <div className="meal-badge" style={{ backgroundColor: mealColors[item.mealType] }}>
            {mealLabels[item.mealType]}
          </div>
          <div className="food-details">
            <span className="food-name">{item.name}</span>
            <span className="food-time">{item.time}</span>
          </div>
        </div>

        {item.calories && (
          <span className="food-calories">{item.calories} kcal</span>
        )}
      </div>

      <style jsx>{swipeableStyles}</style>
    </div>
  );
};

/* Swipeable Headache Item sub-component */
interface SwipeableHeadacheItemProps {
  item: HeadacheLog;
  onDelete: () => void;
}

const SwipeableHeadacheItem: React.FC<SwipeableHeadacheItemProps> = ({ item, onDelete }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  const dragThreshold = -70;

  const onTouchStart = (e: React.TouchEvent) => {
    setStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const diff = e.targetTouches[0].clientX - startX;
    if (diff < 0) {
      setCurrentX(isSwipedOpen ? dragThreshold + diff : diff);
    } else if (diff > 0 && isSwipedOpen) {
      setCurrentX(dragThreshold + diff);
    }
  };

  const onTouchEnd = () => {
    if (currentX < dragThreshold / 1.5) {
      setIsSwipedOpen(true);
      setCurrentX(dragThreshold);
    } else {
      setIsSwipedOpen(false);
      setCurrentX(0);
    }
  };

  return (
    <div className="food-swipe-container">
      <button onClick={onDelete} className="food-delete-underlay">
        <Trash2 className="delete-icon" />
      </button>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="food-item-card swipe-transition"
        style={{ transform: `translateX(${Math.min(0, Math.max(-70, currentX))}px)` }}
      >
        <div className="symptom-item-content">
          <div className="food-item-left">
            <div className="meal-badge" style={{ backgroundColor: "rgba(251, 146, 60, 0.12)", color: "var(--color-headache)" }}>
              H
            </div>
            <div className="food-details">
              <span className="food-name">Headache ({item.time})</span>
              <span className="food-time" style={{ color: "var(--color-headache)" }}>
                Intensity: {item.severity}/10 | {item.duration} mins
              </span>
            </div>
          </div>
          
          {item.triggers && item.triggers.length > 0 && (
            <div className="triggers-tags" style={{ marginTop: "8px", marginLeft: "40px" }}>
              {item.triggers.map((t: string) => (
                <span key={t} className="trigger-tag">{t}</span>
              ))}
            </div>
          )}

          {item.notes && (
            <p className="food-time" style={{ marginTop: "8px", marginLeft: "40px", fontStyle: "italic", fontSize: "11px", opacity: 0.85 }}>
              &quot;{item.notes}&quot;
            </p>
          )}
        </div>
      </div>

      <style jsx>{swipeableStyles}</style>
    </div>
  );
};

/* Swipeable Arrhythmia Item sub-component */
interface SwipeableArrhythmiaItemProps {
  item: ArrhythmiaLog;
  onDelete: () => void;
}

const SwipeableArrhythmiaItem: React.FC<SwipeableArrhythmiaItemProps> = ({ item, onDelete }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  const dragThreshold = -70;

  const onTouchStart = (e: React.TouchEvent) => {
    setStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const diff = e.targetTouches[0].clientX - startX;
    if (diff < 0) {
      setCurrentX(isSwipedOpen ? dragThreshold + diff : diff);
    } else if (diff > 0 && isSwipedOpen) {
      setCurrentX(dragThreshold + diff);
    }
  };

  const onTouchEnd = () => {
    if (currentX < dragThreshold / 1.5) {
      setIsSwipedOpen(true);
      setCurrentX(dragThreshold);
    } else {
      setIsSwipedOpen(false);
      setCurrentX(0);
    }
  };

  return (
    <div className="food-swipe-container">
      <button onClick={onDelete} className="food-delete-underlay">
        <Trash2 className="delete-icon" />
      </button>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="food-item-card swipe-transition"
        style={{ transform: `translateX(${Math.min(0, Math.max(-70, currentX))}px)` }}
      >
        <div className="symptom-item-content">
          <div className="food-item-left">
            <div className="meal-badge" style={{ backgroundColor: "rgba(244, 63, 94, 0.12)", color: "var(--color-arrhythmia)" }}>
              ECG
            </div>
            <div className="food-details">
              <span className="food-name">Arrhythmia Episode ({item.time})</span>
              <span className="food-time" style={{ color: "var(--color-arrhythmia)" }}>
                {item.bpm} BPM | {item.duration} mins | <span className="capitalize">{item.severity}</span>
              </span>
            </div>
          </div>

          {item.symptoms && item.symptoms.length > 0 && (
            <div className="triggers-tags" style={{ marginTop: "8px", marginLeft: "40px" }}>
              {item.symptoms.map((s: string) => (
                <span key={s} className="trigger-tag red-tag">{s}</span>
              ))}
            </div>
          )}

          {item.notes && (
            <p className="food-time" style={{ marginTop: "8px", marginLeft: "40px", fontStyle: "italic", fontSize: "11px", opacity: 0.85 }}>
              &quot;{item.notes}&quot;
            </p>
          )}
        </div>
      </div>

      <style jsx>{swipeableStyles}</style>
    </div>
  );
};

/* Shared Swipeable Items Style Tag content */
const swipeableStyles = `
  .food-swipe-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 16px;
  }

  .food-delete-underlay {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 70px;
    background: var(--color-arrhythmia-gradient);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    border-top-right-radius: 16px;
    border-bottom-right-radius: 16px;
    z-index: 1;
  }

  .delete-icon {
    width: 20px;
    height: 20px;
  }

  .food-item-card {
    position: relative;
    width: 100%;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
    cursor: grab;
    touch-action: pan-y;
  }

  .food-item-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .meal-badge {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .food-details {
    display: flex;
    flex-direction: column;
  }

  .food-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .food-time {
    font-size: 10.5px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .food-calories {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .symptom-item-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: flex-start;
  }

  .trigger-tag {
    font-size: 9px;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 2px 6px;
    border-radius: 6px;
    display: inline-block;
  }

  .trigger-tag.red-tag {
    color: var(--color-arrhythmia);
    background: rgba(244, 63, 94, 0.05);
    border-color: rgba(244, 63, 94, 0.15);
  }

  .triggers-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .capitalize {
    text-transform: capitalize;
  }
`;
