"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./Button";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Accessible name. Rendered visibly unless `hideTitle`. */
  title?: string;
  hideTitle?: boolean;
  showClose?: boolean;
  /** Clicking the backdrop closes. Off for destructive confirmations. */
  dismissOnBackdrop?: boolean;
  className?: string;
  /** Blur the page behind the sheet — the auth-over-feed treatment. */
  blurBackdrop?: boolean;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  hideTitle = false,
  showClose = true,
  dismissOnBackdrop = true,
  className,
  blurBackdrop = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement as HTMLElement | null;

    // Lock scroll without the layout shift a plain overflow:hidden causes.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    document.addEventListener("keydown", handleKeyDown, true);

    // Focus the first control inside the panel, or the panel itself.
    const raf = requestAnimationFrame(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
      target?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      restoreFocusTo.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "animate-fade-in absolute inset-0 bg-black/60",
          blurBackdrop && "backdrop-blur-md",
        )}
        onClick={dismissOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "animate-modal-in relative max-h-[90vh] w-full max-w-md overflow-y-auto",
          "scrollbar-thin rounded-sheet bg-surface p-8 shadow-[0_4px_32px_rgba(0,0,0,0.28)]",
          "outline-none",
          className,
        )}
      >
        {showClose && (
          <IconButton
            label="Close"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 z-10"
          >
            <X className="size-5" />
          </IconButton>
        )}

        {title && !hideTitle && (
          <h2 className="mb-6 text-center text-[28px] font-semibold leading-tight tracking-tight">
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>,
    document.body,
  );
}
