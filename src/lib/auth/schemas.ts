import { z } from "zod";

/** Supabase's own minimum is 6; 8 is a deliberately stricter floor. */
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

const email = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email,
  password,
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or fewer")
    .regex(
      /^[a-z0-9._]+$/,
      "Use lowercase letters, numbers, dots and underscores only",
    ),
  full_name: z
    .string()
    .max(80, "Name must be 80 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;

/** Discriminated result returned by the auth server actions. */
export type AuthResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string; field?: "email" | "password" | "username" };
