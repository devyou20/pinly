"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Pill-shaped, flat grey — the search bar treatment. Default is a bordered field. */
  pill?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, pill = false, leading, trailing, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="px-1 text-xs font-medium text-ink-muted">
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex w-full items-center gap-2 transition-shadow duration-200",
          pill
            ? "rounded-pill bg-field px-4"
            : "rounded-2xl border-2 bg-surface px-4",
          !pill && (error ? "border-accent" : "border-hairline"),
          "focus-within:shadow-[0_0_0_4px_rgba(0,132,255,0.4)]",
        )}
      >
        {leading && (
          <span className="shrink-0 text-ink-muted" aria-hidden="true">
            {leading}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none",
            "placeholder:text-ink-muted focus-visible:shadow-none",
            className,
          )}
          {...props}
        />

        {trailing && <span className="shrink-0">{trailing}</span>}
      </div>

      {error ? (
        <p id={`${inputId}-error`} role="alert" className="px-1 text-xs font-medium text-accent">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="px-1 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="flex w-full flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="px-1 text-xs font-medium text-ink-muted">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full resize-y rounded-2xl border-2 bg-surface px-4 py-3 text-[15px] text-ink outline-none",
            "placeholder:text-ink-muted transition-shadow duration-200",
            "focus:shadow-[0_0_0_4px_rgba(0,132,255,0.4)]",
            error ? "border-accent" : "border-hairline",
            className,
          )}
          {...props}
        />

        {error ? (
          <p id={`${inputId}-error`} role="alert" className="px-1 text-xs font-medium text-accent">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="px-1 text-xs text-ink-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
