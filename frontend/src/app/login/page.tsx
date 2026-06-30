"use client";

import { useState } from "react";
import { useUser } from "@components/context/UserContext";
import { apiClient } from "@lib/api-client";
import { AuthFrame } from "@components/auth/AuthFrame";

export default function LoginPage() {
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient.login({ email, password });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", String(data.token));
        setUser(data.user);

        const recentShortens = JSON.parse(localStorage.getItem("recent_shortens") || "[]");
        if (recentShortens.length > 0) {
          await apiClient.migrateShortens(recentShortens, data.token);
          localStorage.removeItem("recent_shortens");
        }
      }

      window.location.assign("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      title="Welcome back"
      footerQuestion="Need an account?"
      footerLinkHref="/signup"
      footerLinkText="Sign up"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="field-label uppercase tracking-[0.22em]">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="name@company.com"
              autoComplete="email"
              suppressHydrationWarning
              required
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="password" className="field-label mb-0 uppercase tracking-[0.22em]">
                Password
              </label>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="••••••••"
              autoComplete="current-password"
              suppressHydrationWarning
              required
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/15 bg-slate-950/70 text-cyan-400 focus:ring-cyan-300/30"
                autoComplete="on"
                suppressHydrationWarning
              />
              Remember this device
            </label>
          </div>

          {error && (
            <p className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="primary-button w-full">
            {loading ? "Logging in..." : "Sign in"}
          </button>
        </form>
      </div>
    </AuthFrame>
  );
}
