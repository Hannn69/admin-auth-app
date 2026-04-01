"use client";

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
};

type UpdateTaskModalProps = {
  open: boolean;
  task: TaskRow | null;
  onClose: () => void;
};

export function UpdateTaskModal({ open, task, onClose }: UpdateTaskModalProps) {
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
                <label className="text-xs text-zinc-400">Key</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-400"
                  value={task?.key ?? ""}
                  readOnly
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Summary</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  defaultValue={task?.summary ?? ""}
                  type="text"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-400">Status</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    defaultValue={task?.status ?? "To do"}
                  >
                    <option>To do</option>
                    <option>In progress</option>
                    <option>Review</option>
                    <option>Done</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Priority</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    defaultValue={task?.priority ?? "Medium"}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-400">Assignee</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    defaultValue={task?.assignee ?? ""}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Updated</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-400"
                    value={task?.updated ?? ""}
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Description</label>
                <textarea
                  className="mt-2 min-h-[120px] w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-200"
                  placeholder="Add more context for this task."
                />
              </div>
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
              >
                Update
              </button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
