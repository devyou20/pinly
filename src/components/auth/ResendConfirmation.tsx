"use client";

import { useState, useTransition } from "react";
import { resendConfirmation } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

export function ResendConfirmation({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleResend() {
    setMessage(null);
    startTransition(async () => {
      const result = await resendConfirmation(email);
      setMessage(result.message);
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-ink-muted">Didn&apos;t receive the link?</p>
      <Button type="button" variant="secondary" size="sm" loading={pending} onClick={handleResend}>
        Resend email
      </Button>
      {message && (
        <p role="status" className="basis-full text-xs text-ink-muted">
          {message}
        </p>
      )}
    </div>
  );
}
