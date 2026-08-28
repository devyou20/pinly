"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MasonryGrid } from "./MasonryGrid";
import { PinCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import type { PinWithAuthor } from "@/types/database";

export const PAGE_SIZE = 30;

export interface InfiniteFeedProps {
  initialPins: PinWithAuthor[];
  /** Returns the next page. Resolve with [] to signal the end. */
  loadMore: (offset: number) => Promise<PinWithAuthor[]>;
  emptyState?: React.ReactNode;
  onSave?: (pin: PinWithAuthor) => void;
}

export function InfiniteFeed({
  initialPins,
  loadMore,
  emptyState,
  onSave,
}: InfiniteFeedProps) {
  const [pins, setPins] = useState(initialPins);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initialPins.length < PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { toastError } = useToast();

  // Guards against the observer firing again while a fetch is in flight, which
  // is what produces duplicated pages.
  const inFlight = useRef(false);
  const seenIds = useRef(new Set(initialPins.map((p) => p.id)));

  // Reset when the caller swaps the underlying query (e.g. a new search term).
  useEffect(() => {
    setPins(initialPins);
    setDone(initialPins.length < PAGE_SIZE);
    seenIds.current = new Set(initialPins.map((p) => p.id));
    inFlight.current = false;
  }, [initialPins]);

  const fetchNext = useCallback(async () => {
    if (inFlight.current || done) return;
    inFlight.current = true;
    setLoading(true);

    try {
      const next = await loadMore(seenIds.current.size);

      // Dedupe defensively: a pin created between page loads shifts the offset
      // window and would otherwise appear twice.
      const fresh = next.filter((p) => !seenIds.current.has(p.id));
      for (const p of fresh) seenIds.current.add(p.id);

      if (next.length < PAGE_SIZE) setDone(true);
      if (fresh.length > 0) setPins((current) => [...current, ...fresh]);
    } catch (error) {
      setDone(true);
      toastError(
        "Couldn't load more pins.",
        error instanceof Error ? error : null,
      );
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, [done, loadMore, toastError]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || done) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNext();
      },
      // Start fetching a screenful early so the grid never visibly runs dry.
      { rootMargin: "800px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNext, done]);

  if (pins.length === 0 && !loading) {
    return <>{emptyState}</>;
  }

  return (
    <>
      <MasonryGrid pins={pins} onSave={onSave} />

      {!done && (
        <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />
      )}

      {loading && (
        <div className="masonry mt-4" aria-live="polite" aria-busy="true">
          {Array.from({ length: 10 }, (_, i) => (
            <PinCardSkeleton key={`loading-${i}`} index={i} />
          ))}
        </div>
      )}

      {done && pins.length > 0 && (
        <p className="py-10 text-center text-sm text-ink-muted">
          You&apos;re all caught up.
        </p>
      )}
    </>
  );
}
