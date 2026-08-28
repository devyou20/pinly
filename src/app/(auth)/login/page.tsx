import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { APP_NAME } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Log in",
  description: `Log in to ${APP_NAME} to save ideas and build boards.`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; checkEmail?: string }>;
}) {
  const { next, checkEmail } = await searchParams;
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

  return (
    <AuthCard
      title={`Welcome to ${APP_NAME}`}
      subtitle="Log in to see your ideas"
      next={next}
      footer={
        <>
          Not on {APP_NAME} yet?{" "}
          <Link href={signupHref} className="font-semibold text-ink hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {checkEmail && (
        <p
          role="status"
          className="mb-4 rounded-2xl bg-surface-alt px-4 py-3 text-sm text-ink"
        >
          Almost there — confirm your email address, then log in.
        </p>
      )}

      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
