"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect } from "react";

export interface FoodLog {
  id: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories?: number;
  time: string;
}

export interface HeadacheLog {
  id: string;
  severity: number; // 1-10
  duration: number; // minutes
  triggers: string[];
  notes: string;
  time: string; // e.g. "08:15 AM"
}

export interface ArrhythmiaLog {
  id: string;
  bpm: number;
  duration: number; // minutes
  symptoms: string[];
  severity: "mild" | "moderate" | "severe";
  notes: string;
  time: string; // e.g. "08:15 AM"
}

export interface SleepLog {
  duration: number; // hours
  quality: number; // 1-5
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  sleep?: SleepLog;
  food: FoodLog[];
  headaches: HeadacheLog[];
  arrhythmias: ArrhythmiaLog[];
  mood?: number; // 1-5
}

interface HealthContextType {
  logs: Record<string, DailyLog>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  updateSleep: (date: string, duration: number) => void;
  addFood: (date: string, name: string, mealType: FoodLog["mealType"], calories?: number) => void;
  deleteFood: (date: string, id: string) => void;
  addHeadache: (date: string, severity: number, duration: number, triggers: string[], notes: string) => void;
  deleteHeadache: (date: string, id: string) => void;
  addArrhythmia: (date: string, bpm: number, duration: number, symptoms: string[], severity: ArrhythmiaLog["severity"], notes: string) => void;
  deleteArrhythmia: (date: string, id: string) => void;
  updateMood: (date: string, mood: number) => void;
  getOffsetDateString: (offset: number) => string;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

// Helper to get formatted date string (YYYY-MM-DD)
export const getOffsetDateString = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Helper to calculate sleep quality based on duration vs recommended (8 hours)
export const calculateSleepQuality = (duration: number): number => {
  if (duration <= 0) return 0;
  if (duration >= 8) return 5;
  if (duration >= 7) return 4;
  if (duration >= 6) return 3;
  if (duration >= 5) return 2;
  return 1;
};

export const HealthProvider: React.FC<{ children: React.ReactNode; userId: string }> = ({
  children,
  userId,
}) => {
  // Scope storage to the signed-in user so accounts sharing a browser don't see
  // each other's health logs.
  const storageKey = `health_tracker_logs_${userId}`;
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize date on client mount
  useEffect(() => {
    setSelectedDate(getOffsetDateString(0));
  }, []);

  // Load data from localStorage or create mock data
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let migrated = false;

        // Auto-upgrade to 30 days mock if history is short (e.g. legacy 7-day logs)
        if (Object.keys(parsed).length < 15) {
          const mock = generateMockData();
          setLogs(mock);
          localStorage.setItem(storageKey, JSON.stringify(mock));
          setIsLoaded(true);
          return;
        }

        // Migration check for headaches and arrhythmias arrays
        Object.keys(parsed).forEach((date) => {
          const log = parsed[date];
          
          // Migrate singular headache to array headaches
          if ("headache" in log && !log.headaches) {
            log.headaches = log.headache ? [{
              id: Math.random().toString(36).substr(2, 9),
              ...log.headache,
              time: log.headache.time || "12:00 PM",
            }] : [];
            delete log.headache;
            migrated = true;
          } else if (!log.headaches) {
            log.headaches = [];
            migrated = true;
          }

          // Migrate singular arrhythmia to array arrhythmias
          if ("arrhythmia" in log && !log.arrhythmias) {
            log.arrhythmias = log.arrhythmia ? [{
              id: Math.random().toString(36).substr(2, 9),
              ...log.arrhythmia,
              time: log.arrhythmia.time || "12:00 PM",
            }] : [];
            delete log.arrhythmia;
            migrated = true;
          } else if (!log.arrhythmias) {
            log.arrhythmias = [];
            migrated = true;
          }
        });

        setLogs(parsed);
        if (migrated) {
          localStorage.setItem(storageKey, JSON.stringify(parsed));
        }
      } catch (e) {
        console.error("Failed to parse logs", e);
        const mock = generateMockData();
        setLogs(mock);
        localStorage.setItem(storageKey, JSON.stringify(mock));
      }
    } else {
      const mock = generateMockData();
      setLogs(mock);
      localStorage.setItem(storageKey, JSON.stringify(mock));
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(logs));
  }, [logs, isLoaded, storageKey]);

  // Actions
  const updateSleep = (date: string, duration: number) => {
    const quality = calculateSleepQuality(duration);
    setLogs((prev) => {
      const dayLog = prev[date] || createEmptyLog(date);
      return {
        ...prev,
        [date]: {
          ...dayLog,
          sleep: { duration, quality },
        },
      };
    });
  };

  const addFood = (date: string, name: string, mealType: FoodLog["mealType"], calories?: number) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newFood: FoodLog = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      mealType,
      calories,
      time,
    };

    setLogs((prev) => {
      const dayLog = prev[date] || createEmptyLog(date);
      return {
        ...prev,
        [date]: {
          ...dayLog,
          food: [...dayLog.food, newFood],
        },
      };
    });
  };

  const deleteFood = (date: string, id: string) => {
    setLogs((prev) => {
      const dayLog = prev[date];
      if (!dayLog) return prev;
      return {
        ...prev,
        [date]: {
          ...dayLog,
          food: dayLog.food.filter((item) => item.id !== id),
        },
      };
    });
  };

  const addHeadache = (
    date: string,
    severity: number,
    duration: number,
    triggers: string[],
    notes: string
  ) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHeadache: HeadacheLog = {
      id: Math.random().toString(36).substr(2, 9),
      severity,
      duration,
      triggers,
      notes,
      time,
    };

    setLogs((prev) => {
      const dayLog = prev[date] || createEmptyLog(date);
      return {
        ...prev,
        [date]: {
          ...dayLog,
          headaches: [...(dayLog.headaches || []), newHeadache],
        },
      };
    });
  };

  const deleteHeadache = (date: string, id: string) => {
    setLogs((prev) => {
      const dayLog = prev[date];
      if (!dayLog) return prev;
      return {
        ...prev,
        [date]: {
          ...dayLog,
          headaches: (dayLog.headaches || []).filter((h) => h.id !== id),
        },
      };
    });
  };

  const addArrhythmia = (
    date: string,
    bpm: number,
    duration: number,
    symptoms: string[],
    severity: ArrhythmiaLog["severity"],
    notes: string
  ) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newArrhythmia: ArrhythmiaLog = {
      id: Math.random().toString(36).substr(2, 9),
      bpm,
      duration,
      symptoms,
      severity,
      notes,
      time,
    };

    setLogs((prev) => {
      const dayLog = prev[date] || createEmptyLog(date);
      return {
        ...prev,
        [date]: {
          ...dayLog,
          arrhythmias: [...(dayLog.arrhythmias || []), newArrhythmia],
        },
      };
    });
  };

  const deleteArrhythmia = (date: string, id: string) => {
    setLogs((prev) => {
      const dayLog = prev[date];
      if (!dayLog) return prev;
      return {
        ...prev,
        [date]: {
          ...dayLog,
          arrhythmias: (dayLog.arrhythmias || []).filter((a) => a.id !== id),
        },
      };
    });
  };

  const updateMood = (date: string, mood: number) => {
    setLogs((prev) => {
      const dayLog = prev[date] || createEmptyLog(date);
      return {
        ...prev,
        [date]: {
          ...dayLog,
          mood,
        },
      };
    });
  };

  return (
    <HealthContext.Provider
      value={{
        logs,
        selectedDate,
        setSelectedDate,
        updateSleep,
        addFood,
        deleteFood,
        addHeadache,
        deleteHeadache,
        addArrhythmia,
        deleteArrhythmia,
        updateMood,
        getOffsetDateString,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
};

// Utilities for empty log creation
const createEmptyLog = (date: string): DailyLog => ({
  date,
  food: [],
  headaches: [],
  arrhythmias: [],
});

// Dynamic mock data generation relative to today for the past 30 days
const generateMockData = (): Record<string, DailyLog> => {
  const mock: Record<string, DailyLog> = {};

  const breakfasts = [
    { name: "Avocado Toast & Egg", calories: 380 },
    { name: "Berry Greek Yogurt Bowl", calories: 310 },
    { name: "Oatmeal with Blueberries", calories: 340 },
    { name: "Spinach & Mushroom Omelette", calories: 390 },
    { name: "Banana Peanut Butter Shake", calories: 420 },
    { name: "Pancakes & Organic Syrup", calories: 480 },
  ];
  const lunches = [
    { name: "Salmon & Quinoa Bowl", calories: 580 },
    { name: "Turkey & Avocado Wrap", calories: 480 },
    { name: "Chicken Caesar Salad", calories: 520 },
    { name: "Beef Pho Bowl", calories: 650 },
    { name: "Tuna Wrap & Greens", calories: 440 },
  ];
  const dinners = [
    { name: "Grilled Chicken & Veggies", calories: 620 },
    { name: "Baked Cod with Asparagus", calories: 450 },
    { name: "Stir-fried Beef & Rice", calories: 680 },
    { name: "Grilled Salmon & Sweet Potato", calories: 650 },
    { name: "Chicken Quesadilla", calories: 720 },
  ];
  const snacks = [
    { name: "Organic Protein Bar", calories: 220 },
    { name: "Whey Protein Shake", calories: 180 },
    { name: "Mixed Nuts & Green Tea", calories: 150 },
    { name: "Dark Chocolate Square", calories: 90 },
  ];

  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const dateStr = getOffsetDateString(i);
    const dayOfWeek = new Date(dateStr).getDay();
    
    // Sleep duration (weekends higher, weekdays slightly lower)
    const sleepBase = dayOfWeek === 0 || dayOfWeek === 6 ? 7.9 : 6.9;
    // Vary slightly using math trig to keep mock data deterministic yet natural
    const sleepDuration = Math.round((sleepBase + (Math.sin(i * 1.5) * 1.1)) * 10) / 10;
    const sleepQuality = calculateSleepQuality(sleepDuration);

    // Mood (correlates with sleep duration)
    let mood = 3;
    if (sleepDuration >= 7.5) mood = 5;
    else if (sleepDuration >= 6.8) mood = 4;
    else if (sleepDuration >= 6.0) mood = 3;
    else mood = 2;

    // Add random variations based on math cosine
    if (Math.cos(i) > 0.6) mood = Math.min(5, mood + 1);
    if (Math.sin(i) < -0.6) mood = Math.max(1, mood - 1);

    // Food
    const food: FoodLog[] = [];
    // Breakfast
    if (Math.sin(i) > -0.8) {
      const idx = Math.abs(Math.floor(Math.sin(i * 2) * 10)) % breakfasts.length;
      food.push({
        id: `fb-b-${i}`,
        name: breakfasts[idx].name,
        mealType: "breakfast",
        calories: breakfasts[idx].calories,
        time: "08:15 AM",
      });
    }
    // Lunch
    if (Math.cos(i) > -0.8) {
      const idx = Math.abs(Math.floor(Math.cos(i * 2) * 10)) % lunches.length;
      food.push({
        id: `fb-l-${i}`,
        name: lunches[idx].name,
        mealType: "lunch",
        calories: lunches[idx].calories,
        time: "01:10 PM",
      });
    }
    // Dinner
    if (Math.sin(i * 1.7) > -0.7) {
      const idx = Math.abs(Math.floor(Math.sin(i * 3) * 10)) % dinners.length;
      food.push({
        id: `fb-d-${i}`,
        name: dinners[idx].name,
        mealType: "dinner",
        calories: dinners[idx].calories,
        time: "07:30 PM",
      });
    }
    // Snack
    if (Math.cos(i * 1.5) > 0.1) {
      const idx = Math.abs(Math.floor(Math.cos(i * 3) * 10)) % snacks.length;
      food.push({
        id: `fb-s-${i}`,
        name: snacks[idx].name,
        mealType: "snack",
        calories: snacks[idx].calories,
        time: "04:30 PM",
      });
    }

    // Headaches (log on select days for realistic frequency)
    const headaches: HeadacheLog[] = [];
    if (i % 8 === 2) {
      headaches.push({
        id: `fb-h-${i}`,
        severity: Math.abs(Math.floor(Math.sin(i * 1.2) * 4)) + 4, // 4-8 severity
        duration: Math.abs(Math.floor(Math.cos(i) * 120)) + 60, // 60-180 mins
        triggers: i % 2 === 0 ? ["Stress", "Screen time"] : ["Dehydration", "Poor sleep"],
        notes: i % 2 === 0 
          ? "Tension headache behind temples due to heavy computer work." 
          : "Throbbing headache. Resolved slightly after a large glass of water.",
        time: "02:30 PM",
      });
    } else if (i === 1) { // Yesterday headache
      headaches.push({
        id: `fb-h-yesterday`,
        severity: 4,
        duration: 60,
        triggers: ["Screen time"],
        notes: "Dull ache behind eyes after 4 hours of continuous screen design work. Went away after a 20-minute walk.",
        time: "04:15 PM",
      });
    }

    // Arrhythmias (log on select days)
    const arrhythmias: ArrhythmiaLog[] = [];
    if (i % 11 === 4) {
      arrhythmias.push({
        id: `fb-a-${i}`,
        bpm: Math.abs(Math.floor(Math.sin(i * 1.4) * 30)) + 115, // 115-145 BPM
        duration: Math.abs(Math.floor(Math.cos(i * 0.9) * 8)) + 3, // 3-11 mins
        symptoms: ["Palpitations", "Lightheadedness"],
        severity: i % 3 === 0 ? "severe" : i % 3 === 1 ? "moderate" : "mild",
        notes: "Sudden heart racing sensation while seated reading email. Settled down with slow breathing.",
        time: "11:15 AM",
      });
    } else if (i === 1) { // Yesterday arrhythmia
      arrhythmias.push({
        id: `fb-a-yesterday`,
        bpm: 118,
        duration: 3,
        symptoms: ["Palpitations"],
        severity: "mild",
        notes: "Brief fluttering shortly after drinking morning coffee.",
        time: "09:30 AM",
      });
    }

    mock[dateStr] = {
      date: dateStr,
      sleep: { duration: sleepDuration, quality: sleepQuality },
      food,
      headaches,
      arrhythmias,
      mood,
    };
  }

  return mock;
};
