import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Profile } from "@/types/database";

export type SessionProfile = Pick<
  Profile,
  "id" | "username" | "full_name" | "avatar_url"
>;

/**
 * The signed-in user's profile, or null. Never throws — an unconfigured
 * project or a failed lookup renders the logged-out shell rather than a 500.
 */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    return data ?? null;
  } catch {
    return null;
  }
}
