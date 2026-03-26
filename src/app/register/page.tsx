"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed.");
      }

      setSuccess("Account created. You can sign in now.");
      setEmail("");
      setPassword("");
      setTimeout(() => router.push("/signin"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-10 lg:flex">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 left-32 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative z-10 max-w-md">
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">
              Admin Access
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white">
              Create your secure admin account
            </h1>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              Register with a strong password to unlock the protected dashboard
              and manage your workspace with confidence.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-12 lg:justify-start lg:px-10">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-8 shadow-2xl">
            <div className="mb-6 rounded-xl bg-zinc-950 px-4 py-3 text-white lg:hidden">
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-300">
                Admin Access
              </p>
              <p className="mt-2 text-sm font-semibold">
                Create your secure admin account
              </p>
            </div>
            <h1 className="text-2xl font-semibold text-white">Create account</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Register to access the admin dashboard.
            </p>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
                Email
                <input
                  className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-white/40 focus:outline-none"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
                Password
                <input
                  className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-white/40 focus:outline-none"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />
              </label>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              {success ? (
                <p className="text-sm text-emerald-400">{success}</p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 disabled:opacity-70"
              >
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>
            <p className="mt-4 text-sm text-zinc-400">
              Already have an account?{" "}
              <Link className="font-semibold text-white" href="/signin">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
