import { Download, FileText } from "lucide-react";
import { StatusBadge, formatDate } from "@/app/student/status-badge";
import type { getApplicants } from "@/lib/data/drives";

type Applicant = Awaited<ReturnType<typeof getApplicants>>[number];

// Applicant list for a drive. Recruiters don't see phone numbers before shortlisting.
export function ApplicantsTable({
  applicants,
  csvHref,
  showPhone,
}: {
  applicants: Applicant[];
  csvHref: string;
  showPhone: boolean;
}) {
  const active = applicants.filter((a) => a.status !== "WITHDRAWN");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D9E4F2] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D9E4F2] p-5 sm:px-6">
        <h2 className="text-lg font-semibold text-[#152C50]">
          Applicants <span className="text-[#526987]">({active.length})</span>
        </h2>
        {applicants.length > 0 && (
          <a
            href={csvHref}
            className="flex items-center gap-1.5 rounded-lg border border-[#D9E4F2] px-3 py-1.5 text-sm font-semibold text-[#174A91] transition hover:border-[#174A91] hover:bg-[#F0F6FD]"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        )}
      </div>
      {applicants.length === 0 ? (
        <p className="p-5 text-sm text-[#526987] sm:px-6">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#F0F6FD] text-[#526987]">
              <tr>
                <th className="px-5 py-2.5 font-medium sm:pl-6">Student</th>
                <th className="px-3 py-2.5 font-medium">Branch / batch</th>
                <th className="px-3 py-2.5 font-medium">CGPA</th>
                <th className="px-3 py-2.5 font-medium">Backlogs</th>
                <th className="px-3 py-2.5 font-medium">10th / 12th</th>
                <th className="px-3 py-2.5 font-medium">Resume</th>
                <th className="px-3 py-2.5 font-medium sm:pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4F2]">
              {applicants.map((a) => (
                <tr key={a.id} className={a.status === "WITHDRAWN" ? "opacity-60" : undefined}>
                  <td className="px-5 py-3 sm:pl-6">
                    <p className="font-medium text-[#152C50]">{a.name}</p>
                    <p className="text-xs text-[#526987]">
                      {a.rollNumber} · {a.email}
                      {showPhone && a.phone && ` · ${a.phone}`}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-[#152C50]">
                    {a.branch} · {a.batch}
                  </td>
                  <td className="px-3 py-3 text-[#152C50]">{a.cgpa}</td>
                  <td className="px-3 py-3 text-[#152C50]">{a.activeBacklogs}</td>
                  <td className="px-3 py-3 text-[#152C50]">
                    {a.marks10}% / {a.marks12}%
                  </td>
                  <td className="px-3 py-3">
                    {a.resumeId ? (
                      <a
                        href={`/files/${a.resumeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-[#174A91] hover:underline"
                      >
                        <FileText className="h-4 w-4" /> View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 sm:pr-6">
                    <StatusBadge status={a.status} />
                    <p className="mt-1 text-xs text-[#526987]">{formatDate(a.appliedAt)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
