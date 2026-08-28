import Link from "next/link";
import { X } from "lucide-react";
import { BlurredFeedBackdrop } from "@/components/auth/BlurredFeedBackdrop";
import { ToastProvider } from "@/components/ui/Toast";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <BlurredFeedBackdrop />

      <div className="flex min-h-screen items-center justify-center p-4">
        <Link
          href="/"
          aria-label="Close and return to the feed"
          className="fixed left-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur transition-colors duration-200 hover:bg-secondary"
        >
          <X className="size-5" />
        </Link>

        <div className="animate-modal-in w-full max-w-[420px]">{children}</div>
      </div>
    </ToastProvider>
  );
}
