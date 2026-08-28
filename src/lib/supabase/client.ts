"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Browser Supabase client. Safe to call on every render — @supabase/ssr
 * memoises the underlying client per browser context.
 *
 * Session storage is cookie-based so the server client (and middleware) sees
 * the same session.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey());
}

export type SupabaseBrowserClient = ReturnType<typeof createClient>;
