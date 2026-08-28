"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (
    message: string,
    options?: { variant?: ToastVariant; action?: Toast["action"]; duration?: number },
  ) => void;
  /** Shorthand for reporting a failed Supabase call. */
  toastError: (message: string, error?: { message?: string } | null) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    setMounted(true);
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    (message, options) => {
      const id = nextId.current++;
      const duration = options?.duration ?? 4500;

      setToasts((current) => [
        // Cap the stack so a burst of failures can't bury the page.
        ...current.slice(-2),
        { id, message, variant: options?.variant ?? "info", action: options?.action },
      ]);

      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  const toastError = useCallback<ToastContextValue["toastError"]>(
    (message, error) => {
      const detail = error?.message ? ` ${error.message}` : "";
      toast(`${message}${detail}`, { variant: "error", duration: 6000 });
    },
    [toast],
  );

  const value = useMemo(() => ({ toast, toastError }), [toast, toastError]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            role="region"
            aria-label="Notifications"
            className="pointer-events-none fixed inset-x-0 bottom-6 z-[200] flex flex-col items-center gap-2 px-4"
          >
            {toasts.map((t) => {
              const Icon = ICONS[t.variant];
              return (
                <div
                  key={t.id}
                  role={t.variant === "error" ? "alert" : "status"}
                  aria-live={t.variant === "error" ? "assertive" : "polite"}
                  className={cn(
                    "animate-modal-in pointer-events-auto flex w-full max-w-md items-center gap-3",
                    "rounded-2xl px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
                    t.variant === "error"
                      ? "bg-accent text-white"
                      : "bg-ink text-bg",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  <p className="min-w-0 flex-1 text-sm font-medium">{t.message}</p>

                  {t.action && (
                    <button
                      type="button"
                      onClick={() => {
                        t.action?.onClick();
                        dismiss(t.id);
                      }}
                      className="shrink-0 rounded-full px-2 py-1 text-sm font-semibold underline underline-offset-2"
                    >
                      {t.action.label}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss notification"
                    className="shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
