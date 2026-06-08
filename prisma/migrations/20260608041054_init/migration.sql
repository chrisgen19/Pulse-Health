-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "ArrhythmiaSeverity" AS ENUM ('mild', 'moderate', 'severe');

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mood" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepLog" (
    "id" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "quality" INTEGER NOT NULL,
    "dailyLogId" TEXT NOT NULL,

    CONSTRAINT "SleepLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodLog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "calories" INTEGER,
    "time" TIME(0) NOT NULL,
    "dailyLogId" TEXT NOT NULL,

    CONSTRAINT "FoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeadacheLog" (
    "id" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "triggers" TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "time" TIME(0) NOT NULL,
    "dailyLogId" TEXT NOT NULL,

    CONSTRAINT "HeadacheLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrhythmiaLog" (
    "id" TEXT NOT NULL,
    "bpm" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "symptoms" TEXT[],
    "severity" "ArrhythmiaSeverity" NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "time" TIME(0) NOT NULL,
    "dailyLogId" TEXT NOT NULL,

    CONSTRAINT "ArrhythmiaLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_date_key" ON "DailyLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SleepLog_dailyLogId_key" ON "SleepLog"("dailyLogId");

-- CreateIndex
CREATE INDEX "FoodLog_dailyLogId_idx" ON "FoodLog"("dailyLogId");

-- CreateIndex
CREATE INDEX "HeadacheLog_dailyLogId_idx" ON "HeadacheLog"("dailyLogId");

-- CreateIndex
CREATE INDEX "ArrhythmiaLog_dailyLogId_idx" ON "ArrhythmiaLog"("dailyLogId");

-- AddForeignKey
ALTER TABLE "SleepLog" ADD CONSTRAINT "SleepLog_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodLog" ADD CONSTRAINT "FoodLog_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeadacheLog" ADD CONSTRAINT "HeadacheLog_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrhythmiaLog" ADD CONSTRAINT "ArrhythmiaLog_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
