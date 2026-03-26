"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { RefreshButton } from "@/components/RefreshButton";

export default function DashboardPage() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        if (active) {
          setEmail(data.user?.email ?? null);
        }
      } catch {
        router.replace("/signin");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUser();
    return () => {
      active = false;
    };
  }, [apiBase, router]);

  return (
    <div className="min-h-screen bg-zinc-900 px-6 py-12 text-zinc-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Admin Dashboard
          </p>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-zinc-300">
            {loading
              ? "Loading session..."
              : `Signed in as `}
            {!loading && email ? (
              <span className="font-semibold">{email}</span>
            ) : null}
          </p>
        </header>

        <section className="grid gap-4 rounded-2xl bg-zinc-800 p-6">
          <p className="text-sm text-zinc-200">
            You now have access to protected admin content.
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Session status</p>
              <p className="text-xs text-zinc-400">Access token verified.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <RefreshButton />
              <LogoutButton />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
