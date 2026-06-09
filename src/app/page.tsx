import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HealthApp } from "@/components/health-app";
import { getDailyLogs, seedDemoData, userHasLogs } from "@/lib/dal";

/**
 * Protected app entry. This server-side session check is authoritative — it
 * validates the session against the database before rendering, so a stale or
 * forged cookie can't reach the health-tracking UI. The auth pages run the same
 * check in reverse, so the two never disagree (no redirect loops).
 *
 * Loads the user's logs from the DB (seeding demo data on first login) and
 * hydrates the client query so there's no loading flash.
 */
export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;
  if (!(await userHasLogs(userId))) {
    await seedDemoData(userId);
  }
  const initialLogs = await getDailyLogs(userId);

  return <HealthApp userId={userId} initialLogs={initialLogs} />;
}
