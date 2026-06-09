// Data access layer — the single place that talks to Prisma for health logs.
// All functions are user-scoped. DB DATE/TIME columns are mapped to/from the
// client display strings via src/lib/health-utils.

import { prisma } from "@/lib/prisma";
import type {
  ArrhythmiaSeverity,
  DailyLog,
  LogsByDate,
  MealType,
} from "@/lib/health-types";
import {
  calculateSleepQuality,
  formatDateOnly,
  formatTimeOfDay,
  getOffsetDateString,
  parseDateOnly,
  parseTimeOfDay,
} from "@/lib/health-utils";

/* ------------------------------- Reads -------------------------------- */

export async function getDailyLogs(userId: string): Promise<LogsByDate> {
  const days = await prisma.dailyLog.findMany({
    where: { userId },
    include: { sleep: true, food: true, headaches: true, arrhythmias: true },
    orderBy: { date: "asc" },
  });

  const result: LogsByDate = {};
  for (const day of days) {
    const date = formatDateOnly(day.date);
    result[date] = {
      date,
      mood: day.mood ?? undefined,
      sleep: day.sleep
        ? { duration: day.sleep.duration, quality: day.sleep.quality }
        : undefined,
      food: day.food.map((f) => ({
        id: f.id,
        name: f.name,
        mealType: f.mealType as MealType,
        calories: f.calories ?? undefined,
        time: formatTimeOfDay(f.time),
      })),
      headaches: day.headaches.map((h) => ({
        id: h.id,
        severity: h.severity,
        duration: h.duration,
        triggers: h.triggers,
        notes: h.notes,
        time: formatTimeOfDay(h.time),
      })),
      arrhythmias: day.arrhythmias.map((a) => ({
        id: a.id,
        bpm: a.bpm,
        duration: a.duration,
        symptoms: a.symptoms,
        severity: a.severity as ArrhythmiaSeverity,
        notes: a.notes,
        time: formatTimeOfDay(a.time),
      })),
    };
  }
  return result;
}

export async function userHasLogs(userId: string): Promise<boolean> {
  const count = await prisma.dailyLog.count({ where: { userId } });
  return count > 0;
}

/* ----------------------------- Mutations ------------------------------ */

/** Ensure the user's DailyLog row for `date` exists; returns its id. */
async function ensureDay(userId: string, date: string): Promise<string> {
  const day = await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: parseDateOnly(date) } },
    create: { userId, date: parseDateOnly(date) },
    update: {},
    select: { id: true },
  });
  return day.id;
}

export async function upsertSleep(userId: string, date: string, duration: number) {
  const quality = calculateSleepQuality(duration);
  const dailyLogId = await ensureDay(userId, date);
  await prisma.sleepLog.upsert({
    where: { dailyLogId },
    create: { dailyLogId, duration, quality },
    update: { duration, quality },
  });
}

export async function updateMood(userId: string, date: string, mood: number) {
  await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: parseDateOnly(date) } },
    create: { userId, date: parseDateOnly(date), mood },
    update: { mood },
  });
}

export async function addFood(
  userId: string,
  date: string,
  input: { name: string; mealType: MealType; calories?: number; time: string },
) {
  const dailyLogId = await ensureDay(userId, date);
  await prisma.foodLog.create({
    data: {
      dailyLogId,
      name: input.name,
      mealType: input.mealType,
      calories: input.calories ?? null,
      time: parseTimeOfDay(input.time),
    },
  });
}

export async function deleteFood(userId: string, id: string) {
  // deleteMany with the user-scoped relation guards against deleting another
  // user's row even if an id is guessed.
  await prisma.foodLog.deleteMany({ where: { id, dailyLog: { userId } } });
}

export async function addHeadache(
  userId: string,
  date: string,
  input: {
    severity: number;
    duration: number;
    triggers: string[];
    notes: string;
    time: string;
  },
) {
  const dailyLogId = await ensureDay(userId, date);
  await prisma.headacheLog.create({
    data: {
      dailyLogId,
      severity: input.severity,
      duration: input.duration,
      triggers: input.triggers,
      notes: input.notes,
      time: parseTimeOfDay(input.time),
    },
  });
}

export async function deleteHeadache(userId: string, id: string) {
  await prisma.headacheLog.deleteMany({ where: { id, dailyLog: { userId } } });
}

export async function addArrhythmia(
  userId: string,
  date: string,
  input: {
    bpm: number;
    duration: number;
    symptoms: string[];
    severity: ArrhythmiaSeverity;
    notes: string;
    time: string;
  },
) {
  const dailyLogId = await ensureDay(userId, date);
  await prisma.arrhythmiaLog.create({
    data: {
      dailyLogId,
      bpm: input.bpm,
      duration: input.duration,
      symptoms: input.symptoms,
      severity: input.severity,
      notes: input.notes,
      time: parseTimeOfDay(input.time),
    },
  });
}

export async function deleteArrhythmia(userId: string, id: string) {
  await prisma.arrhythmiaLog.deleteMany({ where: { id, dailyLog: { userId } } });
}

/* ------------------------------- Seed --------------------------------- */

