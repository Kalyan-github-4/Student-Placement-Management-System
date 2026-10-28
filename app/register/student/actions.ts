"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { db } from "@/db";
import { students, users } from "@/db/schema";
import { sendVerificationEmail } from "@/lib/emails";
import { fieldErrors, formValues, passwordSchema, type FormState } from "@/lib/forms";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createAuthToken } from "@/lib/tokens";

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z.email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords don't match.",
  });

// Optional restriction to the college's email domain, e.g. "brainware.edu".
function allowedDomain() {
  return process.env.STUDENT_EMAIL_DOMAIN?.trim().toLowerCase() || null;
}

export async function registerStudent(_prev: FormState, formData: FormData): Promise<FormState> {
  const input = formValues(formData);
  const values = { ...input, password: "", confirmPassword: "" };
  const fail = (errors: Record<string, string>) => ({ errors, values });

  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return fail(fieldErrors(parsed.error));
  const email = parsed.data.email.toLowerCase();

  const domain = allowedDomain();
  if (domain && !email.endsWith(`@${domain}`)) {
    return fail({ email: `Use your college email address (@${domain}).` });
  }
  if (!(await rateLimit(`signup:${await clientIp()}`, 5, 60 * 60 * 1000))) {
    return fail({ email: "Too many registrations from your network. Try again later." });
  }

  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (taken) return fail({ email: "An account with this email already exists." });

  const userId = createId();
  await db.batch([
    db.insert(users).values({
      id: userId,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "STUDENT",
      status: "PENDING",
    }),
    db.insert(students).values({ userId, name: parsed.data.name }),
  ]);

  await sendVerificationEmail(email, await createAuthToken(userId, "EMAIL_VERIFICATION"));
  return { message: email };
}
