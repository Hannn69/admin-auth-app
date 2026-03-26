"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed.");
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-10 lg:flex">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 left-32 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative z-10 max-w-md">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">
              Admin Access
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white">
              Secure control starts here
            </h1>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              Short-lived access tokens with rotating refresh tokens keep your
              admin session safe while staying fast.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-12 lg:justify-start lg:px-10">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
            <div className="mb-6 rounded-xl bg-zinc-900 px-4 py-3 text-white lg:hidden">
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-300">
                Admin Access
              </p>
              <p className="mt-2 text-sm font-semibold">
                Secure control starts here
              </p>
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Sign in to admin
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Use your credentials to access the dashboard.
            </p>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Email
                <input
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
                Password
                <input
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <p className="mt-4 text-sm text-zinc-600">
              Need an account?{" "}
              <Link className="font-semibold text-zinc-900" href="/register">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
