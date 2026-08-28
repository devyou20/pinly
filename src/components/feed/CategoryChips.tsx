"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export const CATEGORIES = [
  "Home decor",
  "Recipes",
  "Design",
  "Travel",
  "Fashion",
  "Art",
  "Architecture",
  "Gardening",
  "Photography",
  "DIY",
] as const;

/** Horizontally scrollable filter row sitting under the nav. */
export function CategoryChips() {
  const params = useSearchParams();
  const active = params.get("q");

  return (
    <nav
      aria-label="Categories"
      className="scrollbar-thin flex gap-2 overflow-x-auto px-4 pb-4 pt-1"
    >
      <Link
        href="/"
        className={cn(
          "h-9 shrink-0 rounded-pill px-4 text-sm font-semibold leading-9 transition-colors duration-200",
          !active ? "bg-ink text-bg" : "bg-secondary text-ink hover:bg-secondary-hover",
        )}
      >
        All
      </Link>

      {CATEGORIES.map((category) => {
        const isActive = active?.toLowerCase() === category.toLowerCase();
        return (
          <Link
            key={category}
            href={`/search?q=${encodeURIComponent(category)}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "h-9 shrink-0 rounded-pill px-4 text-sm font-semibold leading-9 transition-colors duration-200",
              isActive
                ? "bg-ink text-bg"
                : "bg-secondary text-ink hover:bg-secondary-hover",
            )}
          >
            {category}
          </Link>
        );
      })}
    </nav>
  );
}
