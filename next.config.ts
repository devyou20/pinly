import type { NextConfig } from "next";

/** Supabase storage hostname, derived from the project URL. */
function supabaseHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const host = supabaseHost();

const nextConfig: NextConfig = {
  // Lets `npm run build:check` write elsewhere so a verification build never
  // clobbers the .next directory a running `npm run dev` is serving from.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  images: {
    remotePatterns: [
      // Supabase Storage public objects
      ...(host
        ? ([
            {
              protocol: "https" as const,
              hostname: host,
              pathname: "/storage/v1/object/public/**",
            },
          ])
        : []),
      // Seed data sources
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Google avatars from OAuth
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
