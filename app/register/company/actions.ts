"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { db } from "@/db";
import { companies, companyInvites, companyUsers, users } from "@/db/schema";
import { auditInsert } from "@/lib/audit";
import {
  companyDetailsSchema,
  domainFromWebsite,
  emailMatchesDomain,
  isFreeEmail,
  recruiterSchema,
} from "@/lib/company";
import { sendVerificationEmail } from "@/lib/emails";
import { fieldErrors, formValues, passwordSchema, type FormState } from "@/lib/forms";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getValidInvite } from "@/lib/data/invites";
import { createAuthToken } from "@/lib/tokens";

const registrationSchema = companyDetailsSchema
  .extend(recruiterSchema.shape)
  .extend({
    email: z.email("Enter your official email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords don't match.",
  });

export async function registerCompany(
  inviteToken: string | null,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const input = formValues(formData);
  // Passwords are never sent back to refill the form.
  const values = { ...input, password: "", confirmPassword: "" };
  const fail = (errors: Record<string, string>) => ({ errors, values });

  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return fail(fieldErrors(parsed.error));
  const { recruiterName, designation, phone, email: rawEmail, password } = parsed.data;
  const company = companyDetailsSchema.parse(input);
  const email = rawEmail.toLowerCase();

  const domain = domainFromWebsite(company.website)!;
  if (isFreeEmail(email)) {
    return fail({ email: "Use your official company email, not a personal address." });
  }
  if (!emailMatchesDomain(email, domain)) {
    return fail({ email: `Use an email address on your company's domain (${domain}).` });
  }

  if (!(await rateLimit(`signup:${await clientIp()}`, 5, 60 * 60 * 1000))) {
    return fail({ email: "Too many registrations from your network. Try again later." });
  }

  const invite = inviteToken ? await getValidInvite(inviteToken) : null;
  if (inviteToken && !invite) return fail({ email: "This invitation is invalid or has expired." });
  if (invite && invite.email !== email) {
    return fail({ email: `This invitation is for ${invite.email}.` });
  }

  const [[emailTaken], [domainTaken]] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.email, email)),
    db.select({ id: companies.id }).from(companies).where(eq(companies.domain, domain)),
  ]);
  if (emailTaken) return fail({ email: "An account with this email already exists." });
  if (domainTaken) {
    return fail({
      website: `A company with the domain ${domain} is already registered. Ask your company admin to add you.`,
    });
  }

  const userId = createId();
  const companyId = createId();
  const now = new Date();

  // An invite was sent to this exact address, which proves ownership and pre-approves.
  await db.batch([
    db.insert(users).values({
      id: userId,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "RECRUITER",
      status: invite ? "ACTIVE" : "PENDING",
      emailVerified: invite ? now : null,
    }),
    db.insert(companies).values({
      id: companyId,
      ...company,
      domain,
      status: invite ? "APPROVED" : "PENDING",
      reviewedBy: invite?.invitedBy ?? null,
      reviewedAt: invite ? now : null,
    }),
    db.insert(companyUsers).values({
      userId,
      companyId,
      name: recruiterName,
      designation,
      phone,
      isAdmin: true,
    }),
    ...(invite
      ? [
          db
            .update(companyInvites)
            .set({ acceptedAt: now })
            .where(eq(companyInvites.id, invite.id)),
          auditInsert({
            actorId: invite.invitedBy,
            action: "company.approved_via_invite",
            entity: "company",
            entityId: companyId,
            after: { status: "APPROVED", inviteId: invite.id },
          }),
        ]
      : []),
  ]);

  if (invite) redirect("/login?notice=registered");

  await sendVerificationEmail(email, await createAuthToken(userId, "EMAIL_VERIFICATION"));
  return { message: email };
}
