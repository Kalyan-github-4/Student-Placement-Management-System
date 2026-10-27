import { requireRole } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
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
    </div>
  );
}
