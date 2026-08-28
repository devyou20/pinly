import { ImageResponse } from "next/og";

// Apple touch icons must be raster, so this is generated rather than served
// as SVG the way src/app/icon.svg is.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E60023",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 96 96">
          <path
            d="M48 20c11.05 0 20 8.73 20 19.5 0 8.1-5.02 16.2-15.05 24.31a8 8 0 0 1-9.9 0C33.02 55.7 28 47.6 28 39.5 28 28.73 36.95 20 48 20Z"
            fill="#fff"
          />
          <circle cx="48" cy="39" r="7.5" fill="#E60023" />
          <rect x="44.5" y="63" width="7" height="15" rx="3.5" fill="#fff" />
        </svg>
      </div>
    ),
    size,
  );
}
