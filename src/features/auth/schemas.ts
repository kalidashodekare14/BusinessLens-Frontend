import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(10, "At least 10 characters"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const organizationSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  currency: z.string().min(1, "Currency is required"),
  timezone: z.string().min(1, "Time zone is required"),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
