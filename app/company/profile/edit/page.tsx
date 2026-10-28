import { and, eq } from "drizzle-orm";
import { Building2, FileText } from "lucide-react";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { requireRole } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
import { CompanyFileUpload } from "./company-files";
import { CompanyProfileForm } from "./company-profile-form";

export default async function EditCompanyPage() {
  const user = await requireRole("RECRUITER");
  const membership = await getRecruiterCompany(user.id);
  if (!membership) {
    return <p className="text-[#526987]">No company is linked to this account.</p>;
  }
  const { company } = membership;

  if (company.status === "SUSPENDED" || !membership.isAdmin) {
    return (
      <p className="rounded-2xl border border-[#D9E4F2] bg-white p-6 text-[#526987]">
        {company.status === "SUSPENDED"
          ? "This company is suspended, so its details can't be edited. Contact the placement cell."
          : "Only your company admin can edit these details."}
      </p>
    );
  }

  const [authLetter] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.ownerId, user.id), eq(documents.type, "AUTH_LETTER")));

  const defaults = Object.fromEntries(
    Object.entries(company).map(([key, value]) => [key, typeof value === "string" ? value : ""])
  );

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Company profile</h1>
        <p className="mt-1 text-[#526987]">
          {company.status === "REJECTED"
            ? "Fix the details below and save to resubmit your company for review."
            : "Keep your company details up to date for the placement cell and students."}
        </p>
      </div>
      <div className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
        <CompanyProfileForm
          defaults={defaults}
          legalLocked={company.status === "APPROVED"}
          resubmit={company.status === "REJECTED"}
        />
      </div>
      <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-8">
        <h2 className="text-lg font-semibold text-[#152C50]">Logo and documents</h2>
        <div className="mt-5 grid gap-8 sm:grid-cols-2">
          <CompanyFileUpload
            kind="LOGO"
            label="Company logo"
            hint="PNG or JPG, up to 1 MB. Shown to students on your drives."
            accept="image/png,image/jpeg"
            current={
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#D9E4F2] bg-[#F0F6FD] text-[#082B63]">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={`${company.name} logo`} className="h-full w-full object-contain" />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </span>
            }
          />
          <CompanyFileUpload
            kind="AUTH_LETTER"
            label="Authorization letter"
            hint="Optional PDF, up to 2 MB, authorizing you to recruit for the company."
            accept="application/pdf"
            current={
              authLetter ? (
                <a
                  href={`/files/${authLetter.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-2 text-sm font-medium text-[#174A91] hover:underline"
                >
                  <FileText className="h-4 w-4" /> {authLetter.fileName}
                </a>
              ) : (
                <p className="text-sm text-[#526987]">Not uploaded.</p>
              )
            }
          />
        </div>
      </section>
    </div>
  );
}
