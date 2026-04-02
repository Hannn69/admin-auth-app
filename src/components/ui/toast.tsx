"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ToastItem = {
  id: string;
  message: string;
  variant?: "success" | "error";
};

type ToastContextValue = {
  push: (message: string, variant?: ToastItem["variant"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, variant: ToastItem["variant"]) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    const handler = () => push("Task has been created successfully.", "success");
    window.addEventListener("task:created", handler);
    return () => window.removeEventListener("task:created", handler);
  }, [push]);

  useEffect(() => {
    const handler = () => push("Task has been updated successfully.", "success");
    window.addEventListener("task:updated", handler);
    return () => window.removeEventListener("task:updated", handler);
  }, [push]);

  useEffect(() => {
    const handler = () => push("Task has been deleted successfully.", "success");
    window.addEventListener("task:deleted", handler);
    return () => window.removeEventListener("task:deleted", handler);
  }, [push]);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-6 top-6 z-[120] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] ${
              toast.variant === "error"
                ? "border-rose-400/30 bg-[#1a1214] text-rose-200"
                : "border-emerald-400/30 bg-[#111217]/95 text-emerald-200"
            }`}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
