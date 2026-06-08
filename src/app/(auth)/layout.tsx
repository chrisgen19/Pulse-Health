import type { ReactNode } from "react";

/**
 * Standalone shell for the auth routes (/login, /register) — a centered card on
 * the app's dark gradient background, without the main app navigation.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "var(--bg-app-gradient)" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{
              background: "var(--color-sleep-gradient)",
              boxShadow: "0 0 10px rgba(99, 102, 241, 0.6)",
            }}
          />
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            PulseHealth
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
