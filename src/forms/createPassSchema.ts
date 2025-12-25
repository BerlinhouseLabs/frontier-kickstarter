import { z } from "zod";

export const createPassSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long"),
  email: z
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" }),
  expiresAt: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Please enter a valid date"
    ),
});

export type CreatePassFormData = z.infer<typeof createPassSchema>;
