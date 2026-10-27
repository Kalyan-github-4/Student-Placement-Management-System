"use server";

import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { auditInsert } from "@/lib/audit";
import {
  companyDetailsSchema,
  domainFromWebsite,
  emailMatchesDomain,
  legalFields,
} from "@/lib/company";
import { requireRole } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
import { fieldErrors, formValues, type FormState } from "@/lib/forms";

export async function updateCompany(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("RECRUITER");
  const membership = await getRecruiterCompany(user.id);
  if (!membership?.isAdmin) return { message: "Only the company admin can edit these details." };

  const { company } = membership;
  if (company.status === "SUSPENDED") {
    return { message: "A suspended company can't be edited. Contact the placement cell." };
  }

  const values = formValues(formData);
  const input = { ...values };
  // Legal fields are disabled in the form once approved; keep the stored values.
  if (company.status === "APPROVED") {
    for (const field of legalFields) input[field] = company[field] ?? "";
  }

  const parsed = companyDetailsSchema.safeParse(input);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const domain = domainFromWebsite(parsed.data.website)!;
  if (domain !== company.domain) {
    if (!emailMatchesDomain(user.email, domain)) {
      return { errors: { website: `The website must match your email domain.` }, values };
    }
    const [taken] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(and(eq(companies.domain, domain), ne(companies.id, company.id)));
    if (taken) {
      return { errors: { website: `Another company is registered with ${domain}.` }, values };
    }
  }

  // Saving after a rejection sends the company back to the TPO for review.
  const resubmitted = company.status === "REJECTED";
  await db.batch([
    db
      .update(companies)
      .set({
        ...parsed.data,
        domain,
        updatedAt: new Date(),
        ...(resubmitted ? { status: "PENDING" as const, rejectionReason: null } : {}),
      })
      .where(eq(companies.id, company.id)),
    ...(resubmitted
      ? [
          auditInsert({
            actorId: user.id,
            action: "company.resubmitted",
            entity: "company",
            entityId: company.id,
            before: { status: "REJECTED", rejectionReason: company.rejectionReason },
            after: { status: "PENDING" },
          }),
        ]
      : []),
  ]);

  redirect("/company");
}
