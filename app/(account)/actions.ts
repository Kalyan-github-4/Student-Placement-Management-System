"use server";

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/emails";
import { fieldErrors, passwordSchema, type FormState } from "@/lib/forms";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { consumeAuthToken, createAuthToken } from "@/lib/tokens";

const HOUR = 60 * 60 * 1000;

// Email ownership is what activates a self-registered account. Recruiters still wait
// for company approval, and students for profile verification, but those gates live
// on the company and student records, not on the login.
const verifiedFields = {
  emailVerified: sql`coalesce(${users.emailVerified}, now())`,
  status: sql`case when ${users.role} in ('RECRUITER', 'STUDENT') and ${users.status} = 'PENDING' then 'ACTIVE' else ${users.status} end`,
};

export async function verifyEmail(token: string): Promise<FormState> {
  const userId = await consumeAuthToken(token, "EMAIL_VERIFICATION");
  if (!userId) return { message: "This link is invalid, expired or already used." };

  await db.update(users).set(verifiedFields).where(eq(users.id, userId));
  redirect("/login?notice=verified");
}

const emailSchema = z.object({ email: z.email("Enter a valid email address.") });

export async function resendVerification(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const email = parsed.data.email.toLowerCase();

  const ip = await clientIp();
  if (!(await rateLimit(`resend:${ip}`, 10, HOUR)) || !(await rateLimit(`resend:${email}`, 3, HOUR))) {
    return { errors: { email: "Too many requests. Try again later." } };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (user && !user.emailVerified) {
    await sendVerificationEmail(email, await createAuthToken(user.id, "EMAIL_VERIFICATION"));
  }
  return { message: "If that account needs verifying, we've sent a new link. Check your inbox." };
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const email = parsed.data.email.toLowerCase();

  const ip = await clientIp();
  if (!(await rateLimit(`reset:${ip}`, 10, HOUR)) || !(await rateLimit(`reset:${email}`, 3, HOUR))) {
    return { errors: { email: "Too many requests. Try again later." } };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (user && user.status !== "SUSPENDED") {
    await sendPasswordResetEmail(email, await createAuthToken(user.id, "PASSWORD_RESET"));
  }
  // Same answer either way, so the form can't be used to discover accounts.
  return { message: "If an account exists for that email, we've sent a reset link." };
}

const setPasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords don't match.",
  });

export async function setPassword(
  token: string,
  mode: "reset" | "activate",
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const userId = await consumeAuthToken(
    token,
    mode === "reset" ? "PASSWORD_RESET" : "ACCOUNT_ACTIVATION"
  );
  if (!userId) return { message: "This link is invalid, expired or already used." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db
    .update(users)
    .set({
      passwordHash,
      failedLoginCount: 0,
      lockedUntil: null,
      // An activation link is issued by an admin, so it also confirms the account.
      ...(mode === "activate"
        ? {
            emailVerified: sql`coalesce(${users.emailVerified}, now())`,
            status: sql`case when ${users.status} = 'SUSPENDED' then ${users.status} else 'ACTIVE' end`,
          }
        : verifiedFields),
    })
    .where(eq(users.id, userId));

  redirect(`/login?notice=${mode === "reset" ? "password-reset" : "activated"}`);
}
