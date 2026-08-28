"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "dark" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-hover disabled:bg-accent/50",
  secondary:
    "bg-secondary text-ink hover:bg-secondary-hover active:bg-secondary-hover",
  dark: "bg-ink text-bg hover:opacity-85 active:opacity-80",
  ghost: "bg-transparent text-ink hover:bg-secondary active:bg-secondary-hover",
  danger:
    "bg-transparent text-accent hover:bg-accent/10 active:bg-accent/15",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[15px]",
  lg: "h-12 px-5 text-base",
};

/**
 * Shared button styling. Exported so `<Link>` can look like a button without
 * nesting an <a> inside a <button> — which is invalid HTML and breaks
 * keyboard navigation.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  return cn(
    "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-pill font-semibold",
    "transition-[background-color,opacity,transform] duration-200 ease-[var(--ease-out-soft)]",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "active:scale-[0.97]",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={buttonClasses({ variant, size, fullWidth, className })}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

/** Circular icon button — the share / more affordances on cards and pin detail. */
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "ghost" | "solid" | "overlay";
  size?: "sm" | "md";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, variant = "ghost", size = "md", className, children, type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full",
          "transition-[background-color,transform] duration-200 ease-[var(--ease-out-soft)]",
          "active:scale-90 disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" ? "size-8" : "size-10",
          variant === "ghost" && "text-ink hover:bg-secondary",
          variant === "solid" && "bg-surface text-ink shadow-sm hover:bg-secondary",
          variant === "overlay" &&
            "bg-white/95 text-[#111] shadow-[0_1px_6px_rgba(0,0,0,0.25)] hover:bg-white",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
