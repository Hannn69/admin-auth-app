"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, MoreHorizontal, Search, Star } from "lucide-react";
import { CreateSpaceModal } from "@/components/dashboard/CreateSpaceModal";

const accentClasses = [
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
  "from-emerald-400 to-teal-500",
  "from-fuchsia-400 to-pink-500",
];

const appFilters = ["All apps", "Software", "Business"];
const managedFilters = ["All", "Team-managed", "Company-managed"];
const sortOptions = [
  { label: "Last updated", value: "updatedAt" },
  { label: "Created", value: "createdAt" },
  { label: "Name", value: "name" },
  { label: "Key", value: "key" },
];

export function SpacesContent() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const [search, setSearch] = useState("");
  const [appFilter, setAppFilter] = useState(appFilters[0]);
  const [managedFilter, setManagedFilter] = useState(managedFilters[0]);
  const [createOpen, setCreateOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<
    Array<{
      id: number;
      slug: string;
      name: string;
      key: string;
      type: string;
      lead: string;
      app: string;
    }>
  >([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sort, setSort] = useState("updatedAt");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredSpaces = useMemo(() => {
    if (!spaces.length) {
      return [];
    }
    return spaces.map((space, index) => ({
      ...space,
      accent: accentClasses[index % accentClasses.length],
    }));
  }, [spaces]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [search, appFilter, managedFilter]);

  const loadSpaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
        order,
      });
      if (search.trim()) {
        params.set("search", search.trim());
      }
      if (appFilter !== "All apps") {
        params.set("app", appFilter);
      }
      if (managedFilter !== "All") {
        params.set("managed", managedFilter);
      }
      const res = await fetch(`${apiBase}/spaces?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to load spaces.");
      }
      const data = await res.json();
      if (!Array.isArray(data.spaces)) {
        throw new Error("Invalid spaces payload.");
      }
      const mapped = data.spaces.map((space: any) => ({
        id: space.id,
        slug: space.slug,
        name: space.name,
        key: space.key,
        type: space.type ?? "Team-managed software",
        lead: space.lead ?? "Unassigned",
        app: space.app ?? "Software",
      }));
      setSpaces(mapped);
      setTotal(typeof data.total === "number" ? data.total : mapped.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load spaces.");
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpaces();
  }, [apiBase, page, limit, search, appFilter, managedFilter, sort, order]);

  useEffect(() => {
    if (!openMenuId) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-space-menu]")) {
        return;
      }
      setOpenMenuId(null);
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [openMenuId]);

  useEffect(() => {
    const handler = () => loadSpaces();
    window.addEventListener("space:updated", handler);
    return () => window.removeEventListener("space:updated", handler);
  }, [apiBase, page, limit, search, appFilter, managedFilter, sort, order]);

  return (
    <main className="flex flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-400">Your work / Spaces</p>
          <h2 className="text-lg font-semibold text-zinc-100">
            Jira-style space listing
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_-20px_rgba(59,130,246,0.8)] hover:bg-blue-400"
            onClick={() => setCreateOpen(true)}
          >
            Create space
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10"
          >
            Templates
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {appFilters.map((item) => (
            <button
              key={item}
              className={`rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium transition ${
                appFilter === item
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
              type="button"
              onClick={() => {
                setAppFilter(item);
                setPage(1);
              }}
            >
              {item}
            </button>
          ))}
          {managedFilters.map((item) => (
            <button
              key={item}
              className={`rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium transition ${
                managedFilter === item
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
              type="button"
              onClick={() => {
                setManagedFilter(item);
                setPage(1);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 sm:max-w-[320px]">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
              placeholder="Search spaces"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200"
              value={order}
              onChange={(event) => setOrder(event.target.value)}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl border border-white/10 bg-[#111216] shadow-[0_25px_60px_-45px_rgba(0,0,0,0.9)] ${
          openMenuId ? "overflow-visible" : "overflow-hidden"
        }`}
      >
        <div
          className={`${
            openMenuId
              ? "overflow-visible [&>div]:overflow-visible"
              : "overflow-x-auto"
          }`}
        >
          <Table className="min-w-[860px]">
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10">
                <TableHead className="w-[44px] px-4 text-center">
                  <Star className="h-4 w-4 text-zinc-500" />
                </TableHead>
                <TableHead className="px-3">
                  <span className="inline-flex items-center gap-2">
                    Name
                    <ChevronDown className="h-3 w-3 text-zinc-500" />
                  </span>
                </TableHead>
                <TableHead className="w-[120px] px-3">Key</TableHead>
                <TableHead className="w-[220px] px-3">Type</TableHead>
                <TableHead className="w-[180px] px-3">Lead</TableHead>
                <TableHead className="w-[120px] px-3 text-right">
                  Space URL
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/10">
              {filteredSpaces.map((space, index) => (
                <TableRow
                  key={space.id}
                  className={`border-white/10 transition-colors hover:bg-white/5 ${
                    index % 2 === 1 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <TableCell className="px-4 text-center">
                    <button
                      type="button"
                      className="rounded-full p-1 text-zinc-500 hover:text-amber-300"
                      aria-label="Favorite space"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  </TableCell>
                  <TableCell className="px-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${space.accent} text-xs font-semibold text-black`}
                      >
                        {space.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-sm text-zinc-100">
                        {space.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 text-xs font-semibold text-zinc-300">
                    {space.key}
                  </TableCell>
                  <TableCell className="px-3 text-sm text-zinc-300">
                    {space.type}
                  </TableCell>
                  <TableCell className="px-3">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-[10px] text-rose-200">
                        {space.lead.slice(0, 1).toUpperCase()}
                      </span>
                      {space.lead}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 text-right">
                    <div className="relative inline-flex" data-space-menu>
                      <button
                        type="button"
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
                        aria-label="Space actions"
                        onClick={() =>
                          setOpenMenuId((prev) =>
                            prev === String(space.id)
                              ? null
                              : String(space.id)
                          )
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenuId === String(space.id) ? (
                        <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-white/10 bg-[#111217] p-2 text-xs text-zinc-200 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.9)]">
                          <Link
                            href={`/spaces/${space.slug}/settings`}
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-zinc-200 hover:bg-white/10"
                          >
                            Space settings
                          </Link>
                          <button
                            type="button"
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-zinc-200 hover:bg-white/10"
                            onClick={() => setOpenMenuId(null)}
                          >
                            Move to trash
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-zinc-200 hover:bg-white/10"
                            onClick={() => setOpenMenuId(null)}
                          >
                            Archive
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSpaces.length === 0 ? (
                <TableRow className="border-white/10">
                  <TableCell
                    className="px-4 py-6 text-center text-sm text-zinc-500"
                    colSpan={6}
                  >
                    {loading ? "Loading spaces..." : "No spaces found."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Rows per page</span>
          <select
            className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-200"
            value={limit}
            onChange={(event) => {
              setPage(1);
              setLimit(Number(event.target.value));
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">
            {total === 0
              ? "0-0"
              : `${(page - 1) * limit + 1}-${Math.min(
                  page * limit,
                  total
                )}`}{" "}
            of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-500"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              &lt;
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
            >
              {page}
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              aria-label="Next page"
              disabled={page * limit >= total}
              onClick={() => setPage((prev) => prev + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      {error ? (
        <p className="text-center text-xs text-rose-300">{error}</p>
      ) : null}
      <CreateSpaceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => loadSpaces()}
      />
    </main>
  );
}
