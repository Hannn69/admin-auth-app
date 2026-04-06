"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

type Subtask = {
  id: number;
  title: string;
  priority: "Low" | "Medium" | "High";
  assignee: string;
  status: "To do" | "In progress" | "Done";
};

const normalizeLabels = (value: unknown) => {
  if (typeof value !== "string") {
    return [];
  }
  return value
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
};

const addLabelValue = (labels: string[], nextLabel: string) => {
  const trimmed = nextLabel.trim();
  if (!trimmed) {
    return labels;
  }
  const exists = labels.some(
    (label) => label.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) {
    return labels;
  }
  return [...labels, trimmed];
};

const normalizeSubtasks = (value: unknown) => {
  if (!Array.isArray(value)) {
    return null;
  }
  const normalized: Subtask[] = [];
  value.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }
    const record = item as Record<string, unknown>;
    const title =
      typeof record.title === "string" ? record.title.trim() : "";
    if (!title) {
      return;
    }
    let id = index + 1;
    if (typeof record.id === "number" && Number.isFinite(record.id)) {
      id = record.id;
    } else if (typeof record.id === "string") {
      const parsed = Number(record.id);
      if (Number.isFinite(parsed)) {
        id = parsed;
      }
    }
    const priority =
      record.priority === "High" ||
      record.priority === "Low" ||
      record.priority === "Medium"
        ? record.priority
        : "Medium";
    const status =
      record.status === "In progress" ||
      record.status === "Done" ||
      record.status === "To do"
        ? record.status
        : "To do";
    const assignee =
      typeof record.assignee === "string" && record.assignee.trim()
        ? record.assignee.trim()
        : "Unassigned";
    normalized.push({
      id,
      title,
      priority,
      assignee,
      status,
    });
  });
  return normalized;
};

type TaskDetailContentProps = {
  slug: string;
  task?: {
    key: string;
    summary: string;
    status: string;
    priority?: string | null;
    assignee?: string | null;
    reporter?: string | null;
    description?: string | null;
    labels?: string | null;
    dueDate?: string | null;
    startDate?: string | null;
    category?: string | null;
    team?: string | null;
    subtasks?: unknown;
  } | null;
  onEdit?: () => void;
};

