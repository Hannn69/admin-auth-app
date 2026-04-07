"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateTaskModal } from "@/components/dashboard/CreateTaskModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DashboardHeaderProps = {
  loading: boolean;
  email: string | null;
  title: string;
  defaultSpace?: string;
  lockSpace?: boolean;
};

export function DashboardHeader({
  loading,
  email,
  title,
  defaultSpace,
  lockSpace,
}: DashboardHeaderProps) {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [invites, setInvites] = useState<
    Array<{
      id: number;
      token: string;
      space: { id: number; name: string; key: string };
      email: string;
    }>
  >([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<
    Array<{ id: number; message: string; read: boolean; createdAt: string }>
  >([]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);

    try {
      const res = await fetch(`${apiBase}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to log out.");
      }

      router.replace("/signin");
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : "Failed to log out.");
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  };

  const topIcons = [
    {
      label: "Create",
      svg: (
        <svg
          aria-hidden
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      label: "Notifications",
      svg: (
        <svg
          aria-hidden
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M6 9a6 6 0 1 1 12 0c0 6 2 6 2 6H4s2 0 2-6Z" />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
        </svg>
      ),
    },
    {
      label: "Tasks",
      svg: (
        <svg
          aria-hidden
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M5 7h14M5 12h14M5 17h9" />
        </svg>
      ),
    },
    {
      label: "To do",
      svg: (
        <svg
          aria-hidden
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="m6 12 4 4 8-8" />
        </svg>
      ),
    },
  ];

  const loadInvites = async () => {
    setLoadingInvites(true);
    setInviteError(null);
    try {
      const res = await fetch(`${apiBase}/space/invites`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load invites.");
      }
      const data = await res.json();
      setInvites(Array.isArray(data.invites) ? data.invites : []);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoadingInvites(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch(`${apiBase}/notifications`, {
        credentials: "include",
      });
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );
    } catch {
      // ignore
    }
  };

  const markNotificationsRead = async () => {
    try {
      await fetch(`${apiBase}/notifications/read-all`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let active = true;
    const poll = async () => {
      if (!active) {
        return;
      }
      await loadInvites();
      await loadNotifications();
    };
    poll();
    const interval = window.setInterval(poll, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [apiBase]);

  const handleAcceptInvite = async (token: string) => {
    try {
      await fetch(`${apiBase}/space/invite/accept`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      loadInvites();
    } catch {
      // ignore
    }
  };

  const handleDeclineInvite = async (token: string) => {
    try {
      await fetch(`${apiBase}/space/invite/decline`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      loadInvites();
    } catch {
      // ignore
    }
  };

  return (
    <>
      <header className="relative z-30 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 shadow-[0_15px_60px_-50px_rgba(0,0,0,0.9)] backdrop-blur sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-400">
            Your work
          </p>
          <h1 className="text-2xl font-semibold text-zinc-50">{title}</h1>
          <p className="text-sm text-zinc-400">
            {loading ? "Loading session..." : "Signed in as"}
            {!loading && email ? (
              <span className="ml-2 font-semibold text-zinc-100">{email}</span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-1 items-center gap-3 sm:max-w-[620px]">
          <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
            <span className="text-zinc-500">
              <svg
                aria-hidden
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16.5 16.5 4 4" />
              </svg>
            </span>
            <input
              className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
              placeholder="Search or go to..."
              type="text"
            />
            <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] uppercase text-zinc-400">
              /
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-white/20"
          >
            Create
          </button>
        </div>

        <div className="flex items-center gap-2">
          {topIcons.map((item) => (
            <button
              key={item.label}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-zinc-200 transition hover:bg-white/10"
              type="button"
              aria-label={item.label}
              onClick={
                item.label === "Notifications"
                  ? () => {
                      setNotificationsOpen(true);
                      loadInvites();
                      loadNotifications();
                      markNotificationsRead();
                    }
                  : undefined
              }
            >
              {item.svg}
              {item.label === "Notifications" &&
              (invites.length > 0 ||
                notifications.some((note) => !note.read)) ? (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
              ) : null}
            </button>
          ))}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs text-zinc-200 transition hover:bg-white/10"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-200 via-amber-200 to-yellow-200" />
              <svg
                aria-hidden
                className="mr-2 h-3 w-3 text-zinc-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {menuOpen ? (
              <div
                className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-white/10 bg-[#111217]/95 p-2 text-sm text-zinc-200 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] backdrop-blur"
                role="menu"
              >
                <button
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/10"
                  type="button"
                  role="menuitem"
                >
                  Profile
                </button>
                <div className="my-2 h-px bg-white/10" />
                <button
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-200 hover:bg-rose-500/10"
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
                {signOutError ? (
                  <p className="px-3 pt-2 text-xs text-rose-300">
                    {signOutError}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        </div>
      </header>
      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultSpace={defaultSpace}
        lockSpace={lockSpace}
      />
      <Dialog
        open={notificationsOpen}
        onOpenChange={(value) => {
          if (!value) {
            setNotificationsOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-md p-0">
          <div className="flex flex-col">
            <DialogHeader className="border-b border-white/10 px-5 py-4">
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>
                Recent activity and invites.
              </DialogDescription>
            </DialogHeader>
            <div className="px-5 py-4 text-sm text-zinc-300">
              {loadingInvites ? (
                <p className="text-sm text-zinc-500">Loading invites...</p>
              ) : invites.length || notifications.length ? (
                <div className="flex flex-col gap-3">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-100">
                          Space invite
                        </p>
                        <span className="text-[11px] text-zinc-500">
                          {invite.space?.key}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        You were invited to {invite.space?.name}.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-full bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-400"
                          onClick={() => handleAcceptInvite(invite.token)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10"
                          onClick={() => handleDeclineInvite(invite.token)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                  {notifications.map((note) => (
                    <div
                      key={`note-${note.id}`}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-100">
                          Space update
                        </p>
                        <span className="text-[11px] text-zinc-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        {note.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No notifications yet.</p>
              )}
              {inviteError ? (
                <p className="mt-3 text-xs text-rose-300">{inviteError}</p>
              ) : null}
            </div>
            <DialogFooter className="border-t border-white/10 px-5 py-4 text-xs text-zinc-400 sm:items-center sm:justify-end">
              <button
                type="button"
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
                onClick={() => setNotificationsOpen(false)}
              >
                Close
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
