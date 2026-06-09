"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import * as dal from "@/lib/dal";
import type { LogsByDate } from "@/lib/health-types";

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
}

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
const timeSchema = z.string().min(1);
const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);
const severitySchema = z.enum(["mild", "moderate", "severe"]);

/** Query function for TanStack Query — returns the signed-in user's logs. */
export async function fetchLogs(): Promise<LogsByDate> {
  const userId = await requireUserId();
  return dal.getDailyLogs(userId);
}

export async function updateSleepAction(input: { date: string; duration: number }) {
  const userId = await requireUserId();
  const { date, duration } = z
    .object({ date: dateSchema, duration: z.number().min(0).max(24) })
    .parse(input);
  await dal.upsertSleep(userId, date, duration);
}

export async function updateMoodAction(input: { date: string; mood: number }) {
  const userId = await requireUserId();
  const { date, mood } = z
    .object({ date: dateSchema, mood: z.number().int().min(1).max(5) })
    .parse(input);
  await dal.updateMood(userId, date, mood);
}

export async function addFoodAction(input: {
  date: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories?: number;
  time: string;
}) {
  const userId = await requireUserId();
  const data = z
    .object({
      date: dateSchema,
      name: z.string().min(1),
      mealType: mealTypeSchema,
      calories: z.number().int().min(0).optional(),
      time: timeSchema,
    })
    .parse(input);
  await dal.addFood(userId, data.date, data);
}

export async function deleteFoodAction(input: { id: string }) {
  const userId = await requireUserId();
  const { id } = z.object({ id: z.string().min(1) }).parse(input);
  await dal.deleteFood(userId, id);
}

export async function addHeadacheAction(input: {
  date: string;
  severity: number;
  duration: number;
  triggers: string[];
  notes: string;
  time: string;
}) {
  const userId = await requireUserId();
  const data = z
    .object({
      date: dateSchema,
      severity: z.number().int().min(1).max(10),
      duration: z.number().int().min(0),
      triggers: z.array(z.string()),
      notes: z.string(),
      time: timeSchema,
    })
    .parse(input);
  await dal.addHeadache(userId, data.date, data);
}

export async function deleteHeadacheAction(input: { id: string }) {
  const userId = await requireUserId();
  const { id } = z.object({ id: z.string().min(1) }).parse(input);
  await dal.deleteHeadache(userId, id);
}

export async function addArrhythmiaAction(input: {
  date: string;
  bpm: number;
  duration: number;
  symptoms: string[];
  severity: "mild" | "moderate" | "severe";
  notes: string;
  time: string;
}) {
  const userId = await requireUserId();
  const data = z
    .object({
      date: dateSchema,
      bpm: z.number().int().min(0),
      duration: z.number().int().min(0),
      symptoms: z.array(z.string()),
      severity: severitySchema,
      notes: z.string(),
      time: timeSchema,
    })
    .parse(input);
  await dal.addArrhythmia(userId, data.date, data);
}

export async function deleteArrhythmiaAction(input: { id: string }) {
  const userId = await requireUserId();
  const { id } = z.object({ id: z.string().min(1) }).parse(input);
  await dal.deleteArrhythmia(userId, id);
}
