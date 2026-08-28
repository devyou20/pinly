"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM_CLASSES =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 hover:bg-secondary";

export interface DropdownProps {
  /** Render prop for the trigger; receives the props it must spread. */
  trigger: (props: {
    ref: React.Ref<HTMLButtonElement>;
    onClick: () => void;
    "aria-expanded": boolean;
    "aria-haspopup": "menu";
    "aria-controls": string;
  }) => React.ReactNode;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  align?: "start" | "end";
  className?: string;
  /** Accessible name for the popup. */
  label?: string;
}

/**
 * Click-outside / Escape dismissible popup menu. Keyboard users get Escape to
 * close and focus returned to the trigger.
 */
export function Dropdown({
  trigger,
  children,
  align = "end",
  className,
  label,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((v) => !v),
        "aria-expanded": open,
        "aria-haspopup": "menu",
        "aria-controls": menuId,
      })}

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={cn(
            "animate-modal-in absolute top-[calc(100%+8px)] z-50 min-w-56 origin-top",
            "rounded-2xl bg-surface p-2 shadow-[0_2px_16px_rgba(0,0,0,0.22)]",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  destructive = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { destructive?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        ITEM_CLASSES,
        destructive ? "text-accent" : "text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Navigational menu item. Renders a real <a> so middle-click and copy-link work. */
export function DropdownLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className={cn(ITEM_CLASSES, "text-ink", className)}
    >
      {children}
    </Link>
  );
}

export function DropdownDivider() {
  return <hr className="my-1.5 border-0 border-t border-hairline" aria-hidden="true" />;
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
      {children}
    </p>
  );
}
