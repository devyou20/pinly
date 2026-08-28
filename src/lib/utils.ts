import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** "3d", "5w", "2y" — the compact relative time Pinterest uses on comments. */
export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [3600, "m"],
    [86400, "h"],
    [604800, "d"],
    [2629800, "w"],
    [31557600, "mo"],
  ];

  if (seconds < 60) return `${Math.floor(seconds)}s`;
  for (let i = 1; i < units.length; i++) {
    const [limit] = units[i];
    if (seconds < limit) {
      return `${Math.floor(seconds / units[i - 1][0])}${units[i][1]}`;
    }
  }
  return `${Math.floor(seconds / 31557600)}y`;
}

/** Strip a URL down to its bare hostname, for the pin detail source link. */
export function displayHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Deterministic pastel placeholder colour, keyed off a pin id. */
export function placeholderColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 45% 92%)`;
}

/** Initials for an avatar fallback. */
export function initials(name: string | null | undefined, fallback = "?"): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || fallback;
}
