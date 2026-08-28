/**
 * Centralised, typed access to environment variables.
 *
 * Anything read here that is NOT prefixed with NEXT_PUBLIC_ must only ever be
 * imported from server-side code (Server Components, Route Handlers, scripts).
 */

function readPublic(key: string, value: string | undefined): string {
  if (!value || value.startsWith("your-")) {
    throw new Error(
      `Missing environment variable ${key}. Copy .env.example to .env.local and fill in your Supabase project values.`,
    );
  }
  return value;
}

/**
 * True when Supabase env vars look real. Lets the UI render a helpful
 * "finish your setup" state instead of a stack trace on a fresh clone.
 */
export const isSupabaseConfigured: boolean =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("your-") &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith("your-");

export function supabaseUrl(): string {
  return readPublic("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabaseAnonKey(): string {
  return readPublic("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const googleOAuthEnabled: boolean =
  process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH === "true";

export const siteUrl: string =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/** Hostname of the Supabase storage CDN, used for next/image remotePatterns. */
export function supabaseHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}
