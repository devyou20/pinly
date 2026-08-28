"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { signup } from "@/app/(auth)/actions";
import { signupSchema, type SignupValues } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", username: "", full_name: "" },
  });

  function onSubmit(values: SignupValues) {
    setFormError(null);

    startTransition(async () => {
      const result = await signup(values, next);

      if (!result.ok) {
        if (result.field) setError(result.field, { message: result.message });
        setFormError(result.message);
        return;
      }

      if (result.redirectTo.includes("checkEmail")) {
        toast("Check your inbox to confirm your email.", { variant: "info" });
      } else {
        toast("Welcome to Pinly.", { variant: "success" });
      }

      router.replace(result.redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Create a password"
        error={errors.password?.message}
        hint={!errors.password ? "At least 8 characters" : undefined}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="rounded-full p-1.5 text-ink-muted transition-colors duration-200 hover:bg-secondary hover:text-ink"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
        {...register("password")}
      />

      <Input
        label="Username"
        autoComplete="username"
        placeholder="yourname"
        error={errors.username?.message}
        leading={<span className="text-ink-muted">@</span>}
        {...register("username")}
      />

      <Input
        label="Name (optional)"
        autoComplete="name"
        placeholder="Your name"
        error={errors.full_name?.message}
        {...register("full_name")}
      />

      {formError && (
        <p role="alert" className="px-1 text-sm font-medium text-accent">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth loading={pending} className="mt-2">
        Continue
      </Button>
    </form>
  );
}
