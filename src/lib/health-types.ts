// Shared health-log data types (UI shape). Kept in a neutral module so both the
// client context and the server data layer can use them without crossing the
// "use client" boundary. Re-exported from src/context/HealthContext.tsx for
// existing component imports.

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type ArrhythmiaSeverity = "mild" | "moderate" | "severe";

export interface FoodLog {
  id: string;
  name: string;
  mealType: MealType;
  calories?: number;
  time: string; // e.g. "08:15 AM"
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
  severity: ArrhythmiaSeverity;
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

/** Logs keyed by date string (YYYY-MM-DD). */
export type LogsByDate = Record<string, DailyLog>;
