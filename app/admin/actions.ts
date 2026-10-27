"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { db } from "@/db";
import { tpoProfiles, users } from "@/db/schema";
import { auditInsert } from "@/lib/audit";
import { requireRole } from "@/lib/dal";
import { sendTpoActivationEmail } from "@/lib/emails";
import { fieldErrors, formValues, type FormState } from "@/lib/forms";
import { createAuthToken } from "@/lib/tokens";

const tpoSchema = z.object({
  name: z.string().trim().min(2, "Enter the full name.").max(100),
  designation: z.string().trim().min(2, "Enter the designation.").max(100),
  email: z.email("Enter a valid email address."),
});

export async function createTpo(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole("SUPER_ADMIN");
  const values = formValues(formData);
  const parsed = tpoSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const email = parsed.data.email.toLowerCase();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return { errors: { email: "This email already has an account." }, values };

  const userId = createId();
  await db.batch([
    db.insert(users).values({ id: userId, email, role: "TPO", status: "PENDING" }),
    db.insert(tpoProfiles).values({
      userId,
      name: parsed.data.name,
      designation: parsed.data.designation,
      createdBy: admin.id,
    }),
    auditInsert({
      actorId: admin.id,
      action: "tpo.created",
      entity: "user",
      entityId: userId,
      after: { email, name: parsed.data.name, designation: parsed.data.designation },
    }),
  ]);

  const token = await createAuthToken(userId, "ACCOUNT_ACTIVATION");
  await sendTpoActivationEmail(email, parsed.data.name, token);
  refresh();
  return { message: `Account created. An activation link was sent to ${email}.` };
}

async function getTpo(userId: string) {
  const [tpo] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.role, "TPO")));
  return tpo ?? null;
}

export async function setTpoAccess(userId: string, enable: boolean): Promise<FormState> {
  const admin = await requireRole("SUPER_ADMIN");
  const tpo = await getTpo(userId);
  if (!tpo) return { message: "TPO account not found." };

  // Re-enabling returns an account that never set a password to PENDING, not ACTIVE.
  const status = !enable ? "SUSPENDED" : tpo.passwordHash ? "ACTIVE" : "PENDING";
  await db.batch([
    db.update(users).set({ status }).where(eq(users.id, userId)),
    auditInsert({
      actorId: admin.id,
      action: enable ? "tpo.enabled" : "tpo.disabled",
      entity: "user",
      entityId: userId,
      before: { status: tpo.status },
      after: { status },
    }),
  ]);
  refresh();
}

export async function resendTpoActivation(userId: string): Promise<FormState> {
  await requireRole("SUPER_ADMIN");
  const tpo = await getTpo(userId);
  if (!tpo || tpo.passwordHash || tpo.status === "SUSPENDED") {
    return { message: "This account can't be sent an activation link." };
  }
  const [profile] = await db.select().from(tpoProfiles).where(eq(tpoProfiles.userId, userId));
  await sendTpoActivationEmail(
    tpo.email,
    profile?.name ?? tpo.email,
    await createAuthToken(userId, "ACCOUNT_ACTIVATION")
  );
  return { message: "Activation link sent." };
}
