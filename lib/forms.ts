import { z } from "zod";

// Returned by form actions: per-field errors plus what was typed, so the form can refill.
export type FormState =
  | { errors?: Record<string, string>; values?: Record<string, string>; message?: string }
  | undefined;

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

// Flattens zod issues into one message per field for the form.
export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0]);
    errors[field] ??= issue.message;
  }
  return errors;
}

export function formValues(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()]
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, String(value)])
  );
}
