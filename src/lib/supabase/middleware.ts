import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import type { Database } from "@/types/database";

/** Routes that require a signed-in user. Prefix match. */
const PROTECTED_PREFIXES = ["/create", "/settings"];

/** Auth pages a signed-in user should be bounced away from. */
const AUTH_ROUTES = ["/login", "/signup"];

/**
 * Refreshes the Supabase auth cookie on every request and enforces route
 * protection. Must return the exact response object it mutated, otherwise the
 * refreshed cookies are dropped and the user is silently logged out.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Without env vars there is no session to refresh — let the app render its
  // setup screen rather than crashing every route.
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not run code between createServerClient and getUser(): getUser()
  // revalidates the token and is what writes the refreshed cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
