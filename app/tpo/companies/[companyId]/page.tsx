import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { formatDateTime, StatusPill } from "@/components/portal/status-pill";
import { requireRole } from "@/lib/dal";
import { getCompanyForReview, getEntityHistory } from "@/lib/data/tpo";
import { ReviewActions } from "./review-actions";

const actionLabels: Record<string, string> = {
  "company.approved": "Approved",
  "company.approved_via_invite": "Registered through invitation (approved)",
  "company.rejected": "Rejected",
  "company.suspended": "Suspended",
  "company.reinstated": "Reinstated",
  "company.resubmitted": "Resubmitted by recruiter",
};

export default async function CompanyReviewPage({
  params,
}: PageProps<"/tpo/companies/[companyId]">) {
  await requireRole("TPO");
  const { companyId } = await params;
  const [company, history] = await Promise.all([
    getCompanyForReview(companyId),
    getEntityHistory("company", companyId),
  ]);
  if (!company) notFound();

  const details = [
    { label: "Website", value: company.website, href: company.website },
    { label: "Domain", value: company.domain },
    { label: "Industry", value: company.industry },
    { label: "Size", value: `${company.size} employees` },
    { label: "LinkedIn", value: company.linkedinUrl, href: company.linkedinUrl },
    { label: "GSTIN / CIN", value: company.gstinOrCin ?? "Not provided" },
    { label: "PAN", value: company.pan ?? "Not provided" },
    { label: "Registered address", value: company.address },
    { label: "Hiring roles", value: company.hiringRoles ?? "—" },
    { label: "CTC range", value: company.hiringCtc ?? "—" },
    { label: "Batch", value: company.hiringBatch ?? "—" },
    { label: "Registered on", value: formatDateTime(company.createdAt) },
  ];

  return (
    <div className="grid gap-6">
      <Link
        href="/tpo/companies"
        className="flex w-fit items-center gap-1 text-sm font-semibold text-[#174A91] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> All companies
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-[#152C50]">{company.name}</h1>
        <StatusPill status={company.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid min-w-0 content-start gap-6">
          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#152C50]">Company details</h2>
            {company.description && (
              <p className="mt-2 text-sm text-[#526987]">{company.description}</p>
            )}
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label} className="min-w-0">
                  <dt className="text-sm text-[#526987]">{detail.label}</dt>
                  <dd className="mt-0.5 font-medium break-words text-[#152C50]">
                    {detail.href ? (
                      <a
                        href={detail.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 break-all text-[#174A91] hover:underline"
                      >
                        {detail.value} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    ) : (
                      detail.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#152C50]">Recruiters</h2>
            <ul className="mt-3 divide-y divide-[#D9E4F2]">
              {company.members.map((member) => (
                <li key={member.userId} className="grid gap-1 py-3 sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-[#152C50]">
                      {member.name}
                      {member.isAdmin && (
                        <span className="ml-2 text-xs font-semibold text-[#174A91]">
                          Company admin
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-[#526987]">{member.designation}</p>
                  </div>
                  <div className="text-sm break-all text-[#526987] sm:text-right">
                    <p>{member.user.email}</p>
                    <p>{member.phone}</p>
                    <p
                      className={member.user.emailVerified ? "text-emerald-700" : "text-amber-700"}
                    >
                      {member.user.emailVerified ? "Email verified" : "Email not verified"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-[#152C50]">Decision</h2>
            {company.rejectionReason && company.status !== "APPROVED" && (
              <p className="mb-4 rounded-lg bg-[#F0F6FD] p-3 text-sm text-[#526987]">
                <span className="font-semibold text-[#152C50]">
                  {company.status === "SUSPENDED" ? "Suspension" : "Rejection"} reason:
                </span>{" "}
                {company.rejectionReason}
              </p>
            )}
            <ReviewActions companyId={company.id} status={company.status} />
          </section>

          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#152C50]">History</h2>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-[#526987]">No decisions yet.</p>
            ) : (
              <ol className="mt-3 grid gap-3">
                {history.map((entry) => {
                  const reason = (entry.after as { rejectionReason?: string } | null)
                    ?.rejectionReason;
                  return (
                    <li key={entry.id} className="border-l-2 border-[#D9E4F2] pl-3 text-sm">
                      <p className="font-medium text-[#152C50]">
                        {actionLabels[entry.action] ?? entry.action}
                      </p>
                      {reason && <p className="text-[#526987]">&ldquo;{reason}&rdquo;</p>}
                      <p className="text-xs text-[#526987]">
                        {entry.actorEmail ?? "System"} · {formatDateTime(entry.at)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
