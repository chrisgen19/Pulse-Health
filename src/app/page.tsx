import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HealthApp } from "@/components/health-app";

/**
 * Protected app entry. This server-side session check is authoritative — it
 * validates the session against the database before rendering, so a stale or
 * forged cookie can't reach the health-tracking UI. The auth pages run the same
 * check in reverse, so the two never disagree (no redirect loops).
 */
export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return <HealthApp userId={session.user.id} />;
}
