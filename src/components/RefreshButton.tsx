"use client";

import { useState } from "react";

export function RefreshButton() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`${apiBase}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Refresh failed.");
      }
      setStatus("Session refreshed.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Refresh failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleRefresh}
        className="rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh session"}
      </button>
      {status ? <p className="text-xs text-zinc-300">{status}</p> : null}
    </div>
  );
}
