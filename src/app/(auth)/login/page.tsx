"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { signIn } from "@/lib/auth-client";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await signIn.email(parsed.data);
      if (authError) {
        setError(authError.message ?? "Unable to sign in");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="auth-title auth-reveal" style={{ animationDelay: "0.05s" }}>
        Welcome back
      </h1>
      <p className="auth-subtitle auth-reveal" style={{ animationDelay: "0.1s" }}>
        Sign in to continue tracking your health.
      </p>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="auth-field-group auth-reveal" style={{ animationDelay: "0.15s" }}>
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="auth-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="auth-field-group auth-reveal" style={{ animationDelay: "0.2s" }}>
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="auth-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="auth-submit auth-reveal"
          style={{ animationDelay: "0.25s" }}
        >
          {loading && <Loader2 className="auth-spin" size={18} />}
          Sign in
        </button>
      </form>

      <p className="auth-foot auth-reveal" style={{ animationDelay: "0.3s" }}>
        Don&apos;t have an account? <Link href="/register">Create one</Link>
      </p>
    </>
  );
}
