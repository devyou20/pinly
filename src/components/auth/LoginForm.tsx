"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/app/(auth)/actions";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export function LoginForm() {
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
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: params.get("email") ?? "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    setFormError(null);

    startTransition(async () => {
      const result = await login(values, next);

      if (!result.ok) {
        if (result.field) {
          setError(result.field === "username" ? "email" : result.field, {
            message: result.message,
          });
        }
        setFormError(result.message);
        return;
      }

      toast("Welcome back.", { variant: "success" });
      router.replace(result.redirectTo);
      // Re-fetch server components so the nav picks up the new session.
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
        autoComplete="current-password"
        placeholder="Password"
        error={errors.password?.message}
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

      {formError && (
        <p role="alert" className="px-1 text-sm font-medium text-accent">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth loading={pending} className="mt-2">
        Log in
      </Button>
    </form>
  );
}
