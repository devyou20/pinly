import { cn, placeholderColor } from "@/lib/utils";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={cn("skeleton rounded-card", className)} style={style} />;
}

/**
 * Feed placeholder. Heights are deterministic per index so server and client
 * render identically — Math.random() here would hydration-mismatch.
 */
const CARD_HEIGHTS = [320, 240, 400, 280, 360, 220, 300, 440, 260, 340];

export function PinCardSkeleton({ index = 0 }: { index?: number }) {
  const height = CARD_HEIGHTS[index % CARD_HEIGHTS.length];

  return (
    <div className="w-full">
      <Skeleton
        className="w-full"
        style={{ height, background: placeholderColor(String(index)) }}
      />
      <div className="flex flex-col gap-1.5 px-2 pt-2">
        <Skeleton className="h-3 w-3/4 rounded-full" />
        <div className="flex items-center gap-1.5 pt-0.5">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-2.5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="masonry" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <PinCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
