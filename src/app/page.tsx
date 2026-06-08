import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HealthApp } from "@/components/health-app";

/**
 * Protected app entry. The middleware does an optimistic cookie redirect, but
 * this server-side check is authoritative: it validates the session against the
 * database before rendering, so a stale or forged session cookie can't reach the
 * health-tracking UI.
 */
export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return <HealthApp />;
}
