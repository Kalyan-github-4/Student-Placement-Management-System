"use server";

import { and, eq, inArray } from "drizzle-orm";
import { refresh } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { companies, companyInvites, users } from "@/db/schema";
import { auditInsert } from "@/lib/audit";
import { isFreeEmail } from "@/lib/company";
import { requireRole } from "@/lib/dal";
import { getCompanyForReview, type CompanyStatus } from "@/lib/data/tpo";
import {
  sendCompanyApprovedEmail,
  sendCompanyInviteEmail,
  sendCompanyRejectedEmail,
  sendCompanyReinstatedEmail,
  sendCompanySuspendedEmail,
} from "@/lib/emails";
import { fieldErrors, formValues, type FormState } from "@/lib/forms";
import { generateToken, hashToken } from "@/lib/tokens";

type Decision = "approve" | "reject" | "suspend" | "reinstate";

const transitions: Record<Decision, { from: CompanyStatus[]; to: CompanyStatus; action: string }> = {
  approve: { from: ["PENDING"], to: "APPROVED", action: "company.approved" },
  reject: { from: ["PENDING"], to: "REJECTED", action: "company.rejected" },
  suspend: { from: ["APPROVED"], to: "SUSPENDED", action: "company.suspended" },
  reinstate: { from: ["SUSPENDED"], to: "APPROVED", action: "company.reinstated" },
};

const reasonSchema = z
  .string()
  .trim()
  .min(5, "Give a reason the company can act on.")
  .max(500, "Keep the reason under 500 characters.");

export async function decideCompany(
  companyId: string,
  decision: Decision,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const tpo = await requireRole("TPO", "SUPER_ADMIN");
  const company = await getCompanyForReview(companyId);
  if (!company) return { message: "Company not found." };

  const { from, to, action } = transitions[decision];
  if (!from.includes(company.status)) {
    return { message: `This company is ${company.status.toLowerCase()}; refresh the page.` };
  }

  let reason: string | null = null;
  if (decision === "reject" || decision === "suspend") {
    const parsed = reasonSchema.safeParse(formData.get("reason"));
    if (!parsed.success) return { errors: { reason: parsed.error.issues[0].message } };
    reason = parsed.data;
  }

  if (decision === "approve") {
    if (!company.gstinOrCin) return { message: "Add a GSTIN or CIN before approving." };
    if (!company.members.some((m) => m.user.emailVerified)) {
      return { message: "The recruiter hasn't verified their email address yet." };
    }
  }

  await db.batch([
    db
      .update(companies)
      .set({
        status: to,
        rejectionReason: reason,
        reviewedBy: tpo.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      // The status condition stops two reviewers from acting on a stale page.
      .where(and(eq(companies.id, companyId), inArray(companies.status, from))),
    auditInsert({
      actorId: tpo.id,
      action,
      entity: "company",
      entityId: companyId,
      before: { status: company.status, rejectionReason: company.rejectionReason },
      after: { status: to, rejectionReason: reason },
    }),
  ]);

  const recipients = company.members.filter((m) => m.user.emailVerified).map((m) => m.user.email);
  await Promise.all(
    recipients.map((to) => {
      switch (decision) {
        case "approve":
          return sendCompanyApprovedEmail(to, company.name);
        case "reject":
          return sendCompanyRejectedEmail(to, company.name, reason!);
        case "suspend":
          return sendCompanySuspendedEmail(to, company.name, reason!);
        case "reinstate":
          return sendCompanyReinstatedEmail(to, company.name);
      }
    })
  );

  refresh();
  return undefined;
}

const inviteSchema = z.object({
  companyName: z.string().trim().min(2, "Enter the company name.").max(120),
  email: z.email("Enter the recruiter's official email."),
});

const INVITE_LIFETIME_MS = 14 * 24 * 60 * 60 * 1000;

export async function inviteCompany(_prev: FormState, formData: FormData): Promise<FormState> {
  const tpo = await requireRole("TPO", "SUPER_ADMIN");
  const values = formValues(formData);
  const parsed = inviteSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const email = parsed.data.email.toLowerCase();
  if (isFreeEmail(email)) {
    return { errors: { email: "Use the recruiter's company email, not a personal address." }, values };
  }
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return { errors: { email: "This email already has an account." }, values };

  const token = generateToken();
  const [invite] = await db
    .insert(companyInvites)
    .values({
      email,
      companyName: parsed.data.companyName,
      tokenHash: hashToken(token),
      invitedBy: tpo.id,
      expiresAt: new Date(Date.now() + INVITE_LIFETIME_MS),
    })
    .returning({ id: companyInvites.id });
  await auditInsert({
    actorId: tpo.id,
    action: "company.invited",
    entity: "company_invite",
    entityId: invite.id,
    after: { email, companyName: parsed.data.companyName },
  });

  await sendCompanyInviteEmail(email, parsed.data.companyName, token);
  refresh();
  return { message: `Invitation sent to ${email}.` };
}
