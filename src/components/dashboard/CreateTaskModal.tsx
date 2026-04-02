"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreateTaskModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateTaskModal({ open, onClose }: CreateTaskModalProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createAnother, setCreateAnother] = useState(false);
  const [form, setForm] = useState({
    space: "task (TASK)",
    workType: "Task",
    status: "To do",
    summary: "",
    description: "",
    assignee: "",
    reporter: "sonvirak",
    priority: "Medium",
    labels: "",
    dueDate: "",
    startDate: "",
    category: "",
    team: "",
  });

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.summary.trim()) {
      setError("Summary is required.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const attemptCreate = () =>
        fetch(`${apiBase}/task/create`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

      let res = await attemptCreate();
      if (res.status === 401) {
        const refresh = await fetch(`${apiBase}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (refresh.ok) {
          res = await attemptCreate();
        }
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create task.");
      }

      window.dispatchEvent(new CustomEvent("task:created"));

      if (createAnother) {
        setForm((prev) => ({
          ...prev,
          summary: "",
          description: "",
          labels: "",
          dueDate: "",
          startDate: "",
          category: "",
          team: "",
        }));
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
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
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Required fields are marked with an asterisk{" "}
              <span className="text-rose-300">*</span>
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs text-zinc-400">
                  Space <span className="text-rose-300">*</span>
                </label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  value={form.space}
                  onChange={(event) => updateForm("space", event.target.value)}
                >
                  <option>task (TASK)</option>
                  <option>platform (PLAT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400">
                  Work type <span className="text-rose-300">*</span>
                </label>
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
                <p className="mt-1 text-[11px] text-blue-300">
                  Learn about work types
                </p>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Status</label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                >
                  <option>To do</option>
                  <option>In progress</option>
                  <option>Done</option>
                </select>
                <p className="mt-1 text-[11px] text-zinc-500">
                  This is the initial status upon creation.
                </p>
              </div>

              <div>
                <label className="text-xs text-zinc-400">
                  Summary <span className="text-rose-300">*</span>
                </label>
                <input
                  className="mt-2 w-full rounded-xl border border-rose-400/60 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  placeholder="Summary is required"
                  type="text"
                  value={form.summary}
                  onChange={(event) =>
                    updateForm("summary", event.target.value)
                  }
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
                    placeholder="Type /ai for Atlassian Intelligence or @ to mention someone."
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
                    placeholder="Automatic"
                    value={form.assignee}
                    onChange={(event) =>
                      updateForm("assignee", event.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">
                    Reporter <span className="text-rose-300">*</span>
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    placeholder="sonvirak"
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
                    placeholder="Select label"
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
                    placeholder="Select date"
                    type="date"
                    value={form.dueDate}
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
                    placeholder="Select date"
                    type="date"
                    value={form.startDate}
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
                    <option>Select...</option>
                    <option>Admin</option>
                    <option>Security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Team</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                placeholder="Choose a team"
                value={form.team}
                onChange={(event) => updateForm("team", event.target.value)}
              />
            </div>
            {error ? (
              <p className="text-sm text-rose-300">{error}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="border-t border-white/10 px-5 py-4 text-xs text-zinc-400 sm:items-center sm:justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-blue-500"
              checked={createAnother}
              onChange={(event) => setCreateAnother(event.target.checked)}
            />
            Create another
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-full bg-blue-500 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
