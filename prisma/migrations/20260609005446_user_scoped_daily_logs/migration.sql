-- Remove any pre-auth DailyLog rows before adding the required userId.
-- Such rows (from the prior global-per-date schema) have no owning user and
-- cannot be backfilled; child rows cascade via their FKs. In practice the table
-- has always been empty (data lived in localStorage), so this is a safeguard
-- that keeps `prisma migrate deploy` from failing on the NOT NULL column.
DELETE FROM "DailyLog";

-- DropIndex
DROP INDEX "DailyLog_date_key";

-- AlterTable
ALTER TABLE "DailyLog" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "DailyLog_userId_idx" ON "DailyLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
