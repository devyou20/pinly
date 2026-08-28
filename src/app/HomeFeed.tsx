"use client";

import { useRouter } from "next/navigation";
import { InfiniteFeed, PAGE_SIZE } from "@/components/feed/InfiniteFeed";
import { useToast } from "@/components/ui/Toast";
import { DEMO_PINS } from "@/lib/demo-pins";
import type { PinWithAuthor } from "@/types/database";

/**
 * Phase 6 feed, still backed by demo data. The `loadMore` signature is the one
 * the Supabase-backed server action will implement, so swapping the source in
 * Phase 7 touches only this file.
 */
export function HomeFeed({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  async function loadMore(offset: number) {
    // Simulated latency so the skeleton state is actually visible.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return DEMO_PINS.slice(offset, offset + PAGE_SIZE);
  }

  function handleSave(pin: PinWithAuthor) {
    if (!signedIn) {
      toast("Log in to save ideas.", {
        variant: "info",
        action: { label: "Log in", onClick: () => router.push("/login") },
      });
      return;
    }
    // Saving to a board lands in Phase 9.
    toast(`"${pin.title ?? "Pin"}" — save to board lands in the next phase.`, {
      variant: "info",
    });
  }

  return (
    <InfiniteFeed
      initialPins={DEMO_PINS.slice(0, PAGE_SIZE)}
      loadMore={loadMore}
      onSave={handleSave}
    />
  );
}
