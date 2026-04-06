"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SpaceSettingsContent } from "@/components/dashboard/SpaceSettingsContent";

export default function SpaceSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const spaceId = Array.isArray(params?.spaceId)
    ? params.spaceId[0]
    : params?.spaceId;

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
    <div className="relative min-h-screen overflow-hidden bg-[#0b0c10] text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-[-120px] top-12 h-96 w-96 rounded-full bg-slate-400/10 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[35%] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen w-full gap-6 px-4 py-6 sm:px-6">
        <DashboardSidebar />

        <div className="flex flex-1 flex-col gap-6">
          <DashboardHeader loading={loading} email={email} title="Spaces" />
          {spaceId ? <SpaceSettingsContent spaceId={spaceId} /> : null}
        </div>
      </div>
    </div>
  );
}