/** Write ~30 days of demo data for a brand-new user (one DB write per day). */
export async function seedDemoData(userId: string) {
  const days = buildSeedLogs();
  await prisma.$transaction(
    days.map((day) =>
      prisma.dailyLog.create({
        data: {
          userId,
          date: parseDateOnly(day.date),
          mood: day.mood ?? null,
          sleep: day.sleep
            ? { create: { duration: day.sleep.duration, quality: day.sleep.quality } }
            : undefined,
          food: {
            create: day.food.map((f) => ({
              name: f.name,
              mealType: f.mealType,
              calories: f.calories ?? null,
              time: parseTimeOfDay(f.time),
            })),
          },
          headaches: {
            create: day.headaches.map((h) => ({
              severity: h.severity,
              duration: h.duration,
              triggers: h.triggers,
              notes: h.notes,
              time: parseTimeOfDay(h.time),
            })),
          },
          arrhythmias: {
            create: day.arrhythmias.map((a) => ({
              bpm: a.bpm,
              duration: a.duration,
              symptoms: a.symptoms,
              severity: a.severity,
              notes: a.notes,
              time: parseTimeOfDay(a.time),
            })),
          },
        },
      }),
    ),
  );
}

/** Deterministic ~30 days of sample logs (ids are placeholders; DB assigns real ones). */
function buildSeedLogs(): DailyLog[] {
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

  const days: DailyLog[] = [];

  for (let i = 29; i >= 0; i--) {
    const dateStr = getOffsetDateString(i);
    const dayOfWeek = new Date(dateStr).getDay();

    const sleepBase = dayOfWeek === 0 || dayOfWeek === 6 ? 7.9 : 6.9;
    const sleepDuration = Math.round((sleepBase + Math.sin(i * 1.5) * 1.1) * 10) / 10;
    const sleepQuality = calculateSleepQuality(sleepDuration);

    let mood = 3;
    if (sleepDuration >= 7.5) mood = 5;
    else if (sleepDuration >= 6.8) mood = 4;
    else if (sleepDuration >= 6.0) mood = 3;
    else mood = 2;
    if (Math.cos(i) > 0.6) mood = Math.min(5, mood + 1);
    if (Math.sin(i) < -0.6) mood = Math.max(1, mood - 1);

    const food: DailyLog["food"] = [];
    if (Math.sin(i) > -0.8) {
      const idx = Math.abs(Math.floor(Math.sin(i * 2) * 10)) % breakfasts.length;
      food.push({ id: `b-${i}`, name: breakfasts[idx].name, mealType: "breakfast", calories: breakfasts[idx].calories, time: "08:15 AM" });
    }
    if (Math.cos(i) > -0.8) {
      const idx = Math.abs(Math.floor(Math.cos(i * 2) * 10)) % lunches.length;
      food.push({ id: `l-${i}`, name: lunches[idx].name, mealType: "lunch", calories: lunches[idx].calories, time: "01:10 PM" });
    }
    if (Math.sin(i * 1.7) > -0.7) {
      const idx = Math.abs(Math.floor(Math.sin(i * 3) * 10)) % dinners.length;
      food.push({ id: `d-${i}`, name: dinners[idx].name, mealType: "dinner", calories: dinners[idx].calories, time: "07:30 PM" });
    }
    if (Math.cos(i * 1.5) > 0.1) {
      const idx = Math.abs(Math.floor(Math.cos(i * 3) * 10)) % snacks.length;
      food.push({ id: `s-${i}`, name: snacks[idx].name, mealType: "snack", calories: snacks[idx].calories, time: "04:30 PM" });
    }

    const headaches: DailyLog["headaches"] = [];
    if (i % 8 === 2) {
      headaches.push({
        id: `h-${i}`,
        severity: Math.abs(Math.floor(Math.sin(i * 1.2) * 4)) + 4,
        duration: Math.abs(Math.floor(Math.cos(i) * 120)) + 60,
        triggers: i % 2 === 0 ? ["Stress", "Screen time"] : ["Dehydration", "Poor sleep"],
        notes:
          i % 2 === 0
            ? "Tension headache behind temples due to heavy computer work."
            : "Throbbing headache. Resolved slightly after a large glass of water.",
        time: "02:30 PM",
      });
    } else if (i === 1) {
      headaches.push({
        id: "h-yesterday",
        severity: 4,
        duration: 60,
        triggers: ["Screen time"],
        notes:
          "Dull ache behind eyes after 4 hours of continuous screen design work. Went away after a 20-minute walk.",
        time: "04:15 PM",
      });
    }

    const arrhythmias: DailyLog["arrhythmias"] = [];
    if (i % 11 === 4) {
      arrhythmias.push({
        id: `a-${i}`,
        bpm: Math.abs(Math.floor(Math.sin(i * 1.4) * 30)) + 115,
        duration: Math.abs(Math.floor(Math.cos(i * 0.9) * 8)) + 3,
        symptoms: ["Palpitations", "Lightheadedness"],
        severity: i % 3 === 0 ? "severe" : i % 3 === 1 ? "moderate" : "mild",
        notes: "Sudden heart racing sensation while seated reading email. Settled down with slow breathing.",
        time: "11:15 AM",
      });
    } else if (i === 1) {
      arrhythmias.push({
        id: "a-yesterday",
        bpm: 118,
        duration: 3,
        symptoms: ["Palpitations"],
        severity: "mild",
        notes: "Brief fluttering shortly after drinking morning coffee.",
        time: "09:30 AM",
      });
    }

    days.push({
      date: dateStr,
      sleep: { duration: sleepDuration, quality: sleepQuality },
      food,
      headaches,
      arrhythmias,
      mood,
    });
  }

  return days;
}
