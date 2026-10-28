import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/dal";
import { getApplication, getApplyableDrive, getResumes, getStudent } from "@/lib/data/student";
import { criteriaSummary } from "@/lib/eligibility";
import { driveTypeLabels, formatDeadline, formatPay } from "@/lib/drives";
import { StatusBadge, formatDate } from "../../status-badge";
import { ApplyForm, WithdrawButton } from "./apply-form";

export default async function DrivePage({ params }: PageProps<"/student/drives/[driveId]">) {
  const user = await requireRole("STUDENT");
  const { driveId } = await params;
  const student = await getStudent(user.id);
  if (!student) return <p className="text-[#526987]">Student record not found.</p>;

  const verified = student.verificationStatus === "VERIFIED";
  const [drive, application, resumes] = await Promise.all([
    verified ? getApplyableDrive(student, driveId) : null,
    getApplication(student.id, driveId),
    getResumes(user.id),
  ]);

  const back = (
    <Link
      href="/student/drives"
      className="flex w-fit items-center gap-1 text-sm font-semibold text-[#174A91] hover:underline"
    >
      <ArrowLeft className="h-4 w-4" /> All drives
    </Link>
  );

  if (!drive) {
    return (
      <div className="grid gap-6">
        {back}
        <p className="rounded-2xl border border-[#D9E4F2] bg-white p-5 text-[#526987]">
          This drive isn&apos;t available to you. It may have closed, or your profile doesn&apos;t
          meet its criteria.
          {application && " You can still track your application on the My Applications page."}
        </p>
      </div>
    );
  }

  const facts = [
    { label: "Role type", value: driveTypeLabels[drive.type] },
    { label: "Pay", value: formatPay(drive) },
    { label: "Location", value: drive.location },
    { label: "Apply by", value: formatDeadline(drive.deadline) },
    { label: "Bond", value: drive.bondDetails ?? "None" },
  ];

  return (
    <div className="grid gap-6">
      {back}
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">{drive.title}</h1>
        <p className="mt-1 text-[#526987]">
          {drive.company.name} ·{" "}
          <a
            href={drive.company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#174A91] hover:underline"
          >
            Website <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid content-start gap-6">
          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-sm text-[#526987]">{fact.label}</dt>
                  <dd className="mt-0.5 font-medium text-[#152C50]">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#152C50]">Job description</h2>
            <p className="mt-2 text-sm whitespace-pre-line text-[#526987]">{drive.description}</p>
          </section>
          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#152C50]">Eligibility</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {criteriaSummary(drive.criteria).map((line) => (
                <li key={line} className="rounded-full bg-[#F0F6FD] px-3 py-1 text-sm text-[#174A91]">
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-emerald-700">You meet all the criteria.</p>
          </section>
        </div>

        <section className="h-fit rounded-2xl border border-[#D9E4F2] bg-white p-5">
          {application ? (
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold text-[#152C50]">Your application</h2>
              <div className="flex items-center gap-2">
                <StatusBadge status={application.status} />
                <span className="text-sm text-[#526987]">since {formatDate(application.appliedAt)}</span>
              </div>
              {application.status === "APPLIED" && <WithdrawButton applicationId={application.id} />}
            </div>
          ) : (
            <div className="grid gap-3">
              <h2 className="text-lg font-semibold text-[#152C50]">Apply</h2>
              {resumes.length === 0 ? (
                <p className="text-sm text-[#526987]">
                  Upload a resume on your{" "}
                  <Link href="/student/profile" className="font-semibold text-[#174A91] hover:underline">
                    profile
                  </Link>{" "}
                  first.
                </p>
              ) : (
                <ApplyForm
                  driveId={drive.id}
                  resumes={resumes.map((r) => ({ id: r.id, fileName: r.fileName, isDefault: r.isDefault }))}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
