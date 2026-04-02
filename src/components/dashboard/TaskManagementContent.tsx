"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UpdateTaskModal } from "@/components/dashboard/UpdateTaskModal";
import { DeleteTaskModal } from "@/components/dashboard/DeleteTaskModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const seedTasks = [
  {
    key: "TASK-101",
    slug: "task-101",
    summary: "Finalize admin role permissions matrix",
    status: "In progress",
    priority: "High",
    assignee: "S. Carter",
    updated: "2h ago",
    space: "task (TASK)",
    workType: "Task",
    description: "",
    reporter: "sonvirak",
    labels: "",
    dueDate: "",
    startDate: "",
    category: "",
    team: "",
  },
  {
    key: "TASK-102",
    slug: "task-102",
    summary: "Add MFA enrollment flow",
    status: "To do",
    priority: "Medium",
    assignee: "J. Nguyen",
    updated: "6h ago",
    space: "task (TASK)",
    workType: "Task",
    description: "",
    reporter: "sonvirak",
    labels: "",
    dueDate: "",
    startDate: "",
    category: "",
    team: "",
  },
  {
    key: "TASK-103",
    slug: "task-103",
    summary: "Audit login attempts export",
    status: "Review",
    priority: "High",
    assignee: "M. Patel",
    updated: "1d ago",
    space: "task (TASK)",
    workType: "Task",
    description: "",
    reporter: "sonvirak",
    labels: "",
    dueDate: "",
    startDate: "",
    category: "",
    team: "",
  },
  {
    key: "TASK-104",
    slug: "task-104",
    summary: "Update dashboard onboarding tips",
    status: "Done",
    priority: "Low",
    assignee: "R. Blake",
    updated: "2d ago",
    space: "task (TASK)",
    workType: "Task",
    description: "",
    reporter: "sonvirak",
    labels: "",
    dueDate: "",
    startDate: "",
    category: "",
    team: "",
  },
  {
    key: "TASK-105",
    slug: "task-105",
    summary: "Improve refresh token rotation logs",
    status: "In progress",
    priority: "Medium",
    assignee: "T. Silva",
    updated: "3d ago",
    space: "task (TASK)",
    workType: "Task",
    description: "",
    reporter: "sonvirak",
    labels: "",
    dueDate: "",
    startDate: "",
    category: "",
    team: "",
  },
];

const statusStyles: Record<string, string> = {
  "To do": "bg-slate-500/15 text-slate-200",
  "In progress": "bg-amber-500/15 text-amber-200",
  Review: "bg-blue-500/15 text-blue-200",
  Done: "bg-emerald-500/15 text-emerald-200",
};

const priorityStyles: Record<string, string> = {
  High: "bg-rose-500/15 text-rose-200",
  Medium: "bg-amber-500/15 text-amber-200",
  Low: "bg-emerald-500/15 text-emerald-200",
};

