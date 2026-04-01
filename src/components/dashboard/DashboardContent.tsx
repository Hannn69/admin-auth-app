export function DashboardContent() {
  return (
    <main className="flex flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-400">Your work / Home</p>
        <h2 className="text-lg font-semibold text-zinc-100">
          Dashboard overview
        </h2>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-white/5 via-transparent to-white/5 p-10 text-center text-sm text-zinc-500">
          This space is ready for your admin content.
        </div>
      </div>
    </main>
  );
}
