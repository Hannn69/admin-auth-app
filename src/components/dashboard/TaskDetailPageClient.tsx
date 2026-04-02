"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TaskDetailContent } from "@/components/dashboard/TaskDetailContent";
import { UpdateTaskModal } from "@/components/dashboard/UpdateTaskModal";

type TaskDetailPageClientProps = {
  slug: string;
};

export function TaskDetailPageClient({ slug }: TaskDetailPageClientProps) {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

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
    const loadTask = async () => {
      try {
        const res = await fetch(`${apiBase}/task/detail/${slug}`, {
          credentials: "include",
        });
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        if (active) {
          setTask(data.task ?? null);
        }
      } catch {
        // ignore task load errors
      }
    };
    loadTask();
    const handler = () => loadTask();
    window.addEventListener("task:updated", handler);
    return () => {
      window.removeEventListener("task:updated", handler);
      active = false;
    };
  }, [apiBase, router, slug]);

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0b0c10] text-zinc-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute right-[-120px] top-12 h-96 w-96 rounded-full bg-slate-400/10 blur-3xl" />
          <div className="absolute bottom-[-140px] left-[35%] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative flex min-h-screen w-full gap-6 px-4 py-6 sm:px-6">
          <DashboardSidebar />

          <div className="flex flex-1 flex-col gap-6">
            <DashboardHeader
              loading={loading}
              email={email}
              title="Task details"
            />
            <TaskDetailContent
              slug={slug}
              task={task}
              onEdit={() => setEditOpen(true)}
            />
          </div>
        </div>
      </div>
      <UpdateTaskModal
        open={editOpen}
        task={task}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
