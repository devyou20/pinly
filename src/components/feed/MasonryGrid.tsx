"use client";

import { PinCard } from "./PinCard";
import type { PinWithAuthor } from "@/types/database";

export function MasonryGrid({
  pins,
  onSave,
}: {
  pins: PinWithAuthor[];
  onSave?: (pin: PinWithAuthor) => void;
}) {
  return (
    <div className="masonry">
      {pins.map((pin, i) => (
        <PinCard key={pin.id} pin={pin} eager={i < 12} onSave={onSave} />
      ))}
    </div>
  );
}
