"use client";

import React, { useState } from "react";
import { useHealth, DailyLog } from "../context/HealthContext";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, X } from "lucide-react";

interface TrendsViewProps {
  onNavigateToDashboard?: () => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ onNavigateToDashboard }) => {
  const { logs, getOffsetDateString, setSelectedDate } = useHealth();
  const [activeView, setActiveView] = useState<"weekly" | "calendar">("weekly");
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  // Retrieve the last 7 days of logs (chronological order: oldest to newest)
  const last7Days: DailyLog[] = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = getOffsetDateString(i);
    const log = logs[dateStr] || {
      date: dateStr,
      food: [],
      headaches: [],
      arrhythmias: [],
    };
    last7Days.push(log);
  }

  // Helper to format date keys to short weekday name (e.g., "Mon")
  const getDayOfWeekLabel = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const date = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // 1. SLEEP CHART CALCULATIONS
  const sleepData = last7Days.map((log) => log.sleep?.duration || 0);
  const activeSleepDays = sleepData.filter((v) => v > 0);
  const maxSleep = Math.max(...sleepData, 8); // scale at least up to 8 hours
  const sleepPoints = last7Days.map((log, index) => {
    const x = 35 + index * 42;
    const duration = log.sleep?.duration || 0;
    const y = 130 - (duration / maxSleep) * 90;
    return { x, y, val: duration };
  });

  // Construct SVG Path line
  const sleepPath = sleepPoints.reduce((path, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
  }, "");

  // 2. MOOD CHART CALCULATIONS
  const moodPoints = last7Days.map((log, index) => {
    const x = 35 + index * 42;
    const moodVal = log.mood || 0;
    const y = moodVal > 0 ? 130 - ((moodVal - 1) / 4) * 80 : 135;
    return { x, y, val: moodVal };
  });

  const validMoodPoints = moodPoints.filter((pt) => pt.val > 0);
  const moodPath = validMoodPoints.reduce((path, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
  }, "");

  const moodAreaPath = validMoodPoints.length > 0 
    ? `${moodPath} L ${validMoodPoints[validMoodPoints.length - 1].x} 130 L ${validMoodPoints[0].x} 130 Z`
    : "";

  // 3. CHRONOLOGICAL SYMPTOM LEDGER
  const symptomEpisodes = last7Days
    .filter((log) => (log.headaches && log.headaches.length > 0) || (log.arrhythmias && log.arrhythmias.length > 0))
    .reverse(); // Show most recent episodes first

  // 4. CALENDAR CALCULATIONS
  const getCalendarMonthAndYear = (offset: number) => {
    const d = new Date();
    d.setDate(1); // Set to 1st to prevent rollover on e.g. 31st of month
    d.setMonth(d.getMonth() + offset);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  };

  const { year, month, label: monthLabel } = getCalendarMonthAndYear(monthOffset);
  const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week (0-6)
  const totalDays = new Date(year, month + 1, 0).getDate(); // Days in current viewed month
  const prevMonthTotalDays = new Date(year, month, 0).getDate(); // Days in previous month

  const calendarCells = [];
  
  // Previous month padding cells
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      dayNum: prevMonthTotalDays - i,
      isCurrentMonth: false,
      dateStr: "",
    });
  }

  // Current month day cells
  for (let d = 1; d <= totalDays; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${year}-${mm}-${dd}`;
    calendarCells.push({
      dayNum: d,
      isCurrentMonth: true,
      dateStr,
    });
  }

  // Next month padding cells
  const remainingCells = 7 - (calendarCells.length % 7);
  if (remainingCells < 7) {
    for (let i = 1; i <= remainingCells; i++) {
      calendarCells.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr: "",
      });
    }
  }

  // Helper to format date for day details (e.g. "Thursday, June 4, 2026")
  const formatDetailDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const d = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  // Get details log for currently selected day
  const selectedDayLog = selectedDayStr ? logs[selectedDayStr] : null;

  // Selected date highlights
  const todayStr = getOffsetDateString(0);

  return (
    <div className="trends-wrapper">
      <div className="trends-intro">
        <h2>Weekly Insights & History</h2>
        <p className="subtext">Analyze sleep patterns, mood logs, and historical daily entries</p>
      </div>

      {/* Segmented View Toggle Switch */}
      <div className="view-toggle-bar">
        <button 
          className={`toggle-btn ${activeView === "weekly" ? "active" : ""}`}
          onClick={() => setActiveView("weekly")}
        >
          <TrendingUp style={{ width: "14px", height: "14px", marginRight: "6px", display: "inline-block", verticalAlign: "middle" }} />
          Weekly Charts
        </button>
        <button 
          className={`toggle-btn ${activeView === "calendar" ? "active" : ""}`}
          onClick={() => {
            setActiveView("calendar");
            setSelectedDayStr(todayStr); // pre-select today
          }}
        >
          <Calendar style={{ width: "14px", height: "14px", marginRight: "6px", display: "inline-block", verticalAlign: "middle" }} />
          Calendar Grid
        </button>
      </div>

      {/* VIEW 1: WEEKLY CHARTS */}
      {activeView === "weekly" && (
        <>
          {/* 1. SLEEP CHART CARD */}
          <div className="glass-card trend-chart-card">
            <div className="chart-info">
              <h4>Sleep Duration Trends</h4>
              <span className="avg-badge violet-badge">
                Avg: {(activeSleepDays.reduce((a, b) => a + b, 0) / activeSleepDays.length || 0).toFixed(1)} hrs
              </span>
            </div>

            <div className="chart-svg-container">
              <svg viewBox="0 0 320 160" className="chart-svg">
                {/* Grid Lines */}
                <line x1="30" y1="40" x2="310" y2="40" className="chart-grid-line-subtle" />
                <line x1="30" y1="85" x2="310" y2="85" className="chart-grid-line-subtle" />
                <line x1="30" y1="130" x2="310" y2="130" className="chart-grid-line-main" />

                {/* Line graph */}
                {sleepPath && (
                  <path
                    d={sleepPath}
                    fill="none"
                    stroke="var(--color-sleep)"
                    strokeWidth="3.5"
                    className="glow-sleep"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Node dots */}
                {sleepPoints.map((pt, idx) => (
                  <g key={idx}>
                    {pt.val > 0 && (
                      <>
                        <circle cx={pt.x} cy={pt.y} r="6" fill="var(--bg-secondary)" stroke="var(--color-sleep)" strokeWidth="2.5" />
                        <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="600">
                          {pt.val}h
                        </text>
                      </>
                    )}
                  </g>
                ))}

                {/* X Axis Labels */}
                {last7Days.map((log, idx) => (
                  <text key={idx} x={35 + idx * 42} y="152" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="500">
                    {getDayOfWeekLabel(log.date)}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* 2. MOOD AREA CHART CARD */}
          <div className="glass-card trend-chart-card">
            <div className="chart-info">
              <h4>Mood Fluctuation</h4>
              <span className="avg-badge mint-badge">
                Restorative Health
              </span>
            </div>

            <div className="chart-svg-container">
              <svg viewBox="0 0 320 160" className="chart-svg">
                <defs>
                  <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-mood)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-mood)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="30" y1="40" x2="310" y2="40" className="chart-grid-line-subtle" />
                <line x1="30" y1="85" x2="310" y2="85" className="chart-grid-line-subtle" />
                <line x1="30" y1="130" x2="310" y2="130" className="chart-grid-line-main" />

                {/* Area Fill */}
                {moodAreaPath && (
                  <path d={moodAreaPath} fill="url(#moodAreaGrad)" />
                )}

                {/* Line graph */}
                {moodPath && (
                  <path
                    d={moodPath}
                    fill="none"
                    stroke="var(--color-mood)"
                    strokeWidth="3"
                    className="glow-mood"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Mood Emoji Indicators */}
                {moodPoints.map((pt, idx) => (
                  <g key={idx}>
                    {pt.val > 0 && (
                      <>
                        <circle cx={pt.x} cy={pt.y} r="4" fill="var(--bg-secondary)" stroke="var(--color-mood)" strokeWidth="2" />
                        <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="11">
                          {pt.val === 5 ? "😄" : pt.val === 4 ? "🙂" : pt.val === 3 ? "😐" : pt.val === 2 ? "😕" : "😢"}
                        </text>
                      </>
                    )}
                  </g>
                ))}

                {/* X Axis Labels */}
                {last7Days.map((log, idx) => (
                  <text key={idx} x={35 + idx * 42} y="152" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="500">
                    {getDayOfWeekLabel(log.date)}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* 3. SYMPTOM CHRONOLOGY LEDGER */}
          <div className="glass-card symptom-ledger-card">
            <h4>Symptom Logs & Details</h4>
            <p className="card-subtext">Events registered in the last 7 days</p>

            <div className="ledger-body">
              {symptomEpisodes.length === 0 ? (
                <p className="empty-ledger">No headaches or arrhythmia episodes logged this week. Excellent!</p>
              ) : (
                <div className="ledger-list">
                  {symptomEpisodes.map((log) => {
                    const dateParts = log.date.split("-");
                    const d = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                    const formattedDate = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    const isToday = log.date === getOffsetDateString(0);
                    const isYesterday = log.date === getOffsetDateString(1);
                    const dayHeader = isToday ? "Today" : isYesterday ? "Yesterday" : formattedDate;

                    return (
                      <div key={log.date} className="ledger-item">
                        <div className="ledger-item-header">
                          <h5>{dayHeader}</h5>
                        </div>

                        <div className="ledger-item-details">
                          {/* Headache entries */}
                          {log.headaches && log.headaches.map((h) => (
                            <div key={h.id} className="ledger-symptom-entry headache-border">
                              <div className="ledger-symptom-title">
                                <span className="symptom-dot headache-bg"></span>
                                <h6>Headache Episode <span style={{fontSize: "11px", color: "var(--text-secondary)", fontWeight: "normal"}}>({h.time})</span></h6>
                                <span className="ledger-badge headache-badge">Intensity: {h.severity}/10</span>
                              </div>
                              <p className="ledger-symptom-sub">
                                Duration: {h.duration} mins
                              </p>
                              {h.triggers.length > 0 && (
                                <div className="ledger-tags">
                                  {h.triggers.map((t) => (
                                    <span key={t} className="ledger-tag-chip orange-chip">{t}</span>
                                  ))}
                                </div>
                              )}
                              {h.notes && (
                                <p className="ledger-notes">&quot;{h.notes}&quot;</p>
                              )}
                            </div>
                          ))}

                          {/* Arrhythmia entries */}
                          {log.arrhythmias && log.arrhythmias.map((a) => (
                            <div key={a.id} className="ledger-symptom-entry arrhythmia-border">
                              <div className="ledger-symptom-title">
                                <span className="symptom-dot arrhythmia-bg"></span>
                                <h6>Arrhythmia Episode <span style={{fontSize: "11px", color: "var(--text-secondary)", fontWeight: "normal"}}>({a.time})</span></h6>
                                <span className="ledger-badge arrhythmia-badge">{a.bpm} BPM</span>
                              </div>
                              <p className="ledger-symptom-sub">
                                Duration: {a.duration} mins | Severity: <span className="capitalize">{a.severity}</span>
                              </p>
                              {a.symptoms.length > 0 && (
                                <div className="ledger-tags">
                                  {a.symptoms.map((s) => (
                                    <span key={s} className="ledger-tag-chip red-chip">{s}</span>
                                  ))}
                                </div>
                              )}
                              {a.notes && (
                                <p className="ledger-notes">&quot;{a.notes}&quot;</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SEE MORE TRIGGERS */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", width: "100%" }}>
            <button 
              className="btn-see-more glow-sleep"
              onClick={() => {
                setActiveView("calendar");
                setSelectedDayStr(todayStr);
              }}
            >
              See Calendar History Grid (30 Days) →
            </button>
          </div>
        </>
      )}

      {/* VIEW 2: MONTHLY CALENDAR GRID */}
      {activeView === "calendar" && (
        <div className={`calendar-section ${selectedDayStr ? "has-details" : ""}`}>
          {/* Calendar Header with Month Selector */}
          <div className="glass-card">
            <div className="calendar-month-header">
              <button className="month-nav-btn" onClick={() => setMonthOffset((prev) => prev - 1)} aria-label="Previous month">
                <ChevronLeft style={{ width: "16px", height: "16px" }} />
              </button>
              <h3>{monthLabel}</h3>
              <button className="month-nav-btn" onClick={() => setMonthOffset((prev) => prev + 1)} aria-label="Next month">
                <ChevronRight style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>

          {/* Calendar Grid Sheet */}
          <div className="glass-card">
            <div className="calendar-grid">
              {/* Weekday labels */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="calendar-weekday-label">
                  {day}
                </div>
              ))}

              {/* Day cells */}
              {calendarCells.map((cell, idx) => {
                const log = cell.dateStr ? logs[cell.dateStr] : null;
                const hasSleep = !!log?.sleep;
                const hasFood = log?.food && log.food.length > 0;
                const hasHeadache = log?.headaches && log.headaches.length > 0;
                const hasArrhythmia = log?.arrhythmias && log.arrhythmias.length > 0;
                
                const isSelected = selectedDayStr === cell.dateStr;
                const isToday = cell.dateStr === todayStr;

                // Mood color styling & border highlights for symptoms
                const cellStyle: React.CSSProperties = {};
                if (cell.isCurrentMonth) {
                  if (log?.mood) {
                    const m = log.mood;
                    if (m === 5) cellStyle.background = "rgba(45, 212, 191, 0.15)";
                    else if (m === 4) cellStyle.background = "rgba(45, 212, 191, 0.07)";
                    else if (m === 2) cellStyle.background = "rgba(244, 63, 94, 0.05)";
                    else if (m === 1) cellStyle.background = "rgba(244, 63, 94, 0.12)";
                  }
                  
                  if (hasArrhythmia) {
                    cellStyle.borderColor = "rgba(244, 63, 94, 0.4)";
                  } else if (hasHeadache) {
                    cellStyle.borderColor = "rgba(251, 146, 60, 0.4)";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => cell.dateStr && setSelectedDayStr(cell.dateStr)}
                    className={`calendar-cell ${!cell.isCurrentMonth ? "inactive" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                    style={cellStyle}
                    disabled={!cell.isCurrentMonth}
                  >
                    {/* Simplified mobile cell view */}
                    <div className="cell-mobile-content">
                      <span className="cell-day-num">{cell.dayNum}</span>
                      <div className="cell-indicators">
                        {hasSleep && <span className="cell-dot cell-dot-sleep"></span>}
                        {hasFood && <span className="cell-dot cell-dot-food"></span>}
                        {hasHeadache && <span className="cell-dot cell-dot-headache"></span>}
                        {hasArrhythmia && <span className="cell-dot cell-dot-arrhythmia"></span>}
                      </div>
                    </div>

                    {/* Rich desktop cell view */}
                    <div className="cell-desktop-content">
                      <div className="cell-top-row">
                        <span className={`cell-day-num ${!cell.isCurrentMonth ? "inactive-day-num" : ""}`}>
                          {cell.dayNum}
                        </span>
                        {cell.isCurrentMonth && log?.mood && (
                          <span className="cell-mood-emoji">
                            {log.mood === 5 ? "😄" : log.mood === 4 ? "🙂" : log.mood === 3 ? "😐" : log.mood === 2 ? "😕" : "😢"}
                          </span>
                        )}
                      </div>

                      {cell.isCurrentMonth && (
                        <div className="cell-rich-metrics">
                          {log?.sleep && (
                            <div className="metric-chip sleep-chip">
                              <span className="chip-icon">🌙</span>
                              <span className="chip-text">{log.sleep.duration}h</span>
                            </div>
                          )}
                          {log?.food && log.food.length > 0 && (
                            <div className="metric-chip food-chip">
                              <span className="chip-icon">🥗</span>
                              <span className="chip-text">
                                {log.food.reduce((sum, f) => sum + (f.calories || 0), 0)} kcal
                              </span>
                            </div>
                          )}
                          {log?.headaches && log.headaches.length > 0 && (
                            <div className="metric-chip headache-chip">
                              <span className="chip-icon">🧠</span>
                              <span className="chip-text">{log.headaches.length} headache{log.headaches.length > 1 ? "s" : ""}</span>
                            </div>
                          )}
                          {log?.arrhythmias && log.arrhythmias.length > 0 && (
                            <div className="metric-chip arrhythmia-chip">
                              <span className="chip-icon">⚡</span>
                              <span className="chip-text">
                                {Math.max(...log.arrhythmias.map(a => a.bpm))} bpm
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Grid Legend */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-secondary)" }}>
                <span className="cell-dot cell-dot-sleep"></span> Sleep
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-secondary)" }}>
                <span className="cell-dot cell-dot-food"></span> Meal
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-secondary)" }}>
                <span className="cell-dot cell-dot-headache"></span> Headache
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-secondary)" }}>
                <span className="cell-dot cell-dot-arrhythmia"></span> Heart
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-secondary)", marginLeft: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "rgba(45, 212, 191, 0.15)", borderRadius: "2px", border: "1px solid rgba(45,212,191,0.3)" }}></span> 😄 Mood
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--text-secondary)" }}>
                <span style={{ width: "8px", height: "8px", background: "rgba(244, 63, 94, 0.12)", borderRadius: "2px", border: "1px solid rgba(244,63,94,0.3)" }}></span> 😢 Mood
              </div>
            </div>
          </div>

          {/* Selected day details panel */}
          {selectedDayStr && (
            <div className="glass-card calendar-detail-card">
              <div className="detail-header">
                <div>
                  <h4 className="detail-title">{formatDetailDate(selectedDayStr)}</h4>
                  <span className="card-subtext" style={{ margin: 0 }}>
                    {selectedDayStr === todayStr ? "Today's Ledger" : "Historical Summary"}
                  </span>
                </div>
                <div className="detail-actions">
                  <button 
                    className="btn-select-date glow-mood"
                    onClick={() => {
                      setSelectedDate(selectedDayStr);
                      if (onNavigateToDashboard) onNavigateToDashboard();
                    }}
                  >
                    Select & Edit Date
                  </button>
                  <button className="month-nav-btn" onClick={() => setSelectedDayStr(null)} aria-label="Close details">
                    <X style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
              </div>

              {/* Day logs data representation */}
              <div className="detail-body-content">
                {!selectedDayLog || (!selectedDayLog.sleep && (!selectedDayLog.food || selectedDayLog.food.length === 0) && (!selectedDayLog.headaches || selectedDayLog.headaches.length === 0) && (!selectedDayLog.arrhythmias || selectedDayLog.arrhythmias.length === 0)) ? (
                  <p className="empty-ledger">No logs recorded for this day. Click &quot;Select &amp; Edit Date&quot; to log data on the dashboard.</p>
                ) : (
                  <div className="detail-section">
                    {/* Mood summary */}
                    {selectedDayLog.mood && (
                      <div className="detail-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="detail-item-title">Mood Rating</span>
                        <span style={{ fontSize: "16px" }}>
                          {selectedDayLog.mood === 5 ? "😄 Great" : selectedDayLog.mood === 4 ? "🙂 Good" : selectedDayLog.mood === 3 ? "😐 Okay" : selectedDayLog.mood === 2 ? "😕 Poor" : "😢 Bad"}
                        </span>
                      </div>
                    )}

                    {/* Sleep summary */}
                    {selectedDayLog.sleep && (
                      <div className="detail-row">
                        <span className="detail-section-title" style={{ color: "var(--color-sleep)" }}>Sleep</span>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                          <span className="detail-item-title">{selectedDayLog.sleep.duration} hours</span>
                          <span style={{ fontSize: "14px" }}>
                            {"⭐".repeat(selectedDayLog.sleep.quality)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Food summary */}
                    {selectedDayLog.food && selectedDayLog.food.length > 0 && (
                      <div className="detail-row">
                        <span className="detail-section-title" style={{ color: "var(--color-food)" }}>Meals ({selectedDayLog.food.reduce((sum, f) => sum + (f.calories || 0), 0)} kcal)</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                          {selectedDayLog.food.map((f) => (
                            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                              <span style={{ color: "var(--text-primary)" }}>{f.name} <span style={{ color: "var(--text-secondary)", fontSize: "10px" }}>({f.time})</span></span>
                              <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>{f.calories ? `${f.calories} kcal` : "--"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Headache summary */}
                    {selectedDayLog.headaches && selectedDayLog.headaches.length > 0 && (
                      <div className="detail-row">
                        <span className="detail-section-title" style={{ color: "var(--color-headache)" }}>Headaches ({selectedDayLog.headaches.length})</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
                          {selectedDayLog.headaches.map((h) => (
                            <div key={h.id} style={{ borderLeft: "2px solid var(--color-headache)", paddingLeft: "8px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600" }}>
                                <span>Intensity {h.severity}/10 <span style={{ fontWeight: "normal", color: "var(--text-secondary)", fontSize: "10px" }}>({h.time})</span></span>
                                <span>{h.duration} mins</span>
                              </div>
                              {h.triggers.length > 0 && (
                                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                                  {h.triggers.map((t) => (
                                    <span key={t} className="trigger-tag" style={{ fontSize: "9px", padding: "1px 4px" }}>{t}</span>
                                  ))}
                                </div>
                              )}
                              {h.notes && (
                                <p style={{ fontSize: "11px", fontStyle: "italic", marginTop: "4px", opacity: 0.85 }}>&quot;{h.notes}&quot;</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Arrhythmia summary */}
                    {selectedDayLog.arrhythmias && selectedDayLog.arrhythmias.length > 0 && (
                      <div className="detail-row">
                        <span className="detail-section-title" style={{ color: "var(--color-arrhythmia)" }}>Heart Episodes ({selectedDayLog.arrhythmias.length})</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
                          {selectedDayLog.arrhythmias.map((a) => (
                            <div key={a.id} style={{ borderLeft: "2px solid var(--color-arrhythmia)", paddingLeft: "8px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600" }}>
                                <span>{a.bpm} BPM <span style={{ fontWeight: "normal", color: "var(--text-secondary)", fontSize: "10px" }}>({a.time})</span></span>
                                <span className="capitalize" style={{ fontSize: "11px", color: "var(--color-arrhythmia)" }}>{a.severity}</span>
                              </div>
                              <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Duration: {a.duration} mins</p>
                              {a.symptoms.length > 0 && (
                                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                                  {a.symptoms.map((s) => (
                                    <span key={s} className="trigger-tag red-tag" style={{ fontSize: "9px", padding: "1px 4px" }}>{s}</span>
                                  ))}
                                </div>
                              )}
                              {a.notes && (
                                <p style={{ fontSize: "11px", fontStyle: "italic", marginTop: "4px", opacity: 0.85 }}>&quot;{a.notes}&quot;</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .trends-wrapper {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 24px 20px 20px 20px;
        }

        @media (min-width: 768px) {
          .trends-wrapper {
            grid-template-columns: repeat(2, 1fr);
          }
          .trends-intro, .view-toggle-bar, .symptom-ledger-card, .btn-see-more, .calendar-section {
            grid-column: span 2;
          }
        }

        .trends-intro {
          margin-bottom: 4px;
        }

        .trends-intro h2 {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .subtext {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        /* Segmented control view toggle */
        .view-toggle-bar {
          display: flex;
          background: var(--bg-toggle-bar);
          border: 1px solid var(--border-color);
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 6px;
          gap: 4px;
          width: 100%;
        }

        .toggle-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 10px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition-smooth);
          text-align: center;
        }

        .toggle-btn:hover {
          color: var(--text-primary);
        }

        .toggle-btn.active {
          background: var(--bg-toggle-active);
          color: var(--text-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .trend-chart-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chart-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chart-info h4 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .avg-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .violet-badge {
          background: rgba(129, 140, 248, 0.1);
          color: var(--color-sleep);
          border: 1px solid rgba(129, 140, 248, 0.2);
        }

        .mint-badge {
          background: rgba(45, 212, 191, 0.1);
          color: var(--color-mood);
          border: 1px solid rgba(45, 212, 191, 0.2);
        }

        .chart-svg-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .chart-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        /* Symptom ledger styles */
        .symptom-ledger-card {
          padding: 22px;
        }

        .symptom-ledger-card h4 {
          font-size: 16px;
          font-weight: 600;
        }

        .card-subtext {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 2px;
          margin-bottom: 16px;
        }

        .empty-ledger {
          font-size: 13px;
          color: var(--text-secondary);
          text-align: center;
          padding: 16px 0;
        }

        .ledger-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ledger-item {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .ledger-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .ledger-item-header h5 {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .ledger-item-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ledger-symptom-entry {
          background: var(--bg-entry);
          border: 1px solid var(--border-color);
          border-left: 3px solid transparent;
          border-radius: 12px;
          padding: 12px 14px;
        }

        .headache-border {
          border-left-color: var(--color-headache);
        }

        .arrhythmia-border {
          border-left-color: var(--color-arrhythmia);
        }

        .ledger-symptom-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .symptom-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .headache-bg { background-color: var(--color-headache); }
        .arrhythmia-bg { background-color: var(--color-arrhythmia); }

        .ledger-symptom-title h6 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }

        .ledger-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .headache-badge {
          background: rgba(251, 146, 60, 0.1);
          color: var(--color-headache);
        }

        .arrhythmia-badge {
          background: rgba(244, 63, 94, 0.1);
          color: var(--color-arrhythmia);
        }

        .ledger-symptom-sub {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .capitalize {
          text-transform: capitalize;
        }

        .ledger-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 8px;
        }

        .ledger-tag-chip {
          font-size: 9.5px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .orange-chip {
          background: rgba(251, 146, 60, 0.05);
          color: var(--color-headache);
          border: 1px solid rgba(251, 146, 60, 0.12);
        }

        .red-chip {
          background: rgba(244, 63, 94, 0.05);
          color: var(--color-arrhythmia);
          border: 1px solid rgba(244, 63, 94, 0.12);
        }

        .ledger-notes {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          font-style: italic;
          padding-left: 8px;
          border-left: 2px solid var(--border-color);
        }

        /* See More Controls */
        .btn-see-more {
          background: var(--bg-button-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 12px 24px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 16px;
          cursor: pointer;
          transition: var(--transition-bounce);
          margin-bottom: 10px;
          text-align: center;
        }

        .btn-see-more:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .btn-see-more:active {
          transform: scale(0.96);
        }

        /* Calendar View Section styling */
        .calendar-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          width: 100%;
        }

        @media (min-width: 768px) {
          .calendar-section.has-details {
            grid-template-columns: 1.3fr 0.7fr;
            align-items: start;
          }
          .calendar-section.has-details > :first-child {
            grid-column: span 2;
          }
          .calendar-section:not(.has-details) {
            grid-template-columns: 1fr;
          }
        }

        .calendar-month-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }

        .calendar-month-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .month-nav-btn {
          background: var(--bg-button-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }

        .month-nav-btn:hover {
          background: var(--bg-sidebar-hover);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 6px;
          width: 100%;
        }

        .calendar-weekday-label {
          text-align: center;
          font-size: 10px;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 4px 0;
          text-transform: uppercase;
        }

        .calendar-cell {
          aspect-ratio: 1;
          background: var(--bg-cell);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: var(--transition-smooth);
          padding: 6px 4px 8px 4px;
          box-sizing: border-box;
        }

        .calendar-cell.inactive {
          opacity: 0.35;
          cursor: default;
          pointer-events: none;
        }

        .inactive-day-num {
          opacity: 0.45;
          font-weight: 500;
        }

        .calendar-cell:hover:not(.inactive) {
          background: var(--bg-cell-hover);
          transform: translateY(-2px);
        }

        .calendar-cell.selected {
          border-color: var(--color-sleep) !important;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2) !important;
        }

        .calendar-cell.today {
          border-color: var(--color-mood) !important;
          box-shadow: 0 0 8px rgba(45, 212, 191, 0.25) !important;
        }

        /* Responsive cell structures */
        .cell-mobile-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          width: 100%;
        }

        .cell-desktop-content {
          display: none;
        }

        .cell-day-num {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .cell-indicators {
          display: flex;
          gap: 3px;
          justify-content: center;
          align-items: center;
          height: 6px;
          width: 100%;
        }

        .cell-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .cell-dot-sleep { background-color: var(--color-sleep); }
        .cell-dot-food { background-color: var(--color-food); }
        .cell-dot-headache { background-color: var(--color-headache); }
        .cell-dot-arrhythmia { background-color: var(--color-arrhythmia); }

        @media (min-width: 768px) {
          .calendar-cell {
            aspect-ratio: auto;
            height: 120px;
            min-height: 120px;
            max-height: 120px;
            overflow: hidden;
            padding: 8px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start;
          }

          .cell-mobile-content {
            display: none;
          }

          .cell-desktop-content {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            height: 100%;
            width: 100%;
            gap: 6px;
          }

          .cell-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 6px;
          }

          .cell-mood-emoji {
            font-size: 13px;
          }

          .cell-rich-metrics {
            display: flex;
            flex-flow: row wrap;
            gap: 4px;
            width: 100%;
          }

          .metric-chip {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 600;
            width: auto;
            flex: 1 1 calc(50% - 4px);
            min-width: 50px;
            box-sizing: border-box;
          }

          .sleep-chip {
            background: rgba(129, 140, 248, 0.08);
            color: var(--color-sleep);
            border: 1px solid rgba(129, 140, 248, 0.15);
          }

          .food-chip {
            background: rgba(52, 211, 153, 0.08);
            color: var(--color-food);
            border: 1px solid rgba(52, 211, 153, 0.15);
          }

          .headache-chip {
            background: rgba(251, 146, 60, 0.08);
            color: var(--color-headache);
            border: 1px solid rgba(251, 146, 60, 0.15);
          }

          .arrhythmia-chip {
            background: rgba(244, 63, 94, 0.08);
            color: var(--color-arrhythmia);
            border: 1px solid rgba(244, 63, 94, 0.15);
          }

          .chip-icon {
            font-size: 10px;
            display: flex;
            align-items: center;
          }

          .chip-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        /* Calendar Detail view card */
        .calendar-detail-card {
          padding: 20px;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .detail-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .detail-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-select-date {
          border: none;
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-select-date:active {
          transform: scale(0.95);
        }

        .detail-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-row {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 14px;
        }

        .detail-section-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }

        .detail-item-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .trigger-tag {
          font-size: 9px;
          font-weight: 500;
          background: var(--bg-button-secondary);
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

        /* Chart SVG grid lines */
        .chart-grid-line-subtle {
          stroke: var(--chart-grid-subtle);
          stroke-width: 1;
        }

        .chart-grid-line-main {
          stroke: var(--chart-grid-main);
          stroke-width: 1;
        }
      `}</style>
    </div>
  );
};
