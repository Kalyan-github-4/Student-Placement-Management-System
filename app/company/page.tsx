import Link from "next/link";
import { Ban, CheckCircle2, Clock, ExternalLink, XCircle } from "lucide-react";
import { StatusPill } from "@/components/portal/status-pill";
import { requireRole } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
import { cn } from "@/lib/utils";

const banners = {
  PENDING: {
    icon: Clock,
    tone: "border-amber-300 bg-amber-50 text-amber-900",
    title: "Waiting for placement cell approval",
    body: "The Training & Placement Office is reviewing your company. Approval usually takes under 48 hours. Make sure your GSTIN or CIN is filled in, since it's required before approval.",
  },
  APPROVED: {
    icon: CheckCircle2,
    tone: "border-emerald-300 bg-emerald-50 text-emerald-900",
    title: "Your company is approved",
    body: "You can post drives. The placement cell approves each drive before eligible students see it.",
  },
  REJECTED: {
    icon: XCircle,
    tone: "border-[#F12D32]/40 bg-[#F12D32]/5 text-[#8E1418]",
    title: "Registration not approved",
    body: "Update your company details and save them to resubmit for review.",
  },
  SUSPENDED: {
    icon: Ban,
    tone: "border-slate-300 bg-slate-100 text-slate-800",
    title: "Your company is suspended",
    body: "Your openings are hidden from students. Contact the placement cell for details.",
  },
};

export default async function CompanyOverview() {
  const user = await requireRole("RECRUITER");
  const membership = await getRecruiterCompany(user.id);
  if (!membership) {
    return <p className="text-[#526987]">No company is linked to this account. Contact the placement cell.</p>;
  }
  const { company } = membership;
  const banner = banners[company.status];

  const details = [
    { label: "Website", value: company.website, href: company.website },
    { label: "Industry", value: company.industry },
    { label: "Size", value: `${company.size} employees` },
    { label: "LinkedIn", value: "Company page", href: company.linkedinUrl },
    { label: "GSTIN / CIN", value: company.gstinOrCin ?? "Not provided" },
    { label: "Registered address", value: company.address },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Welcome, {membership.name.split(" ")[0]}</h1>
        <p className="mt-1 text-[#526987]">
          {membership.designation} at {company.name} · {user.email}
        </p>
      </div>

      <div className={cn("flex gap-4 rounded-2xl border p-5", banner.tone)}>
        <banner.icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{banner.title}</p>
          <p className="mt-1 text-sm">{banner.body}</p>
          {company.rejectionReason && company.status !== "APPROVED" && (
            <p className="mt-2 text-sm">
              <span className="font-semibold">Reason:</span> {company.rejectionReason}
            </p>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#152C50]">{company.name}</h2>
            <StatusPill status={company.status} />
          </div>
          {company.status !== "SUSPENDED" && membership.isAdmin && (
            <Link
              href="/company/profile/edit"
              className="rounded-lg border border-[#D9E4F2] px-4 py-2 text-sm font-semibold text-[#174A91] transition hover:border-[#174A91] hover:bg-[#F0F6FD]"
            >
              Edit details
            </Link>
          )}
        </div>
        {company.description && <p className="mt-3 text-sm text-[#526987]">{company.description}</p>}
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-sm text-[#526987]">{detail.label}</dt>
              <dd className="mt-0.5 font-medium break-words text-[#152C50]">
                {detail.href ? (
                  <a
                    href={detail.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#174A91] hover:underline"
                  >
                    {detail.value} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  detail.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
