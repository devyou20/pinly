import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";
import { APP_NAME } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Sign up",
  description: `Create a ${APP_NAME} account and start collecting ideas.`,
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthCard
      title={`Welcome to ${APP_NAME}`}
      subtitle="Find new ideas to try"
      next={next}
      footer={
        <>
          Already a member?{" "}
          <Link href={loginHref} className="font-semibold text-ink hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-80" />}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