export function TaskManagementContent() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [tasks, setTasks] = useState<typeof seedTasks>(seedTasks);
  const [total, setTotal] = useState(seedTasks.length);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sort, setSort] = useState("updatedAt");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editTask, setEditTask] = useState<(typeof seedTasks)[number] | null>(
    null
  );
  const [deleteTask, setDeleteTask] = useState<
    (typeof seedTasks)[number] | null
  >(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          sort,
          order,
        });
        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch.trim());
        }
        if (statusFilter !== "All") {
          params.set("status", statusFilter);
        }
        const res = await fetch(`${apiBase}/tasks?${params.toString()}`, {
          credentials: "include",
        });
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data.tasks)) {
          return;
        }
        const mapped = data.tasks.map((task: any) => ({
          key: task.key,
          slug: task.slug,
          summary: task.summary,
          status: task.status,
          priority: task.priority ?? "Medium",
          assignee: task.assignee ?? "Unassigned",
          updated: formatRelative(task.updatedAt ?? task.createdAt),
          space: task.space ?? "task (TASK)",
          workType: task.workType ?? "Task",
          description: task.description ?? "",
          reporter: task.reporter ?? "",
          labels: task.labels ?? "",
          dueDate: task.dueDate ?? "",
          startDate: task.startDate ?? "",
          category: task.category ?? "",
          team: task.team ?? "",
        }));
        if (mapped.length) {
          setTasks(mapped);
        }
        if (typeof data.total === "number") {
          setTotal(data.total);
        }
      } catch {
        // keep seed tasks on failure
      }
    };

    loadTasks();
    const handler = () => loadTasks();
    window.addEventListener("task:created", handler);
    window.addEventListener("task:updated", handler);
    window.addEventListener("task:deleted", handler);
    return () => {
      window.removeEventListener("task:created", handler);
      window.removeEventListener("task:updated", handler);
      window.removeEventListener("task:deleted", handler);
    };
  }, [apiBase, page, limit, sort, order, debouncedSearch, statusFilter]);

  const formatRelative = (value?: string) => {
    if (!value) {
      return "just now";
    }
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) {
      return `${Math.max(minutes, 1)}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <main className="flex flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-400">Your work / Task management</p>
        <h2 className="text-lg font-semibold text-zinc-100">
          Jira-style task listing
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", "To do", "In progress", "Review", "Done"].map((item) => (
              <button
                key={item}
                className={`rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium transition ${
                  statusFilter === item
                    ? "bg-white/10 text-white"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
                type="button"
                onClick={() => {
                  setStatusFilter(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 sm:max-w-[320px]">
              <svg
                aria-hidden
                className="h-4 w-4 text-zinc-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16.5 16.5 4 4" />
              </svg>
              <input
                className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                placeholder="Search tasks"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400" htmlFor="sort">
                Sort
              </label>
              <select
                id="sort"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="updatedAt">Last updated</option>
                <option value="createdAt">Created</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
              <select
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200"
                value={order}
                onChange={(event) => setOrder(event.target.value)}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121318] shadow-[0_25px_60px_-45px_rgba(0,0,0,0.9)]">
          <div className="overflow-x-auto">
            <Table className="min-w-[920px]">
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10">
                  <TableHead className="w-[120px] px-5">Key</TableHead>
                  <TableHead className="px-3">Summary</TableHead>
                  <TableHead className="w-[140px] px-3">Status</TableHead>
                  <TableHead className="w-[120px] px-3">Priority</TableHead>
                  <TableHead className="w-[140px] px-3">Assignee</TableHead>
                  <TableHead className="w-[110px] px-3">Updated</TableHead>
                  <TableHead className="w-[180px] px-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/10">
                {tasks.map((task, index) => (
                  <TableRow
                    key={task.key}
                    className={`border-white/10 transition-colors hover:bg-white/5 ${
                      index % 2 === 1 ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <TableCell className="px-5 text-xs font-semibold text-zinc-400">
                      {task.key}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-100">
                      {task.summary}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] ${
                          statusStyles[task.status]
                        }`}
                      >
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] ${
                          priorityStyles[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300">
                      {task.assignee}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {task.updated}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/task-management/${task.slug}`}
                          className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white/10"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditTask(task)}
                          className="w-fit rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-xs text-blue-200 transition hover:bg-blue-500/20"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="w-fit rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 hover:bg-rose-500/20"
                          onClick={() => setDeleteTask(task)}
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Rows per page</span>
            <select
              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-200"
              value={limit}
              onChange={(event) => {
                setPage(1);
                setLimit(Number(event.target.value));
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400">
              {total === 0
                ? "0-0"
                : `${(page - 1) * limit + 1}-${Math.min(
                    page * limit,
                    total
                  )}`}{" "}
              of {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-500"
                type="button"
                aria-label="Previous page"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                &lt;
              </button>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                type="button"
                aria-label="Next page"
                disabled={page * limit >= total}
                onClick={() => setPage((prev) => prev + 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
      <UpdateTaskModal
        open={!!editTask}
        task={editTask}
        onClose={() => setEditTask(null)}
      />
      <DeleteTaskModal
        open={!!deleteTask}
        task={deleteTask}
        onClose={() => setDeleteTask(null)}
      />
    </main>
  );
}
