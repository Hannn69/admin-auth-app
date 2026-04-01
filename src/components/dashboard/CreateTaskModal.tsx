"use client";

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
                <select className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100">
                  <option>task (TASK)</option>
                  <option>platform (PLAT)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400">
                  Work type <span className="text-rose-300">*</span>
                </label>
                <select className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100">
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
                <select className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100">
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
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-400">Assignee</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    placeholder="Automatic"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">
                    Reporter <span className="text-rose-300">*</span>
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    placeholder="sonvirak"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-400">Priority</label>
                  <select className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100">
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
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Category</label>
                  <select className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100">
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
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 px-5 py-4 text-xs text-zinc-400 sm:items-center sm:justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue-500" />
              Create another
            </label>
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
                Create
              </button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