export function TaskDetailContent({
  slug,
  task,
  onEdit,
}: TaskDetailContentProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
  const assigneeOptions = ["Unassigned", "sonvirak", "alex", "maria"];
  const priorityOptions = ["Low", "Medium", "High"];
  const categoryOptions = ["Admin", "Security", "Design", "Platform"];
  const labelSuggestions = [
    "backend",
    "frontend",
    "bug",
    "urgent",
    "security",
    "design",
  ];
  const initialSubtasks = useMemo<Subtask[]>(
    () => [
      {
        id: 2,
        title: "Capture API requirements",
        priority: "Medium",
        assignee: "Unassigned",
        status: "To do",
      },
      {
        id: 3,
        title: "Design empty state assets",
        priority: "Medium",
        assignee: "Unassigned",
        status: "To do",
      },
    ],
    []
  );
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskError, setSubtaskError] = useState<string | null>(null);
  const [savingSubtasks, setSavingSubtasks] = useState(false);
  const [activeSubtask, setActiveSubtask] = useState<Subtask | null>(null);
  const [reporterValue, setReporterValue] = useState("");
  const [reporterDraft, setReporterDraft] = useState("");
  const [reporterError, setReporterError] = useState<string | null>(null);
  const [editingReporter, setEditingReporter] = useState(false);
  const [savingReporter, setSavingReporter] = useState(false);
  const [assigneeValue, setAssigneeValue] = useState("Unassigned");
  const [assigneeDraft, setAssigneeDraft] = useState("Unassigned");
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [priorityValue, setPriorityValue] = useState("Medium");
  const [priorityDraft, setPriorityDraft] = useState("Medium");
  const [editingPriority, setEditingPriority] = useState(false);
  const [categoryValue, setCategoryValue] = useState("");
  const [categoryDraft, setCategoryDraft] = useState("");
  const [editingCategory, setEditingCategory] = useState(false);
  const [labelsValue, setLabelsValue] = useState<string[]>([]);
  const [labelsDraft, setLabelsDraft] = useState("");
  const [editingLabels, setEditingLabels] = useState(false);
  const [dueDateValue, setDueDateValue] = useState("");
  const [dueDateDraft, setDueDateDraft] = useState("");
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [startDateValue, setStartDateValue] = useState("");
  const [startDateDraft, setStartDateDraft] = useState("");
  const [editingStartDate, setEditingStartDate] = useState(false);
  const [statusDraft, setStatusDraft] = useState<Subtask["status"]>("To do");
  const [editingStatus, setEditingStatus] = useState(false);
  const [timeTrackingOpen, setTimeTrackingOpen] = useState(false);
  const [timeSpent, setTimeSpent] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [timeSpentDraft, setTimeSpentDraft] = useState("");
  const [timeRemainingDraft, setTimeRemainingDraft] = useState("");
  const [deleteSubtask, setDeleteSubtask] = useState<Subtask | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingSubtask, setDeletingSubtask] = useState(false);
  const nextSubtaskId = useRef(
    Math.max(...initialSubtasks.map((item) => item.id), 1) + 1
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (task?.key) {
      const normalized = normalizeSubtasks(task.subtasks);
      if (normalized) {
        setSubtasks(normalized);
        const maxId = Math.max(...normalized.map((item) => item.id), 0);
        nextSubtaskId.current = maxId + 1;
      } else {
        setSubtasks([]);
        nextSubtaskId.current = 1;
      }
      return;
    }
    setSubtasks(initialSubtasks);
  }, [initialSubtasks, task]);

  useEffect(() => {
    if (showSubtaskInput) {
      inputRef.current?.focus();
    }
  }, [showSubtaskInput]);

  useEffect(() => {
    if (deleteSubtask) {
      setDeleteConfirm("");
      setDeleteError(null);
    }
  }, [deleteSubtask]);

  useEffect(() => {
    if (!activeSubtask) {
      setEditingReporter(false);
      setReporterError(null);
      setEditingAssignee(false);
      setEditingPriority(false);
      setEditingCategory(false);
      setEditingLabels(false);
      setEditingDueDate(false);
      setEditingStartDate(false);
      setEditingStatus(false);
      setTimeTrackingOpen(false);
    }
  }, [activeSubtask]);

  useEffect(() => {
    if (activeSubtask) {
      setStatusDraft(activeSubtask.status);
    }
  }, [activeSubtask]);

  useEffect(() => {
    const nextReporter =
      typeof task?.reporter === "string" && task.reporter.trim()
        ? task.reporter.trim()
        : "sonvirak";
    setReporterValue(nextReporter);
    if (!editingReporter) {
      setReporterDraft(nextReporter);
      setReporterError(null);
    }
  }, [task?.reporter, editingReporter]);

  useEffect(() => {
    const nextAssignee =
      typeof task?.assignee === "string" && task.assignee.trim()
        ? task.assignee.trim()
        : "Unassigned";
    const nextPriority =
      typeof task?.priority === "string" && task.priority.trim()
        ? task.priority.trim()
        : "Medium";
    const nextCategory =
      typeof task?.category === "string" ? task.category.trim() : "";
    const nextLabels = normalizeLabels(task?.labels);
    const nextDueDate = task?.dueDate ? task.dueDate.slice(0, 10) : "";
    const nextStartDate = task?.startDate ? task.startDate.slice(0, 10) : "";

    if (!editingAssignee) {
      setAssigneeValue(nextAssignee);
      setAssigneeDraft(nextAssignee);
    }
    if (!editingPriority) {
      setPriorityValue(nextPriority);
      setPriorityDraft(nextPriority);
    }
    if (!editingCategory) {
      setCategoryValue(nextCategory);
      setCategoryDraft(nextCategory);
    }
    if (!editingLabels) {
      setLabelsValue(nextLabels);
      setLabelsDraft("");
    }
    if (!editingDueDate) {
      setDueDateValue(nextDueDate);
      setDueDateDraft(nextDueDate);
    }
    if (!editingStartDate) {
      setStartDateValue(nextStartDate);
      setStartDateDraft(nextStartDate);
    }
  }, [
    task?.assignee,
    task?.priority,
    task?.category,
    task?.labels,
    task?.dueDate,
    task?.startDate,
    editingAssignee,
    editingPriority,
    editingCategory,
    editingLabels,
    editingDueDate,
    editingStartDate,
  ]);

  useEffect(() => {
    if (timeTrackingOpen) {
      setTimeSpentDraft(timeSpent);
      setTimeRemainingDraft(timeRemaining);
    }
  }, [timeTrackingOpen, timeSpent, timeRemaining]);

  const keyPrefix = useMemo(() => {
    const rawKey = (task?.key ?? slug ?? "TASK").toUpperCase();
    const prefix = rawKey.split("-")[0];
    return prefix || "TASK";
  }, [task?.key, slug]);

  const handleAddSubtask = () => {
    const trimmed = subtaskTitle.trim();
    if (!trimmed) {
      return;
    }
    const newSubtask: Subtask = {
      id: nextSubtaskId.current,
      title: trimmed,
      priority: "Medium",
      assignee: "Unassigned",
      status: "To do",
    };
    nextSubtaskId.current += 1;
    const nextSubtasks = [...subtasks, newSubtask];
    setSubtasks(nextSubtasks);
    setSubtaskTitle("");
    setShowSubtaskInput(true);
    if (task?.key) {
      setSavingSubtasks(true);
      setSubtaskError(null);
      const attemptUpdate = () =>
        fetch(`${apiBase}/task/${task.key}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subtasks: nextSubtasks }),
        });
      attemptUpdate()
        .then(async (res) => {
          if (res.status === 401) {
            const refresh = await fetch(`${apiBase}/auth/refresh`, {
              method: "POST",
              credentials: "include",
            });
            if (refresh.ok) {
              return attemptUpdate();
            }
          }
          return res;
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to save subtask.");
          }
          window.dispatchEvent(new CustomEvent("task:updated"));
        })
        .catch((err) => {
          setSubtaskError(
            err instanceof Error ? err.message : "Failed to save subtask."
          );
        })
        .finally(() => {
          setSavingSubtasks(false);
        });
    }
  };

  const isDeleteConfirmValid =
    deleteConfirm.trim().toLowerCase() === "delete";

  const handleDeleteSubtask = async () => {
    if (!deleteSubtask || !isDeleteConfirmValid) {
      return;
    }
    const nextSubtasks = subtasks.filter(
      (item) => item.id !== deleteSubtask.id
    );
    if (!task?.key) {
      setSubtasks(nextSubtasks);
      setDeleteSubtask(null);
      return;
    }
    setDeletingSubtask(true);
    setDeleteError(null);
    try {
      const attemptUpdate = () =>
        fetch(`${apiBase}/task/${task.key}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subtasks: nextSubtasks }),
        });

      let res = await attemptUpdate();
      if (res.status === 401) {
        const refresh = await fetch(`${apiBase}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (refresh.ok) {
          res = await attemptUpdate();
        }
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete subtask.");
      }
      setSubtasks(nextSubtasks);
      setDeleteSubtask(null);
      window.dispatchEvent(new CustomEvent("task:updated"));
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete subtask."
      );
    } finally {
      setDeletingSubtask(false);
    }
  };

  const patchTask = async (payload: Record<string, unknown>) => {
    if (!task?.key) {
      return;
    }
    const attemptUpdate = () =>
      fetch(`${apiBase}/task/${task.key}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    let res = await attemptUpdate();
    if (res.status === 401) {
      const refresh = await fetch(`${apiBase}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refresh.ok) {
        res = await attemptUpdate();
      }
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to update task.");
    }
    window.dispatchEvent(new CustomEvent("task:updated"));
  };

  const handleSaveReporter = async () => {
    const trimmed = reporterDraft.trim();
    if (!trimmed) {
      setReporterError("Reporter is required.");
      return;
    }
    if (trimmed === reporterValue) {
      setEditingReporter(false);
      setReporterError(null);
      return;
    }
    if (!task?.key) {
      setReporterValue(trimmed);
      setEditingReporter(false);
      setReporterError(null);
      return;
    }
    setSavingReporter(true);
    setReporterError(null);
    try {
      await patchTask({ reporter: trimmed });
      setReporterValue(trimmed);
      setEditingReporter(false);
    } catch (err) {
      setReporterError(
        err instanceof Error ? err.message : "Failed to update reporter."
      );
    } finally {
      setSavingReporter(false);
    }
  };

  const handleCancelReporter = () => {
    setReporterDraft(reporterValue);
    setReporterError(null);
    setEditingReporter(false);
  };

  const handleSaveAssignee = async (nextValue?: string) => {
    const trimmed =
      typeof nextValue === "string"
        ? nextValue.trim() || "Unassigned"
        : assigneeDraft.trim() || "Unassigned";
    if (trimmed === assigneeValue) {
      setEditingAssignee(false);
      return;
    }
    const previous = assigneeValue;
    setAssigneeValue(trimmed);
    setEditingAssignee(false);
    if (!task?.key) {
      return;
    }
    try {
      await patchTask({ assignee: trimmed });
    } catch {
      setAssigneeValue(previous);
    }
  };

  const handleAssignToMe = async () => {
    const previous = assigneeValue;
    const nextAssignee = "sonvirak";
    if (nextAssignee === assigneeValue) {
      return;
    }
    setAssigneeValue(nextAssignee);
    setAssigneeDraft(nextAssignee);
    setEditingAssignee(false);
    if (!task?.key) {
      return;
    }
    try {
      await patchTask({ assignee: nextAssignee });
    } catch {
      setAssigneeValue(previous);
      setAssigneeDraft(previous);
    }
  };

  const handleSavePriority = async (nextValue?: string) => {
    const trimmed =
      typeof nextValue === "string"
        ? nextValue.trim() || "Medium"
        : priorityDraft.trim() || "Medium";
    if (trimmed === priorityValue) {
      setEditingPriority(false);
      return;
    }
    const previous = priorityValue;
    setPriorityValue(trimmed);
    setEditingPriority(false);
    if (!task?.key) {
      return;
    }
    try {
      await patchTask({ priority: trimmed });
    } catch {
      setPriorityValue(previous);
    }
  };

  const handleSaveCategory = async (nextValue?: string) => {
    const trimmed =
      typeof nextValue === "string" ? nextValue.trim() : categoryDraft.trim();
    if (trimmed === categoryValue) {
      setEditingCategory(false);
      return;
    }
    const previous = categoryValue;
    setCategoryValue(trimmed);
    setEditingCategory(false);
    if (!task?.key) {
      return;
    }
    try {
      await patchTask({ category: trimmed });
    } catch {
      setCategoryValue(previous);
    }
  };

  const handleSaveLabels = async (nextLabels: string[]) => {
    const previous = labelsValue;
    const labelsText = nextLabels.join(", ");
    setLabelsValue(nextLabels);
    setLabelsDraft("");
    setEditingLabels(false);
    if (!task?.key) {
      return;
    }
    try {
      await patchTask({ labels: labelsText });
    } catch {
      setLabelsValue(previous);
    }
  };

  const handleSaveDueDate = async () => {
    if (dueDateDraft === dueDateValue) {
      setEditingDueDate(false);
      return;
    }
    const previous = dueDateValue;
    setDueDateValue(dueDateDraft);
    setEditingDueDate(false);
    if (!task?.key) {
      return;
    }
    try {
      await patchTask({ dueDate: dueDateDraft || null });
    } catch {
      setDueDateValue(previous);
    }
  };

  const handleSaveStartDate = async () => {
    if (startDateDraft === startDateValue) {
      setEditingStartDate(false);
      return;
    }
    const previous = startDateValue;
    setStartDateValue(startDateDraft);
    setEditingStartDate(false);
    if (!task?.key) {
      return;
    }
    try {
      await patchTask({ startDate: startDateDraft || null });
    } catch {
      setStartDateValue(previous);
    }
  };

  const handleSaveTimeTracking = () => {
    setTimeSpent(timeSpentDraft.trim());
    setTimeRemaining(timeRemainingDraft.trim());
    setTimeTrackingOpen(false);
  };

  const handleSaveSubtaskStatus = async (nextStatus: Subtask["status"]) => {
    if (!activeSubtask) {
      return;
    }
    if (nextStatus === activeSubtask.status) {
      setEditingStatus(false);
      return;
    }
    const previousSubtasks = subtasks;
    const nextSubtasks = subtasks.map((item) =>
      item.id === activeSubtask.id ? { ...item, status: nextStatus } : item
    );
    setSubtasks(nextSubtasks);
    setActiveSubtask({ ...activeSubtask, status: nextStatus });
    setEditingStatus(false);
    if (!task?.key) {
      return;
    }
    try {
      await patchTask({ subtasks: nextSubtasks });
    } catch {
      setSubtasks(previousSubtasks);
      setActiveSubtask(activeSubtask);
    }
  };

  const title = task?.summary ?? slug.replace("-", " ").toUpperCase();
  const status = task?.status ?? "To do";
  const priority = priorityValue || "Medium";
  const assignee = assigneeValue || "Unassigned";
  const reporter = reporterValue || "sonvirak";
  const timeTrackingSummary =
    timeSpent || timeRemaining
      ? `${timeSpent || "0m"} spent / ${timeRemaining || "0m"} remaining`
      : "No time logged";
  const activeSubtaskKey = activeSubtask
    ? `${keyPrefix}-${activeSubtask.id}`
    : "";
  const deleteSubtaskKey = deleteSubtask
    ? `${keyPrefix}-${deleteSubtask.id}`
    : "subtask";
  return (
    <>
      <main className="flex flex-1 flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase">
          Spaces
        </span>
        <span>/</span>
        <span>Task</span>
        <span>/</span>
        <span className="text-zinc-200">{(task?.key ?? slug).toUpperCase()}</span>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-zinc-100">
              A
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-zinc-100">
                {title}
              </h2>
              <p className="text-sm text-zinc-400">
                {task?.summary ? "Task detail overview." : "Build out the task detail experience."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">Description</h3>
              <button
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                type="button"
                onClick={onEdit}
              >
                Edit
              </button>
            </div>
            <p className="mt-3 text-sm text-zinc-300">
              {task?.description?.trim()
                ? task.description
                : "Draft the requirements, acceptance criteria, and dependencies for this work item."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">Subtasks</h3>
              <button
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                type="button"
                onClick={() => setShowSubtaskInput(true)}
              >
                Add subtask
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5">
              <Table className="text-xs">
                <TableHeader className="bg-black/30">
                  <TableRow className="border-white/10">
                    <TableHead className="px-4 py-3 text-[10px] tracking-[0.2em]">
                      Work
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[10px] tracking-[0.2em]">
                      Priority
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[10px] tracking-[0.2em]">
                      Assignee
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[10px] tracking-[0.2em]">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[10px] tracking-[0.2em]">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subtasks.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-300">
                            {keyPrefix}-{item.id}
                          </span>
                          <span className="text-sm text-zinc-200">
                            {item.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-zinc-200">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          {item.priority}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 text-zinc-200">
                        <span className="inline-flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] text-zinc-300">
                            ?
                          </span>
                          {item.assignee}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 text-zinc-200">
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-200">
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 text-zinc-200">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-300 hover:bg-white/5"
                            onClick={() => setActiveSubtask(item)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-rose-300/40 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-200 hover:bg-rose-500/20"
                            onClick={() => setDeleteSubtask(item)}
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {showSubtaskInput ? (
              <form
                className="mt-4 rounded-2xl border border-blue-400/40 bg-black/30 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleAddSubtask();
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    ref={inputRef}
                    className="flex-1 rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-400/60"
                    placeholder="What needs to be done?"
                    value={subtaskTitle}
                    onChange={(event) => setSubtaskTitle(event.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={savingSubtasks}
                    >
                      {savingSubtasks ? "Saving..." : "Add subtask"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 hover:bg-white/5"
                      onClick={() => {
                        setShowSubtaskInput(false);
                        setSubtaskTitle("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                {subtaskError ? (
                  <p className="mt-2 text-xs text-rose-300">{subtaskError}</p>
                ) : null}
              </form>
            ) : null}
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
                  ["Status", status],
                  ["Assignee", assignee],
                  ["Reporter", reporter],
                  ["Priority", priority],
                  ["Labels", labelsValue.length ? labelsValue.join(", ") : "None"],
                  ["Due date", dueDateValue || "None"],
                  ["Time tracking", timeTrackingSummary],
                  ["Start date", startDateValue || "None"],
                  ["Category", categoryValue || "Add option"],
                  ["Team", task?.team ?? "None"],
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
    <Dialog
      open={!!activeSubtask}
      onOpenChange={(open) => {
        if (!open) {
          setActiveSubtask(null);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden p-0">
        {activeSubtask ? (
          <div className="flex h-[90vh] flex-col">
            <DialogTitle className="sr-only">
              {activeSubtask.title}
            </DialogTitle>
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 text-xs text-zinc-400">
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                onClick={() => setActiveSubtask(null)}
              >
                Back
              </button>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase">
                Task
              </span>
              <span>/</span>
              <span className="text-zinc-200">{activeSubtaskKey}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="grid h-full grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="h-full overflow-y-auto px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-zinc-100">
                        {activeSubtask.title}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        Subtask detail overview.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                      >
                        Share
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                      >
                        More
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-[#1f2126]">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-zinc-300">
                      <span className="font-semibold uppercase tracking-wide text-[10px] text-zinc-400">
                        Description
                      </span>
                      <button
                        type="button"
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-2 text-xs text-zinc-400">
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px]">
                        Normal text
                      </span>
                      <span className="font-semibold">B</span>
                      <span className="italic">I</span>
                      <span className="text-zinc-500">...</span>
                      <span className="text-zinc-500">A</span>
                      <span className="text-zinc-500">List</span>
                      <span className="text-zinc-500">1.</span>
                      <span className="text-zinc-500">Todo</span>
                      <span className="text-zinc-500">Link</span>
                    </div>
                    <div className="px-4 py-6 text-sm text-zinc-400">
                      Type /ai for Atlassian Intelligence or @ to mention and
                      notify someone.
                    </div>
                    <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
                      <button
                        type="button"
                        className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-400"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-zinc-100">
                        Activity
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
                        {["All", "Comments", "History"].map((item, index) => (
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
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500/20 text-xs text-rose-200">
                        S
                      </div>
                      <div className="flex-1 rounded-2xl border border-white/10 bg-[#23252a] p-4 text-sm text-zinc-400">
                        Add a comment...
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                          {[
                            "Who is working on this?",
                            "Can I get more info...?",
                            "Status update...",
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
                </div>

                <aside className="h-full overflow-y-auto border-l border-white/10 bg-black/30 px-5 py-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Details
                    </h3>
                    <button
                      type="button"
                      className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                    >
                      Settings
                    </button>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-zinc-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Assignee</span>
                      <div className="text-right text-xs text-zinc-200">
                        <div className="flex flex-col items-end gap-1">
                          {editingAssignee ? (
                            <select
                              className="rounded-lg border border-white/10 bg-[#23252a] px-2 py-1 text-xs text-zinc-100"
                              value={assigneeDraft}
                              onChange={(event) => {
                                const value = event.target.value;
                                setAssigneeDraft(value);
                                handleSaveAssignee(value);
                              }}
                              onBlur={() => setEditingAssignee(false)}
                              autoFocus
                            >
                              {assigneeOptions.map((option) => (
                                <option key={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              type="button"
                              className="text-xs text-zinc-200 hover:text-white"
                              onClick={() => setEditingAssignee(true)}
                            >
                              {assignee}
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-[11px] text-blue-300 hover:text-blue-200"
                            onClick={handleAssignToMe}
                          >
                            Assign to me
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs text-zinc-500">Reporter</span>
                      <div className="flex w-full max-w-[220px] flex-col items-end gap-2">
                        {editingReporter ? (
                          <div className="flex w-full items-center gap-2">
                            <input
                              className="w-full rounded-lg border border-white/10 bg-[#23252a] px-2 py-1 text-xs text-zinc-100"
                              value={reporterDraft}
                              onChange={(event) =>
                                setReporterDraft(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  event.currentTarget.blur();
                                }
                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  handleCancelReporter();
                                }
                              }}
                              onBlur={handleSaveReporter}
                              disabled={savingReporter}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="text-xs text-zinc-200 hover:text-white"
                            onClick={() => {
                              setReporterDraft(reporter);
                              setEditingReporter(true);
                            }}
                          >
                            {reporter}
                          </button>
                        )}
                        {reporterError ? (
                          <span className="text-[11px] text-rose-300">
                            {reporterError}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Priority</span>
                      {editingPriority ? (
                        <select
                          className="rounded-lg border border-white/10 bg-[#23252a] px-2 py-1 text-xs text-zinc-100"
                          value={priorityDraft}
                          onChange={(event) => {
                            const value = event.target.value;
                            setPriorityDraft(value);
                            handleSavePriority(value);
                          }}
                          onBlur={() => setEditingPriority(false)}
                          autoFocus
                        >
                          {priorityOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          type="button"
                          className="text-xs text-zinc-200 hover:text-white"
                          onClick={() => setEditingPriority(true)}
                        >
                          {priorityValue || activeSubtask.priority}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Status</span>
                      {editingStatus ? (
                        <select
                          className="rounded-lg border border-white/10 bg-[#23252a] px-2 py-1 text-xs text-zinc-100"
                          value={statusDraft}
                          onChange={(event) => {
                            const value = event.target
                              .value as Subtask["status"];
                            setStatusDraft(value);
                            handleSaveSubtaskStatus(value);
                          }}
                          onBlur={() => setEditingStatus(false)}
                          autoFocus
                        >
                          <option>To do</option>
                          <option>In progress</option>
                          <option>Done</option>
                        </select>
                      ) : (
                        <button
                          type="button"
                          className="text-xs text-zinc-200 hover:text-white"
                          onClick={() => setEditingStatus(true)}
                        >
                          {activeSubtask.status}
                        </button>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs text-zinc-500">Labels</span>
                      <div className="flex w-full max-w-[220px] flex-col items-end gap-2">
                        {editingLabels ? (
                          <>
                            <div className="flex flex-wrap justify-end gap-1">
                              {labelsValue.length ? (
                                labelsValue.map((label) => (
                                  <button
                                    key={label}
                                    type="button"
                                    onMouseDown={(event) =>
                                      event.preventDefault()
                                    }
                                    onClick={() =>
                                      setLabelsValue((prev) =>
                                        prev.filter((item) => item !== label)
                                      )
                                    }
                                    className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-200 hover:border-white/20"
                                  >
                                    {label}
                                  </button>
                                ))
                              ) : (
                                <span className="text-[11px] text-zinc-500">
                                  No labels
                                </span>
                              )}
                            </div>
                            <input
                              className="w-full rounded-lg border border-white/10 bg-[#23252a] px-2 py-1 text-xs text-zinc-100"
                              placeholder="Add or create label"
                              value={labelsDraft}
                              onChange={(event) =>
                                setLabelsDraft(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === ",") {
                                  event.preventDefault();
                                  setLabelsValue((prev) =>
                                    addLabelValue(prev, labelsDraft)
                                  );
                                  setLabelsDraft("");
                                }
                              }}
                              onBlur={() => {
                                const nextLabels = addLabelValue(
                                  labelsValue,
                                  labelsDraft
                                );
                                handleSaveLabels(nextLabels);
                              }}
                              list="label-suggestions"
                              autoFocus
                            />
                            <datalist id="label-suggestions">
                              {labelSuggestions.map((label) => (
                                <option key={label} value={label} />
                              ))}
                            </datalist>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="text-xs text-zinc-200 hover:text-white"
                            onClick={() => setEditingLabels(true)}
                          >
                            {labelsValue.length
                              ? labelsValue.join(", ")
                              : "None"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Due date</span>
                      {editingDueDate ? (
                        <input
                          className="rounded-lg border border-white/10 bg-[#23252a] px-2 py-1 text-xs text-zinc-100"
                          type="date"
                          value={dueDateDraft}
                          onChange={(event) =>
                            setDueDateDraft(event.target.value)
                          }
                          onBlur={handleSaveDueDate}
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          className="text-xs text-zinc-200 hover:text-white"
                          onClick={() => setEditingDueDate(true)}
                        >
                          {dueDateValue || "None"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Time tracking</span>
                      <button
                        type="button"
                        className="text-xs text-zinc-200 hover:text-white"
                        onClick={() => setTimeTrackingOpen(true)}
                      >
                        {timeTrackingSummary}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Start date</span>
                      {editingStartDate ? (
                        <input
                          className="rounded-lg border border-white/10 bg-[#23252a] px-2 py-1 text-xs text-zinc-100"
                          type="date"
                          value={startDateDraft}
                          onChange={(event) =>
                            setStartDateDraft(event.target.value)
                          }
                          onBlur={handleSaveStartDate}
                          autoFocus
                        />
                      ) : (
                        <button
                          type="button"
                          className="text-xs text-zinc-200 hover:text-white"
                          onClick={() => setEditingStartDate(true)}
                        >
                          {startDateValue || "None"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Category</span>
                      {editingCategory ? (
                        <select
                          className="rounded-lg border border-white/10 bg-[#23252a] px-2 py-1 text-xs text-zinc-100"
                          value={categoryDraft}
                          onChange={(event) => {
                            const value = event.target.value;
                            setCategoryDraft(value);
                            handleSaveCategory(value);
                          }}
                          onBlur={() => setEditingCategory(false)}
                          autoFocus
                        >
                          <option value="">Add option</option>
                          {categoryOptions.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          type="button"
                          className="text-xs text-zinc-200 hover:text-white"
                          onClick={() => setEditingCategory(true)}
                        >
                          {categoryValue || "Add option"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-300">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-zinc-100">
                        Automation
                      </h3>
                      <span className="text-xs text-zinc-500">
                        Rule executions
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">
                      Created yesterday
                    </p>
                    <p className="text-xs text-zinc-500">Updated yesterday</p>
                    <button
                      type="button"
                      className="mt-4 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5"
                    >
                      Configure
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
    <Dialog
      open={timeTrackingOpen}
      onOpenChange={(open) => {
        setTimeTrackingOpen(open);
      }}
    >
      <DialogContent className="max-w-md p-0">
        <div className="flex flex-col">
          <DialogHeader className="border-b border-white/10 px-5 py-4">
            <DialogTitle>Time tracking</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Log time spent and remaining.
            </DialogDescription>
          </DialogHeader>
          <div className="px-5 py-4 text-sm text-zinc-300">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-zinc-400">Time spent</label>
                <input
                  className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  placeholder="2w 4d 6h 45m"
                  value={timeSpentDraft}
                  onChange={(event) => setTimeSpentDraft(event.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400">Time remaining</label>
                <input
                  className="mt-2 w-full rounded-lg border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
                  placeholder="1w 2d"
                  value={timeRemainingDraft}
                  onChange={(event) =>
                    setTimeRemainingDraft(event.target.value)
                  }
                />
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-400">
              <p className="font-semibold text-zinc-300">
                Use the format:
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                <li>2w 4d 6h 45m</li>
                <li>w = weeks</li>
                <li>d = days</li>
                <li>h = hours</li>
                <li>m = minutes</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="border-t border-white/10 px-5 py-4 text-xs text-zinc-400 sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
                onClick={() => setTimeTrackingOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-400"
                onClick={handleSaveTimeTracking}
              >
                Save
              </button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog
      open={!!deleteSubtask}
      onOpenChange={(value) => {
        if (!value) {
          setDeleteSubtask(null);
        }
      }}
    >
      <DialogContent className="max-w-md p-0">
        <div className="flex flex-col">
          <DialogHeader className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <DialogTitle>Delete {deleteSubtaskKey}?</DialogTitle>
            </div>
            <DialogDescription className="mt-2 text-zinc-400">
              Deleting a subtask is irreversible. It permanently removes the
              subtask and its activity history from this task.
            </DialogDescription>
          </DialogHeader>

          <div className="px-5 py-4 text-sm text-zinc-300">
            <label className="text-xs text-zinc-400">
              Type <span className="font-semibold text-zinc-200">delete</span>{" "}
              to continue
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#23252a] px-3 py-2 text-sm text-zinc-100"
              value={deleteConfirm}
              onChange={(event) => setDeleteConfirm(event.target.value)}
              placeholder="delete"
            />
            {deleteError ? (
              <p className="mt-2 text-xs text-rose-300">{deleteError}</p>
            ) : null}
          </div>

          <DialogFooter className="border-t border-white/10 px-5 py-4 text-xs text-zinc-400 sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
                onClick={() => setDeleteSubtask(null)}
                disabled={deletingSubtask}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 hover:bg-white/10"
                disabled={deletingSubtask}
              >
                Archive
              </button>
              <button
                type="button"
                disabled={!isDeleteConfirmValid || deletingSubtask}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isDeleteConfirmValid && !deletingSubtask
                    ? "bg-rose-500 text-white hover:bg-rose-400"
                    : "cursor-not-allowed bg-rose-500/30 text-rose-200/60"
                }`}
                onClick={handleDeleteSubtask}
              >
                {deletingSubtask ? "Deleting..." : "Delete"}
              </button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
