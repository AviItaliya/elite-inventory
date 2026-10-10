import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Invalid email address.")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(16, "Password cannot exceed 16 characters."),

  role: z.enum(["ADMIN", "MANAGER", "STAFF"]).default("STAFF"),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters.")
    .optional(),

  email: z
    .string()
    .trim()
    .email("Invalid email address.")
    .transform((email) => email.toLowerCase())
    .optional(),

  role: z
    .enum(["ADMIN", "MANAGER", "STAFF"])
    .optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});