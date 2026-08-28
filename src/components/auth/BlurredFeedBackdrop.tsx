import Image from "next/image";
import { DEMO_PINS } from "@/lib/demo-pins";
import { placeholderColor } from "@/lib/utils";

/**
 * Blurred masonry behind the auth sheet, matching Pinterest's onboarding.
 * Purely decorative — hidden from assistive tech and never interactive.
 */
export function BlurredFeedBackdrop() {
  // Enough tiles to fill a wide viewport; short columns leave white gaps.
  const pins = DEMO_PINS.slice(0, 48);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg"
    >
      {/* Oversized and offset so the blur's soft edges fall outside the viewport. */}
      <div className="absolute -inset-[8%] w-[116%]">
        <div className="masonry blur-2xl saturate-[1.15]">
          {pins.map((pin) => (
            <div
              key={pin.id}
              className="relative w-full overflow-hidden rounded-card"
              style={{
                aspectRatio: `${pin.width} / ${pin.height}`,
                background: placeholderColor(pin.id),
              }}
            >
              <Image
                src={pin.image_url}
                alt=""
                width={pin.width}
                height={pin.height}
                sizes="236px"
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Wash out the imagery so the sheet stays the focal point. */}
      <div className="absolute inset-0 bg-bg/55" />
    </div>
  );
}
