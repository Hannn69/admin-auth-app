import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().min(5).max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email().min(5).max(255),
  password: z.string().min(8).max(128),
});