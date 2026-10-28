"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db } from "@/db";
import { companies, documents } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
import { getDrive, saveDrive } from "@/lib/data/drives";
import { driveFormInput, driveSchema } from "@/lib/drives";
import { fieldErrors, type FormState } from "@/lib/forms";
import { deleteStoredFile, storeFile } from "@/lib/storage";

async function requireApprovedRecruiter() {
  const user = await requireRole("RECRUITER");
  const membership = await getRecruiterCompany(user.id);
  if (!membership || membership.company.status !== "APPROVED") return null;
  return { user, membership };
}

// Recruiters draft drives and submit them; the TPO approves before students see them.
// Only drafts and drives awaiting approval can be edited by the company.
export async function saveCompanyDrive(
  driveId: string | null,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await requireApprovedRecruiter();
  if (!ctx) return { message: "Only approved companies can post drives." };
  const { user, membership } = ctx;

  const { input, values } = driveFormInput(formData);
  const parsed = driveSchema.safeParse(input);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const submit = formData.get("intent") === "publish";
  if (submit && parsed.data.deadline <= new Date()) {
    return { errors: { deadline: "The deadline must be in the future." }, values };
  }

  if (driveId) {
    const current = await getDrive(driveId);
    // Same message for "not yours" and "missing".
    if (!current || current.companyId !== membership.companyId) return { message: "Drive not found.", values };
    if (current.status !== "DRAFT" && current.status !== "PENDING_APPROVAL") {
      return { message: "This drive is live. Ask the placement cell to change it.", values };
    }
  }

  const id = await saveDrive({
    driveId,
    companyId: membership.companyId,
    input: parsed.data,
    status: submit ? "PENDING_APPROVAL" : "DRAFT",
    actorId: user.id,
    extra: submit ? { rejectionReason: null } : {},
  });
  redirect(`/company/drives/${id}`);
}

export async function uploadCompanyFile(
  kind: "LOGO" | "AUTH_LETTER",
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireRole("RECRUITER");
  const membership = await getRecruiterCompany(user.id);
  if (!membership?.isAdmin) return { message: "Only the company admin can upload files." };
  if (membership.company.status === "SUSPENDED") return { message: "This company is suspended." };

  const result = await storeFile(kind, formData.get("file"));
  if ("error" in result) return { message: result.error };
  const { storageKey, fileName, mimeType, size, publicUrl } = result.file;

  // Replace any previous file of the same kind.
  const previous = await db
    .select()
    .from(documents)
    .where(and(eq(documents.ownerId, user.id), eq(documents.type, kind)));
  await db.batch([
    db.delete(documents).where(and(eq(documents.ownerId, user.id), eq(documents.type, kind))),
    db.insert(documents).values({ ownerId: user.id, type: kind, storageKey, fileName, mimeType, size }),
    ...(kind === "LOGO"
      ? [
          db
            .update(companies)
            .set({ logoUrl: publicUrl, updatedAt: new Date() })
            .where(eq(companies.id, membership.companyId)),
        ]
      : []),
  ]);
  await Promise.all(previous.map((doc) => deleteStoredFile(doc.storageKey, kind)));

  refresh();
  return { message: kind === "LOGO" ? "Logo updated." : "Authorization letter uploaded." };
}
