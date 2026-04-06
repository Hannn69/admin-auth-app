"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();
  const navItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Spaces", href: "/spaces" },
    { label: "Task management", href: "/task-management" },
  ];

  return (
    <aside className="hidden w-64 flex-col rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_70px_-50px_rgba(0,0,0,0.85)] backdrop-blur md:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 text-sm font-bold text-black">
          A
        </div>
        <div>
          <p className="text-xs text-zinc-400">Your work</p>
          <p className="text-sm font-semibold text-zinc-100">Admin Portal</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2 text-sm">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                isActive
                  ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-white/70" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 text-xs text-zinc-400">
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
          <span>What&apos;s new</span>
          <span className="rounded-full bg-blue-400/20 px-2 py-0.5 text-[10px] text-blue-200">
            5
          </span>
        </div>
        <button
          className="flex items-center justify-between rounded-xl px-3 py-2 text-zinc-300 hover:bg-white/5"
          type="button"
        >
          <span>Help</span>
          <span className="text-[10px] text-zinc-500">?</span>
        </button>
        <button
          className="flex items-center justify-between rounded-xl px-3 py-2 text-zinc-300 hover:bg-white/5"
          type="button"
        >
          <span>Collapse sidebar</span>
          <span className="text-[10px] text-zinc-500">&lt;</span>
        </button>
      </div>
    </aside>
  );
}
