"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  loginSchema,
  signupSchema,
  type AuthResult,
} from "@/lib/auth/schemas";

const NOT_CONFIGURED =
  "Supabase isn't configured yet. Add your project URL and anon key to .env.local.";

/** Only allow same-origin relative paths as post-auth redirects. */
function safeRedirect(next: string | undefined | null): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export async function login(
  values: unknown,
  next?: string,
): Promise<AuthResult> {
  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Deliberately vague: distinguishing "no such user" from "wrong password"
    // lets an attacker enumerate registered addresses.
    const message =
      error.status === 400
        ? "That email or password isn't right."
        : error.message;
    return { ok: false, message };
  }

  revalidatePath("/", "layout");
  return { ok: true, redirectTo: safeRedirect(next) };
}

export async function signup(
  values: unknown,
  next?: string,
): Promise<AuthResult> {
  if (!isSupabaseConfigured) return { ok: false, message: NOT_CONFIGURED };

  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? "Check your details." };
  }

  const { email, password, username, full_name } = parsed.data;
  const supabase = await createClient();

  // Claim the username before creating the account so the unique constraint on
  // profiles cannot fail *after* an auth user already exists.
  const { data: taken, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (lookupError) {
    return { ok: false, message: `Couldn't verify username. ${lookupError.message}` };
  }
  if (taken) {
    return {
      ok: false,
      message: "That username is already taken.",
      field: "username",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // handle_new_user() reads these to populate the profiles row.
    options: { data: { username, full_name: full_name || null } },
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
      field: error.message.toLowerCase().includes("password")
        ? "password"
        : "email",
    };
  }

  // With email confirmation enabled Supabase returns a user but no session.
  if (data.user && !data.session) {
    return {
      ok: true,
      redirectTo: `/login?checkEmail=1&email=${encodeURIComponent(email)}`,
    };
  }

  revalidatePath("/", "layout");
  return { ok: true, redirectTo: safeRedirect(next) };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
