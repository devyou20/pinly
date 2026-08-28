"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, initials } from "@/lib/utils";

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 120,
} as const;

export type AvatarSize = keyof typeof SIZES;

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  username?: string | null;
  size?: AvatarSize;
  className?: string;
}

/**
 * Circular avatar with an initials fallback. Falls back on error too, so a
 * dead storage URL never leaves a broken-image glyph in the layout.
 */
export function Avatar({
  src,
  name,
  username,
  size = "md",
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const px = SIZES[size];
  const display = name || username || null;
  const showImage = src && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-secondary",
        className,
      )}
      style={{ width: px, height: px }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={display ? `${display}'s avatar` : "Avatar"}
          width={px}
          height={px}
          sizes={`${px}px`}
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="font-semibold text-ink-muted"
          style={{ fontSize: Math.max(10, Math.round(px * 0.4)) }}
        >
          {initials(display)}
        </span>
      )}
      {!showImage && display && <span className="sr-only">{display}</span>}
    </span>
  );
}
