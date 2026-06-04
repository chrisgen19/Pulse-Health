"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useHealth, calculateSleepQuality } from "../context/HealthContext";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

interface LoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "sleep" | "food" | "headache" | "arrhythmia";
}

export const LoggerModal: React.FC<LoggerModalProps> = ({
  isOpen,
  onClose,
  initialType = "sleep",
}) => {
  const { addFood, addHeadache, addArrhythmia, updateSleep, selectedDate, logs } = useHealth();
  const [activeTab, setActiveTab] = useState<"sleep" | "food" | "headache" | "arrhythmia">(initialType);

  // Sync initial type when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialType);
    }
  }, [isOpen, initialType]);

  // Sleep state
  const [sleepDuration, setSleepDuration] = useState("");

  // Food state
  const [foodName, setFoodName] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [calories, setCalories] = useState("");

  // Headache state
  const [headacheSeverity, setHeadacheSeverity] = useState(5);
  const [headacheDuration, setHeadacheDuration] = useState("");
  const [headacheTriggers, setHeadacheTriggers] = useState<string[]>([]);
  const [headacheNotes, setHeadacheNotes] = useState("");

  // Arrhythmia state
  const [arrhythmiaBPM, setArrhythmiaBPM] = useState("");
  const [arrhythmiaDuration, setArrhythmiaDuration] = useState("");
  const [arrhythmiaSymptoms, setArrhythmiaSymptoms] = useState<string[]>([]);
  const [arrhythmiaSeverity, setArrhythmiaSeverity] = useState<"mild" | "moderate" | "severe">("mild");
  const [arrhythmiaNotes, setArrhythmiaNotes] = useState("");

  // Reset/Sync form inputs when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Sleep sync
    const currentLog = logs[selectedDate];
    if (currentLog?.sleep) {
      setSleepDuration(currentLog.sleep.duration.toString());
    } else {
      setSleepDuration("");
    }
    
    // Food reset
    setFoodName("");
    setCalories("");
    setMealType("breakfast");

    // Headache reset
    setHeadacheSeverity(5);
    setHeadacheDuration("");
    setHeadacheTriggers([]);
    setHeadacheNotes("");

    // Arrhythmia reset
    setArrhythmiaBPM("");
    setArrhythmiaDuration("");
    setArrhythmiaSymptoms([]);
    setArrhythmiaSeverity("mild");
    setArrhythmiaNotes("");
  }, [isOpen, selectedDate, logs]);

  if (!isOpen) return null;

  // Toggle checklist utilities
  const toggleTrigger = (trigger: string) => {
    setHeadacheTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const toggleSymptom = (symptom: string) => {
    setArrhythmiaSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  // Submit handlers
  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const durVal = sleepDuration ? parseFloat(sleepDuration) : 8;
    updateSleep(selectedDate, durVal);
    onClose();
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    const calValue = calories ? parseInt(calories, 10) : undefined;
    addFood(selectedDate, foodName.trim(), mealType, calValue);
    
    // Reset state
    setFoodName("");
    setCalories("");
    onClose();
  };

  const handleSaveHeadache = (e: React.FormEvent) => {
    e.preventDefault();
    const durationVal = headacheDuration ? parseInt(headacheDuration, 10) : 30;
    addHeadache(selectedDate, headacheSeverity, durationVal, headacheTriggers, headacheNotes.trim());
    onClose();
  };

  const handleSaveArrhythmia = (e: React.FormEvent) => {
    e.preventDefault();
    const bpmVal = arrhythmiaBPM ? parseInt(arrhythmiaBPM, 10) : 120;
    const durationVal = arrhythmiaDuration ? parseInt(arrhythmiaDuration, 10) : 5;
    addArrhythmia(
      selectedDate,
      bpmVal,
      durationVal,
      arrhythmiaSymptoms,
      arrhythmiaSeverity,
      arrhythmiaNotes.trim()
    );
    onClose();
  };

  // Checklists
  const triggerOptions = ["Stress", "Dehydration", "Poor sleep", "Screen time", "Caffeine", "Bright lights", "Skipped meal"];
  const symptomOptions = ["Palpitations", "Lightheadedness", "Shortness of breath", "Chest tightness", "Dizziness", "Fatigue"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <h3>Log New Data</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X className="close-icon" />
          </button>
        </div>

        {/* Tab Selection (using Shadcn Tabs) */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "sleep" | "food" | "headache" | "arrhythmia")} className="w-full">
          <TabsList className="modal-tabs w-full">
            <TabsTrigger value="sleep" className={`tab-btn flex-1 ${activeTab === "sleep" ? "active-sleep" : ""}`}>
              Sleep
            </TabsTrigger>
            <TabsTrigger value="food" className={`tab-btn flex-1 ${activeTab === "food" ? "active-food" : ""}`}>
              Meal
            </TabsTrigger>
            <TabsTrigger value="headache" className={`tab-btn flex-1 ${activeTab === "headache" ? "active-headache" : ""}`}>
              Headache
            </TabsTrigger>
            <TabsTrigger value="arrhythmia" className={`tab-btn flex-1 ${activeTab === "arrhythmia" ? "active-arrhythmia" : ""}`}>
              Heart
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab Contents */}
        <div className="tab-container">
          
          {/* SLEEP FORM */}
          {activeTab === "sleep" && (
            <form onSubmit={handleSaveSleep} className="modal-form">
              <div className="form-group">
                <label htmlFor="sleep-duration-input">Sleep Duration (hours)</label>
                <input
                  type="number"
                  step="0.1"
                  id="sleep-duration-input"
                  placeholder="e.g. 7.5"
                  className="input-field"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Assessed Sleep Quality</label>
                <div 
                  className="quality-preview-box" 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    marginTop: "4px",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  {parseFloat(sleepDuration) > 0 ? (
                    <>
                      <span style={{ fontSize: "20px" }}>
                        {"⭐".repeat(calculateSleepQuality(parseFloat(sleepDuration)))}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-sleep)" }}>
                        {(() => {
                          const q = calculateSleepQuality(parseFloat(sleepDuration));
                          if (q === 5) return "Excellent (8+ hours)";
                          if (q === 4) return "Good (7-8 hours)";
                          if (q === 3) return "Fair (6-7 hours)";
                          if (q === 2) return "Poor (5-6 hours)";
                          return "Very Poor (<5 hours)";
                        })()}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                      Enter sleep duration above to assess quality.
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: "1.4" }}>
                  Sleep quality is automatically assessed based on your logged duration relative to the recommended 8-hour target.
                </p>
              </div>

              <button type="submit" className="btn-primary submit-btn sleep-submit" style={{ background: "var(--color-sleep-gradient)", boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)" }}>
                Log Sleep
              </button>
            </form>
          )}
          
          {/* FOOD FORM */}
          {activeTab === "food" && (
            <form onSubmit={handleSaveFood} className="modal-form">
              <div className="form-group">
                <label htmlFor="food-name">What did you eat?</label>
                <input
                  type="text"
                  id="food-name"
                  placeholder="e.g. Avocado Salmon Toast"
                  className="input-field"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Meal Type</label>
                <div className="meal-type-selector">
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`meal-type-btn ${mealType === type ? "selected" : ""}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="food-calories">Estimated Calories (kcal)</label>
                <input
                  type="number"
                  id="food-calories"
                  placeholder="e.g. 450 (optional)"
                  className="input-field"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary submit-btn food-submit">
                Log Meal
              </button>
            </form>
          )}

          {/* HEADACHE FORM */}
          {activeTab === "headache" && (
            <form onSubmit={handleSaveHeadache} className="modal-form">
              <div className="form-group">
                <div className="label-row">
                  <label>Pain Intensity</label>
                  <span className="slider-value glow-headache">{headacheSeverity}/10</span>
                </div>
                {/* Shadcn Slider component */}
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[headacheSeverity]}
                  onValueChange={(val) => setHeadacheSeverity(Array.isArray(val) ? val[0] : (val as number))}
                  className="intensity-slider-shadcn my-2"
                />
                <div className="intensity-labels">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="headache-duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="headache-duration"
                  placeholder="e.g. 120 (30 min default)"
                  className="input-field"
                  value={headacheDuration}
                  onChange={(e) => setHeadacheDuration(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Triggers</label>
                <div className="checkbox-grid">
                  {triggerOptions.map((trigger) => {
                    const isChecked = headacheTriggers.includes(trigger);
                    return (
                      <button
                        key={trigger}
                        type="button"
                        onClick={() => toggleTrigger(trigger)}
                        className={`checkbox-btn ${isChecked ? "checked" : ""}`}
                      >
                        {trigger}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="headache-notes">Notes</label>
                <textarea
                  id="headache-notes"
                  rows={2}
                  placeholder="Describe details (e.g. medicine taken, pain type)"
                  className="input-field textarea-field"
                  value={headacheNotes}
                  onChange={(e) => setHeadacheNotes(e.target.value)}
                />
              </div>

              <div className="form-action-row">
                <button type="submit" className="btn-primary submit-btn headache-submit">
                  Save Headache Log
                </button>
              </div>
            </form>
          )}

          {/* ARRHYTHMIA FORM */}
          {activeTab === "arrhythmia" && (
            <form onSubmit={handleSaveArrhythmia} className="modal-form">
              <div className="form-group">
                <label htmlFor="heart-bpm">Heart Rate (BPM)</label>
                <input
                  type="number"
                  id="heart-bpm"
                  placeholder="e.g. 145"
                  className="input-field"
                  value={arrhythmiaBPM}
                  onChange={(e) => setArrhythmiaBPM(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="arrhythmia-duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="arrhythmia-duration"
                  placeholder="e.g. 5"
                  className="input-field"
                  value={arrhythmiaDuration}
                  onChange={(e) => setArrhythmiaDuration(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Severity</label>
                <div className="meal-type-selector severity-selector">
                  {(["mild", "moderate", "severe"] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setArrhythmiaSeverity(sev)}
                      className={`meal-type-btn severity-btn ${arrhythmiaSeverity === sev ? "selected red-selected" : ""}`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Symptoms Felt</label>
                <div className="checkbox-grid red-grid">
                  {symptomOptions.map((symptom) => {
                    const isChecked = arrhythmiaSymptoms.includes(symptom);
                    return (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`checkbox-btn ${isChecked ? "checked" : ""}`}
                      >
                        {symptom}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="arrhythmia-notes">Notes</label>
                <textarea
                  id="arrhythmia-notes"
                  rows={2}
                  placeholder="What were you doing when it occurred?"
                  className="input-field textarea-field"
                  value={arrhythmiaNotes}
                  onChange={(e) => setArrhythmiaNotes(e.target.value)}
                />
              </div>

              <div className="form-action-row">
                <button type="submit" className="btn-primary submit-btn arrhythmia-submit">
                  Save Cardiac Log
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: flex-end; /* Drawer slide-up look on mobile */
          justify-content: center;
          animation: fadeIn 0.25s ease-out;
        }

        .modal-content {
          width: 100%;
          max-width: 480px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          border-top-left-radius: 32px;
          border-top-right-radius: 32px;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          max-height: 85vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          padding: 24px;
          box-shadow: 0 -15px 40px rgba(0, 0, 0, 0.6);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Desktop view centers the card */
        @media (min-width: 481px) {
          .modal-overlay {
            align-items: center;
          }
          .modal-content {
            border-radius: 24px;
            margin: 20px;
            animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 600;
        }

        .close-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.08);
        }

        .close-icon {
          width: 18px;
          height: 18px;
        }

        /* Tabs styling */
        .modal-content :global(.modal-tabs) {
          display: flex !important;
          gap: 6px !important;
          background: rgba(0, 0, 0, 0.25) !important;
          border: 1px solid var(--border-color) !important;
          padding: 4px !important;
          border-radius: 14px !important;
          margin-bottom: 20px !important;
          height: auto !important;
          width: 100% !important;
        }

        .modal-content :global(.tab-btn) {
          flex: 1 !important;
          padding: 10px 4px !important;
          background: transparent !important;
          border: none !important;
          color: var(--text-secondary) !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          border-radius: 10px !important;
          cursor: pointer !important;
          transition: var(--transition-smooth) !important;
          text-align: center !important;
          height: auto !important;
          box-shadow: none !important;
        }

        .modal-content :global(.tab-btn)::after {
          display: none !important;
        }

        .modal-content :global(.tab-btn):hover {
          color: var(--text-primary) !important;
        }

        .modal-content :global(.tab-btn.active-sleep) {
          background: var(--color-sleep-gradient) !important;
          color: white !important;
        }

        .modal-content :global(.tab-btn.active-food) {
          background: var(--color-food-gradient) !important;
          color: white !important;
        }

        .modal-content :global(.tab-btn.active-headache) {
          background: var(--color-headache-gradient) !important;
          color: white !important;
        }

        .modal-content :global(.tab-btn.active-arrhythmia) {
          background: var(--color-arrhythmia-gradient) !important;
          color: white !important;
        }

        /* Form structures */
        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 10px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .textarea-field {
          resize: none;
          min-height: 80px;
        }

        /* Meal selector buttons */
        .meal-type-selector {
          display: flex;
          gap: 8px;
        }

        .meal-type-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 10px 6px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-transform: capitalize;
          transition: var(--transition-smooth);
        }

        .meal-type-btn.selected {
          background: rgba(52, 211, 153, 0.1);
          border-color: rgba(52, 211, 153, 0.4);
          color: var(--color-food);
        }

        .severity-selector {
          margin-top: 2px;
        }

        .severity-btn.selected.red-selected {
          background: rgba(244, 63, 94, 0.1);
          border-color: rgba(244, 63, 94, 0.4);
          color: var(--color-arrhythmia);
        }

        /* Checkbox grid buttons */
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .checkbox-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .checkbox-btn.checked {
          background: rgba(251, 146, 60, 0.1);
          border-color: rgba(251, 146, 60, 0.4);
          color: var(--color-headache);
        }

        .red-grid .checkbox-btn.checked {
          background: rgba(244, 63, 94, 0.1);
          border-color: rgba(244, 63, 94, 0.4);
          color: var(--color-arrhythmia);
        }

        /* Customize Shadcn Slider Track and Range Colors */
        :global(.intensity-slider-shadcn) :global([data-slot="slider-track"]) {
          background: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid var(--border-color) !important;
          height: 8px !important;
        }

        :global(.intensity-slider-shadcn) :global([data-slot="slider-range"]) {
          background: var(--color-headache-gradient) !important;
        }

        :global(.intensity-slider-shadcn) :global([data-slot="slider-thumb"]) {
          background-color: var(--color-headache) !important;
          border: 2px solid white !important;
          width: 18px !important;
          height: 18px !important;
          box-shadow: 0 0 10px rgba(251, 146, 60, 0.5) !important;
        }

        .slider-value {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-headache);
        }

        .intensity-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        /* Form Submissions */
        .submit-btn {
          width: 100%;
          padding: 14px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          margin-top: 10px;
          transition: var(--transition-smooth);
        }

        .food-submit { background: var(--color-food-gradient); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
        .headache-submit { background: var(--color-headache-gradient); box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3); }
        .arrhythmia-submit { background: var(--color-arrhythmia-gradient); box-shadow: 0 4px 15px rgba(244, 63, 94, 0.3); }

        .form-action-row {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .delete-symptom-btn {
          flex: 1;
          color: #f43f5e;
          border-color: rgba(244, 63, 94, 0.25);
          font-size: 13px;
          padding: 14px;
        }
        
        .delete-symptom-btn:hover {
          background: rgba(244, 63, 94, 0.05);
        }

        .delete-symptom-btn.red-delete-btn {
          color: #f43f5e;
          border-color: rgba(244, 63, 94, 0.25);
        }
      `}</style>
    </div>
  );
};
