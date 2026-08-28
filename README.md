# Pinly

A Pinterest-style visual discovery app — masonry feed, pin detail, boards, saves, and
comments — built with Next.js 15, Supabase, and Tailwind CSS v4.

> **Portfolio / demo project.** The interaction model and visual system are modelled on
> Pinterest's logged-in experience. All branding is original: the name, the pin-drop
> mark, and the wordmark are this project's own. No Pinterest assets are used.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript, strict mode |
| Styling | Tailwind CSS v4 (`@theme` tokens, no config file) |
| Backend | Supabase — Postgres, Auth, Storage, Row Level Security |
| Supabase clients | `@supabase/supabase-js` + `@supabase/ssr` |
| Icons | `lucide-react` |
| Forms | `react-hook-form` + `zod` |
| State | Server Components + `useState` / `useTransition`. No Redux. |

## Build status

| Phase | Status |
|---|---|
| 1. Scaffold, Tailwind, Supabase clients, env wiring | Done |
| 2. Migration, buckets, RLS verification | SQL written; awaiting run |
| 3. Auth — signup, login, logout, route protection | Done |
| 4. Design system primitives | Done |
| 5. Top navigation | Done |
| 6. Masonry grid, pin card, infinite scroll | Done (demo data) |
| 7. Upload flow | Not started |
| 8. Pin detail page | Not started |
| 9. Save-to-board, boards, comments | Not started |
| 10. Profiles, follows, search | Not started |
| 11. Polish pass | Not started |

The feed currently renders demo data from `src/lib/demo-pins.ts`. `src/app/HomeFeed.tsx`
already implements the `loadMore(offset)` signature the Supabase-backed loader will use,
so swapping the data source touches one file.

## Setup

### 1. Create a Supabase project

At [supabase.com](https://supabase.com), then note **Project Settings → API**:
the project URL, the `anon` key, and the `service_role` key.

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local` is gitignored. The `service_role` key bypasses Row Level Security
entirely — keep it server-side, never prefix it with `NEXT_PUBLIC_`, and never commit it.

### 3. Database and storage

Open **SQL Editor** in the Supabase dashboard and run [`supabase/SETUP.sql`](supabase/SETUP.sql).
That single file creates:

- six tables — `profiles`, `boards`, `pins`, `saves`, `comments`, `follows`
- indexes, including `pg_trgm` GIN indexes on `pins.title` / `pins.description` for search
- the `handle_new_user` trigger that creates a `profiles` row on signup
- every RLS policy
- the `pins` and `avatars` storage buckets and their policies

It is idempotent — safe to run more than once. The same content is split across
`supabase/migrations/0001_init.sql` (schema + RLS) and `0002_storage.sql` (buckets)
if you prefer to apply them separately.

### 4. Google OAuth (optional)

Off by default. To enable, configure the Google provider in Supabase Auth, add
`<site-url>/auth/callback` as a redirect URL, then set:

```
NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=true
```

The button and its divider only render when this flag is on.

### 5. Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run build:check` | Build into `.next-build` — safe to run **while `dev` is running** |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

`npm run build` writes to the same `.next` the dev server reads from, which corrupts a
running dev server (`Cannot find module './xxx.js'`). Use `build:check` to verify a build
without stopping dev.

## Architecture notes

**Three Supabase clients, one job each.** `src/lib/supabase/client.ts` (browser),
`server.ts` (Server Components, Actions, Route Handlers), and `middleware.ts`
(session refresh). `admin.ts` is a service-role client guarded by `import "server-only"`.

**Middleware returns the response object it mutated.** Building a fresh `NextResponse`
at the end silently drops the refreshed auth cookies and logs users out — the most
common `@supabase/ssr` bug. Nothing runs between `createServerClient` and `getUser()`,
because `getUser()` is what revalidates the token and writes the cookies.

**Layout stability.** Every pin row stores intrinsic `width` and `height`, and the card
reserves that exact aspect ratio before the image loads. This is what stops the masonry
grid reflowing as images arrive.

**Login errors are deliberately vague.** "That email or password isn't right" rather than
distinguishing the two, so the form can't be used to enumerate registered addresses.

**`next=` redirect parameters are validated** in both the auth actions and the OAuth
callback — must start with `/` and not `//`, otherwise it is an open redirect.

**Signup checks username availability before creating the auth user**, so the unique
constraint on `profiles` cannot fail inside the trigger *after* `auth.users` already has
a row. The database constraint remains the real guarantee.

## Licence

MIT
