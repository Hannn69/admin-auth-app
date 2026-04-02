"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TaskRow = {
  key: string;
  slug: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string;
  updated: string;
  space?: string;
  workType?: string;
  description?: string;
  reporter?: string;
  labels?: string;
  dueDate?: string;
  startDate?: string;
  category?: string;
  team?: string;
};

type UpdateTaskModalProps = {
  open: boolean;
  task: TaskRow | null;
  onClose: () => void;
};

export function UpdateTaskModal({ open, task, onClose }: UpdateTaskModalProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    space: "task (TASK)",
    workType: "Task",
    summary: "",
    status: "To do",
    priority: "Medium",
    assignee: "",
    reporter: "",
    labels: "",
    dueDate: "",
    startDate: "",
    category: "",
    team: "",
    description: "",
  });

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (task) {
      setForm({
        space: task.space ?? "task (TASK)",
        workType: task.workType ?? "Task",
        summary: task.summary ?? "",
        status: task.status ?? "To do",
        priority: task.priority ?? "Medium",
        assignee: task.assignee ?? "",
        reporter: task.reporter ?? "",
        labels: task.labels ?? "",
        dueDate: task.dueDate ?? "",
        startDate: task.startDate ?? "",
        category: task.category ?? "",
        team: task.team ?? "",
        description: task.description ?? "",
      });
      setError(null);
    }
  }, [task]);

  const handleUpdate = async () => {
    if (!task?.key) {
      return;
    }
    if (!form.summary.trim()) {
      setError("Summary is required.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const attemptUpdate = () =>
        fetch(`${apiBase}/task/${task.key}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

      let res = await attemptUpdate();
      if (res.status === 401) {
        const refresh = await fetch(`${apiBase}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (refresh.ok) {
          res = await attemptUpdate();
        }
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update task.");
      }

      window.dispatchEvent(new CustomEvent("task:updated"));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-hidden p-0">
        <div className="flex flex-col">
          <DialogHeader className="border-b border-white/10 px-5 py-4">
            <DialogTitle>Update Task</DialogTitle>
            <DialogDescription>
              Update the fields below and save your changes.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs text-zinc-400">Space</label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  value={form.space}
                  onChange={(event) =>
                    updateForm("space", event.target.value)
                  }
                >
                  <option>task (TASK)</option>
                  <option>platform (PLAT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Work type</label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  value={form.workType}
                  onChange={(event) =>
                    updateForm("workType", event.target.value)
                  }
                >
                  <option>Task</option>
                  <option>Bug</option>
                  <option>Story</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Status</label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  value={form.status}
                  onChange={(event) =>
                    updateForm("status", event.target.value)
                  }
                >
                  <option>To do</option>
                  <option>In progress</option>
                  <option>Review</option>
                  <option>Done</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Summary</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  value={form.summary}
                  onChange={(event) =>
                    updateForm("summary", event.target.value)
                  }
                  type="text"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Description</label>
                <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#23252a]">
                  <div className="flex flex-wrap gap-2 border-b border-white/10 px-3 py-2 text-xs text-zinc-400">
                    {["T", "B", "I", "•", "1.", "@", "😊"].map((item) => (
                      <span
                        key={item}
                        className="rounded border border-white/10 px-2 py-1"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <textarea
                    className="min-h-[140px] w-full bg-transparent px-3 py-3 text-sm text-zinc-200 outline-none"
                    placeholder="Add more context for this task."
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-400">Assignee</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.assignee}
                    onChange={(event) =>
                      updateForm("assignee", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Reporter</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.reporter}
                    onChange={(event) =>
                      updateForm("reporter", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-400">Priority</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.priority}
                    onChange={(event) =>
                      updateForm("priority", event.target.value)
                    }
                  >
                    <option>Medium</option>
                    <option>High</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Labels</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.labels}
                    onChange={(event) =>
                      updateForm("labels", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-400">Due date</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    type="date"
                    value={form.dueDate?.slice(0, 10)}
                    onChange={(event) =>
                      updateForm("dueDate", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Attachment</label>
                  <div className="mt-2 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#23252a] px-3 py-6 text-xs text-zinc-500">
                    Drop files to attach or{" "}
                    <span className="ml-1 rounded-md border border-white/10 px-2 py-1 text-zinc-300">
                      Browse
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-400">Start date</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    type="date"
                    value={form.startDate?.slice(0, 10)}
                    onChange={(event) =>
                      updateForm("startDate", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Category</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.category}
                    onChange={(event) =>
                      updateForm("category", event.target.value)
                    }
                  >
                    <option value="">Select...</option>
                    <option>Admin</option>
                    <option>Security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Team</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  value={form.team}
                  onChange={(event) => updateForm("team", event.target.value)}
                />
              </div>
              {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 px-5 py-4 text-xs text-zinc-400 sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-blue-500 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-400"
                onClick={handleUpdate}
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update"}
              </button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
