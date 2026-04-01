type TaskDetailContentProps = {
  slug: string;
};

export function TaskDetailContent({ slug }: TaskDetailContentProps) {
  return (
    <main className="flex flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase">
          Spaces
        </span>
        <span>/</span>
        <span>Task</span>
        <span>/</span>
        <span className="text-zinc-200">{slug.toUpperCase()}</span>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-zinc-100">
              A
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-zinc-100">
                {slug.replace("-", " ").toUpperCase()}
              </h2>
              <p className="text-sm text-zinc-400">
                Build out the task detail experience.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">Description</h3>
              <button
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                type="button"
              >
                Edit
              </button>
            </div>
            <p className="mt-3 text-sm text-zinc-300">
              Draft the requirements, acceptance criteria, and dependencies for
              this work item.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">Subtasks</h3>
              <button
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                type="button"
              >
                Add subtask
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-400">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                Capture API requirements
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                Design empty state assets
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <h3 className="text-sm font-semibold text-zinc-100">
              Linked work items
            </h3>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-300">
              {["AUTH-10", "UI-42", "OPS-7"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                >
                  {item}
                </span>
              ))}
              <button
                className="rounded-full border border-dashed border-white/20 px-3 py-1 text-zinc-500"
                type="button"
              >
                Add linked work item
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-100">Activity</h3>
              <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                {["All", "Comments", "History", "Work log", "Approvals"].map(
                  (item, index) => (
                    <button
                      key={item}
                      className={`rounded-full border px-3 py-1 ${
                        index === 1
                          ? "border-blue-400/40 bg-blue-400/10 text-blue-200"
                          : "border-white/10 text-zinc-300 hover:bg-white/5"
                      }`}
                      type="button"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/20 text-xs text-rose-200">
                S
              </div>
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
                Add a comment...
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                  {[
                    "Who is working on this?",
                    "Status update",
                    "Thanks",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 px-3 py-1"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-zinc-500">
              Pro tip: press M to comment.
            </p>
          </div>
        </section>

        <aside className="w-full max-w-full shrink-0 xl:w-[340px]">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">Details</h3>
                <button
                  className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                  type="button"
                >
                  ⚙
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                {[
                  ["Assignee", "Unassigned"],
                  ["Reporter", "sonvirak"],
                  ["Priority", "Medium"],
                  ["Labels", "None"],
                  ["Due date", "None"],
                  ["Time tracking", "No time logged"],
                  ["Start date", "None"],
                  ["Category", "Add option"],
                  ["Team", "None"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{label}</span>
                    <span className="text-xs text-zinc-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Automation
                </h3>
                <span className="text-xs text-zinc-500">Rule executions</span>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Created 4 minutes ago
              </p>
              <p className="text-xs text-zinc-500">Updated 4 minutes ago</p>
              <button
                className="mt-4 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                type="button"
              >
                Configure
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
