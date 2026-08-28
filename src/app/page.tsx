import { Suspense } from "react";
import { AppShell } from "@/components/providers/AppShell";
import { CategoryChips } from "@/components/feed/CategoryChips";
import { getSessionProfile } from "@/lib/auth/session";
import { HomeFeed } from "./HomeFeed";

export default async function Home() {
  const profile = await getSessionProfile();

  return (
    <AppShell profile={profile}>
      <Suspense fallback={<div className="h-16" />}>
        <CategoryChips />
      </Suspense>

      <main className="px-4 pb-16">
        <h1 className="sr-only">Home feed</h1>
        <HomeFeed signedIn={profile !== null} />
      </main>
    </AppShell>
  );
}
