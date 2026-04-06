"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreateSpaceModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const manageOptions = ["Team-managed", "Company-managed"];
const accessOptions = ["Open", "Restricted", "Private"];

export function CreateSpaceModal({
  open,
  onClose,
  onCreated,
}: CreateSpaceModalProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [name, setName] = useState("");
  const [managed, setManaged] = useState(manageOptions[0]);
  const [access, setAccess] = useState(accessOptions[0]);
  const [key, setKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nameHint = useMemo(
    () => "Try a team name, project goal, milestone...",
    []
  );

  useEffect(() => {
    if (!open) {
      setName("");
      setManaged(manageOptions[0]);
      setAccess(accessOptions[0]);
      setKey("");
      setKeyTouched(false);
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (keyTouched) {
      return;
    }
    const derived = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 8);
    setKey(derived);
  }, [name, keyTouched]);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!key.trim()) {
      setError("Key is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/space/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          key,
          managed,
          access,
          type:
            managed === "Company-managed"
              ? "Company-managed software"
              : "Team-managed software",
          app: "Software",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create space.");
      }
      window.dispatchEvent(new CustomEvent("space:created"));
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create space.");
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
      <DialogContent className="max-w-lg p-0">
        <div className="flex flex-col">
          <DialogHeader className="border-b border-white/10 px-6 py-5">
            <DialogTitle>Name your space</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Required fields are marked with an asterisk{" "}
              <span className="text-rose-300">*</span>
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 text-sm text-zinc-300">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-zinc-400">
                  Name <span className="text-rose-300">*</span>
                </label>
                <input
                  className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100 focus:border-blue-400/60 focus:outline-none"
                  placeholder={nameHint}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">
                  How your space is managed
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  value={managed}
                  onChange={(event) => setManaged(event.target.value)}
                >
                  {manageOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400">
                  Access <span className="text-rose-300">*</span>
                </label>
                <select
                  className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  value={access}
                  onChange={(event) => setAccess(event.target.value)}
                >
                  {accessOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400">
                  Key <span className="text-rose-300">*</span>
                </label>
                <input
                  className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100 uppercase tracking-[0.2em] focus:border-blue-400/60 focus:outline-none"
                  value={key}
                  onChange={(event) => {
                    setKeyTouched(true);
                    setKey(event.target.value.toUpperCase());
                  }}
                  placeholder="SPACE"
                  maxLength={8}
                />
              </div>
              {error ? (
                <p className="text-xs text-rose-300">{error}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 px-6 py-4 text-xs text-zinc-400 sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create space"}
              </button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
