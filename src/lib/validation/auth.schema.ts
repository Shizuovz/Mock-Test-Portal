import { z } from "zod";

export const emailSchema = z.string().email();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
});

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2).max(120),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
