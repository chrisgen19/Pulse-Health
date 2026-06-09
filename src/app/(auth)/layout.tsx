import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// A stylized ECG / heart-monitor trace used as the brand signature.
const ECG_PATH = "M0,40 H92 l5,0 l5,-8 l5,8 l4,4 l5,-34 l6,46 l5,-22 l6,6 H260";

/**
 * Standalone shell for the auth routes (/login, /register): a split layout with
 * a brand story + animated pulse trace on the left and the form on the right,
 * collapsing to a single centered column on mobile.
 *
 * Validates the session server-side: a genuinely signed-in user is sent to the
 * app. Gating is server-side only (no middleware) and uses the same
 * auth.api.getSession as the protected page, so the two checks can never
 * disagree — a stale/invalid cookie simply renders the auth page (no loop).
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/");
  }

  return (
    <div className="auth-shell">
      <div className="auth-bg" aria-hidden />

      <aside className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo auth-reveal">
            <span className="auth-logo-orb" />
            <span className="auth-logo-text">PulseHealth</span>
          </div>

          <h2 className="auth-tagline auth-reveal" style={{ animationDelay: "0.08s" }}>
            Every signal your body sends, <em>in one rhythm.</em>
          </h2>

          <div
            className="auth-ecg auth-reveal"
            style={{ animationDelay: "0.16s" }}
            aria-hidden
          >
            <svg viewBox="0 0 260 80" preserveAspectRatio="none">
              <path className="auth-ecg-base" d={ECG_PATH} />
              <path className="auth-ecg-pulse" d={ECG_PATH} pathLength={1} />
            </svg>
          </div>

          <ul className="auth-points auth-reveal" style={{ animationDelay: "0.24s" }}>
            <li>
              <span className="dot dot-sleep" /> Sleep quality, mood &amp; daily energy
            </li>
            <li>
              <span className="dot dot-headache" /> Headache triggers &amp; patterns
            </li>
            <li>
              <span className="dot dot-arrhythmia" /> Arrhythmia episodes &amp; BPM
            </li>
          </ul>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-mobile-brand auth-reveal">
          <span className="auth-logo-orb" />
          <span className="auth-logo-text">PulseHealth</span>
        </div>
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
