"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addArrhythmiaAction,
  addFoodAction,
  addHeadacheAction,
  deleteArrhythmiaAction,
  deleteFoodAction,
  deleteHeadacheAction,
  fetchLogs,
  updateMoodAction,
  updateSleepAction,
} from "@/actions/health";
import {
  calculateSleepQuality,
  formatLocalTimeOfDay,
  getOffsetDateString,
} from "@/lib/health-utils";
import type {
  ArrhythmiaLog,
  DailyLog,
  FoodLog,
  HeadacheLog,
  LogsByDate,
  MealType,
  SleepLog,
} from "@/lib/health-types";

// Re-exported so existing component imports keep working unchanged.
export type { ArrhythmiaLog, DailyLog, FoodLog, HeadacheLog, MealType, SleepLog };
export { calculateSleepQuality, getOffsetDateString };

interface HealthContextType {
  logs: LogsByDate;
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

const createEmptyLog = (date: string): DailyLog => ({
  date,
  food: [],
  headaches: [],
  arrhythmias: [],
});

export const HealthProvider: React.FC<{
  children: React.ReactNode;
  userId: string;
  initialLogs: LogsByDate;
}> = ({ children, userId, initialLogs }) => {
  const queryClient = useQueryClient();
  const queryKey = ["logs", userId] as const;
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Initialize the selected date on the client to avoid SSR/timezone mismatch.
  useEffect(() => {
    setSelectedDate(getOffsetDateString(0));
  }, []);

  const { data: logs = {} } = useQuery({
    queryKey,
    queryFn: fetchLogs,
    initialData: initialLogs,
  });

  /**
   * Apply an optimistic update to the cache, run the server action, then
   * revalidate. The public action functions stay sync/void so consumer
   * components are unchanged.
   *
   * Reconciliation (success or failure) is via `invalidateQueries`, not a
   * whole-cache snapshot restore: refetching authoritative server state undoes a
   * failed change while preserving any other in-flight mutation's optimistic
   * edits (a snapshot restore would clobber them).
   */
  const runMutation = (
    updater: (prev: LogsByDate) => LogsByDate,
    serverCall: () => Promise<unknown>,
  ) => {
    void (async () => {
      // Cancel in-flight refetches so they can't overwrite the optimistic update.
      await queryClient.cancelQueries({ queryKey });
      // Functional update over the *current* cache, so concurrent mutations stack.
      queryClient.setQueryData<LogsByDate>(queryKey, (prev) => updater(prev ?? {}));
      try {
        await serverCall();
      } catch (error) {
        console.error("Health update failed", error);
      } finally {
        queryClient.invalidateQueries({ queryKey });
      }
    })();
  };

  const updateSleep = (date: string, duration: number) => {
    runMutation(
      (prev) => {
        const day = prev[date] ?? createEmptyLog(date);
        return {
          ...prev,
          [date]: { ...day, sleep: { duration, quality: calculateSleepQuality(duration) } },
        };
      },
      () => updateSleepAction({ date, duration }),
    );
  };

  const updateMood = (date: string, mood: number) => {
    runMutation(
      (prev) => {
        const day = prev[date] ?? createEmptyLog(date);
        return { ...prev, [date]: { ...day, mood } };
      },
      () => updateMoodAction({ date, mood }),
    );
  };

  const addFood = (date: string, name: string, mealType: FoodLog["mealType"], calories?: number) => {
    const time = formatLocalTimeOfDay();
    // A client-generated id is persisted as-is, so the optimistic item and the
    // DB row share one id — a follow-up delete works without waiting for refetch.
    const id = crypto.randomUUID();
    const food: FoodLog = { id, name, mealType, calories, time };
    runMutation(
      (prev) => {
        const day = prev[date] ?? createEmptyLog(date);
        return { ...prev, [date]: { ...day, food: [...day.food, food] } };
      },
      () => addFoodAction({ id, date, name, mealType, calories, time }),
    );
  };

  const deleteFood = (date: string, id: string) => {
    runMutation(
      (prev) => {
        const day = prev[date];
        if (!day) return prev;
        return { ...prev, [date]: { ...day, food: day.food.filter((f) => f.id !== id) } };
      },
      () => deleteFoodAction({ id }),
    );
  };

  const addHeadache = (
    date: string,
    severity: number,
    duration: number,
    triggers: string[],
    notes: string,
  ) => {
    const time = formatLocalTimeOfDay();
    const id = crypto.randomUUID();
    const headache: HeadacheLog = { id, severity, duration, triggers, notes, time };
    runMutation(
      (prev) => {
        const day = prev[date] ?? createEmptyLog(date);
        return { ...prev, [date]: { ...day, headaches: [...day.headaches, headache] } };
      },
      () => addHeadacheAction({ id, date, severity, duration, triggers, notes, time }),
    );
  };

  const deleteHeadache = (date: string, id: string) => {
    runMutation(
      (prev) => {
        const day = prev[date];
        if (!day) return prev;
        return { ...prev, [date]: { ...day, headaches: day.headaches.filter((h) => h.id !== id) } };
      },
      () => deleteHeadacheAction({ id }),
    );
  };

  const addArrhythmia = (
    date: string,
    bpm: number,
    duration: number,
    symptoms: string[],
    severity: ArrhythmiaLog["severity"],
    notes: string,
  ) => {
    const time = formatLocalTimeOfDay();
    const id = crypto.randomUUID();
    const arrhythmia: ArrhythmiaLog = { id, bpm, duration, symptoms, severity, notes, time };
    runMutation(
      (prev) => {
        const day = prev[date] ?? createEmptyLog(date);
        return { ...prev, [date]: { ...day, arrhythmias: [...day.arrhythmias, arrhythmia] } };
      },
      () => addArrhythmiaAction({ id, date, bpm, duration, symptoms, severity, notes, time }),
    );
  };

  const deleteArrhythmia = (date: string, id: string) => {
    runMutation(
      (prev) => {
        const day = prev[date];
        if (!day) return prev;
        return { ...prev, [date]: { ...day, arrhythmias: day.arrhythmias.filter((a) => a.id !== id) } };
      },
      () => deleteArrhythmiaAction({ id }),
    );
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
