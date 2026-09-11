"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pinterest's search field: flat grey pill that lifts to a white, focus-ringed
 * field while active. Submits to /search?q=.
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(params.get("q") ?? "");

  // Keep in sync when navigating between search results.
  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  // "/" focuses search, the way it does on Pinterest — unless already typing.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/");
    inputRef.current?.blur();
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn("min-w-0 flex-1", className)}
    >
      {/*
        The ring and lift are pure CSS via focus-within, not React state, so they
        work before hydration and cannot desync. The inner input suppresses its
        own ring (focus-visible:shadow-none) because this wrapper is the visible
        field — otherwise both would draw one.
      */}
      <div
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-pill px-4",
          "transition-[background-color,box-shadow] duration-200",
          "bg-field hover:bg-secondary-hover",
          "focus-within:bg-surface focus-within:hover:bg-surface",
          "focus-within:shadow-[0_0_0_4px_rgba(0,132,255,0.4)]",
        )}
      >
        <Search className="size-5 shrink-0 text-ink-muted" aria-hidden="true" />

        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search for ideas"
          aria-label="Search for ideas"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none",
            "placeholder:text-ink-muted focus-visible:shadow-none",
            // Chrome's native search clear button duplicates ours.
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />

        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            className="shrink-0 rounded-full p-1 text-ink-muted transition-colors duration-200 hover:bg-secondary hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </form>
  );
}
