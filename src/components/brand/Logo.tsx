import Link from "next/link";

export const APP_NAME = "Pinly";

/** The Pinly pin-drop mark. Inline SVG so it inherits currentColor-free brand red. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="96" height="96" rx="24" fill="#E60023" />
      <path
        d="M48 20c11.05 0 20 8.73 20 19.5 0 8.1-5.02 16.2-15.05 24.31a8 8 0 0 1-9.9 0C33.02 55.7 28 47.6 28 39.5 28 28.73 36.95 20 48 20Z"
        fill="#fff"
      />
      <circle cx="48" cy="39" r="7.5" fill="#E60023" />
      <rect x="44.5" y="63" width="7" height="15" rx="3.5" fill="#fff" />
    </svg>
  );
}

/** Mark + wordmark, linking home. */
export function Logo({
  showWordmark = false,
  className = "",
}: {
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${APP_NAME} home`}
      className={`flex shrink-0 items-center gap-2 rounded-full p-1 transition-colors duration-200 hover:bg-secondary ${className}`}
    >
      <LogoMark size={32} />
      {showWordmark && (
        <span className="pr-2 text-[22px] font-bold tracking-tight text-ink">
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
