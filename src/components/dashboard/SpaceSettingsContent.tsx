"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const settingsNav = [
  "Details",
  "Access",
  "Notifications",
  "Automation",
  "Fields",
  "Work types",
  "Features",
  "Board",
  "Timeline",
  "Toolchain",
  "Apps",
];

type SpaceSettingsContentProps = {
  spaceId: string;
};

export function SpaceSettingsContent({ spaceId }: SpaceSettingsContentProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const ownerOptions = ["sonvirak", "alex", "maria", "Unassigned"];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [form, setForm] = useState({
    name: "",
    key: "",
    category: "",
    owner: "",
    defaultAssignee: "",
  });

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let active = true;
    const loadSpace = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase}/space/detail/${spaceId}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to load space settings.");
        }
        const data = await res.json();
        if (active) {
          const space = data.space;
          setForm({
            name: space?.name ?? "",
            key: space?.key ?? "",
            category: space?.category ?? "",
            owner: space?.owner ?? space?.lead ?? "",
            defaultAssignee: space?.defaultAssignee ?? "Unassigned",
          });
          setIsOwner(Boolean(data.isOwner));
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load space."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadSpace();
    return () => {
      active = false;
    };
  }, [apiBase, spaceId]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.key.trim()) {
      setError("Name and key are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/space/${spaceId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          key: form.key,
          category: form.category,
          owner: form.owner,
          lead: form.owner,
          defaultAssignee: form.defaultAssignee,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save space.");
      }
      window.dispatchEvent(new CustomEvent("space:updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save space.");
    } finally {
      setSaving(false);
    }
  };

  const spaceName = form.name || "Space";

  return (
    <main className="flex flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <Link href="/spaces" className="text-zinc-300 hover:text-white">
            Spaces
          </Link>
          <span>/</span>
          <span className="text-zinc-200">{spaceName}</span>
          <span>/</span>
          <span>Space settings</span>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
        >
          ...
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <Link
            href="/spaces"
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white"
          >
            <span className="text-base">&larr;</span>
            Space settings
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-black">
              {spaceName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">{spaceName}</p>
              <p className="text-xs text-zinc-500">Software space</p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-1 text-sm">
            {settingsNav.map((item, index) => {
              const href =
                item === "Access"
                  ? `/spaces/${spaceId}/settings/access`
                  : `/spaces/${spaceId}/settings`;
              const isActive = item === "Details";
              return (
                <Link
                  key={item}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-left text-xs transition ${
                    isActive
                      ? "bg-blue-500/15 text-blue-200"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-zinc-400">
              Details
            </p>
            <h2 className="text-2xl font-semibold text-zinc-100">Details</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex flex-col items-center gap-3 lg:w-1/3">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-amber-400 text-3xl text-black">
                  {spaceName.slice(0, 1).toUpperCase()}
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10"
                >
                  Change icon
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <p className="text-xs text-zinc-400">
                  Required fields are marked with an asterisk{" "}
                  <span className="text-rose-300">*</span>
                </p>

                <div>
                  <label className="text-xs text-zinc-400">
                    Name <span className="text-rose-300">*</span>
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.name}
                    onChange={(event) =>
                      updateForm("name", event.target.value)
                    }
                    disabled={loading || saving || !isOwner}
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400">
                    Space key <span className="text-rose-300">*</span>
                  </label>
                  <input
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.key}
                    onChange={(event) =>
                      updateForm("key", event.target.value)
                    }
                    disabled={loading || saving || !isOwner}
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400">Category</label>
                  <select
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.category}
                    onChange={(event) =>
                      updateForm("category", event.target.value)
                    }
                    disabled={loading || saving || !isOwner}
                  >
                    <option value="">Choose a category</option>
                    <option>Engineering</option>
                    <option>Security</option>
                    <option>Operations</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400">Space owner</label>
                  <select
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.owner}
                    onChange={(event) =>
                      updateForm("owner", event.target.value)
                    }
                    disabled={loading || saving || !isOwner}
                  >
                    {ownerOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-zinc-500">
                    Make sure your space lead has access to work items in the
                    space.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-zinc-400">
                    Default assignee
                  </label>
                  <select
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                    value={form.defaultAssignee}
                    onChange={(event) =>
                      updateForm("defaultAssignee", event.target.value)
                    }
                    disabled={loading || saving || !isOwner}
                  >
                    <option>Unassigned</option>
                    <option>sonvirak</option>
                    <option>alex</option>
                  </select>
                </div>

                {isOwner ? (
                  <button
                    type="button"
                    className="w-fit rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/15 disabled:opacity-60"
                    onClick={handleSave}
                    disabled={loading || saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Only the space owner can edit settings.
                  </p>
                )}
                {error ? (
                  <p className="text-xs text-rose-300">{error}</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
