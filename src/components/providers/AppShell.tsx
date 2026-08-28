"use client";

import { useRouter } from "next/navigation";
import { Suspense, useTransition } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { signOut } from "@/app/(auth)/actions";
import type { SessionProfile } from "@/lib/auth/session";

function Shell({
  profile,
  children,
}: {
  profile: SessionProfile | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { toast, toastError } = useToast();

  function handleSignOut() {
    startTransition(async () => {
      try {
        await signOut();
        toast("You're logged out.", { variant: "info" });
        router.replace("/");
        router.refresh();
      } catch (error) {
        toastError(
          "Couldn't log out.",
          error instanceof Error ? error : null,
        );
      }
    });
  }

  return (
    <>
      <Suspense fallback={<div className="h-20" />}>
        <TopNav profile={profile} onSignOut={handleSignOut} />
      </Suspense>
      {children}
    </>
  );
}

export function AppShell({
  profile,
  children,
}: {
  profile: SessionProfile | null;
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Shell profile={profile}>{children}</Shell>
    </ToastProvider>
  );
}
