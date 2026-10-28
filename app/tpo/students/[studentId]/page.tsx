import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Star } from "lucide-react";
import { ActionButton, ReasonDialogButton } from "@/components/portal/action-buttons";
import { formatDateTime } from "@/components/portal/status-pill";
import { requireRole } from "@/lib/dal";
import { getEntityHistory, getStudentForReview } from "@/lib/data/tpo";
import { academicFields, formatAcademicValue, missingProfileItems, type AcademicField } from "@/lib/student";
import { rejectStudent, verifyStudent } from "../../student-actions";
import { VerificationPill } from "../verification-pill";

const actionLabels: Record<string, string> = {
  "student.verified": "Verified",
  "student.rejected": "Sent back",
  "student.academic_corrected": "Academic detail corrected",
  "student.correction_declined": "Correction declined",
};

export default async function StudentReviewPage({ params }: PageProps<"/tpo/students/[studentId]">) {
  await requireRole("TPO");
  const { studentId } = await params;
  const [review, history] = await Promise.all([
    getStudentForReview(studentId),
    getEntityHistory("student", studentId),
  ]);
  if (!review) notFound();
  const { student, email, resumes } = review;
  const missing = missingProfileItems(student, resumes.length > 0);

  const links = [
    { label: "GitHub", href: student.githubUrl },
    { label: "LinkedIn", href: student.linkedinUrl },
    { label: "Portfolio", href: student.portfolioUrl },
  ].filter((l) => l.href);

  return (
    <div className="grid gap-6">
      <Link
        href="/tpo/students"
        className="flex w-fit items-center gap-1 text-sm font-semibold text-[#174A91] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> All students
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-[#152C50]">{student.name}</h1>
        <VerificationPill status={student.verificationStatus} />
      </div>
      <p className="-mt-4 text-[#526987]">
        {email} · {student.phone ?? "No phone"}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid min-w-0 content-start gap-6">
          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#152C50]">Academic details</h2>
            <p className="mt-1 text-sm text-[#526987]">Check these against college records before verifying.</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Object.entries(academicFields).map(([field, label]) => (
                <div key={field}>
                  <dt className="text-sm text-[#526987]">{label}</dt>
                  <dd className="mt-0.5 font-medium text-[#152C50]">
                    {formatAcademicValue(field as AcademicField, student[field as AcademicField])}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#152C50]">Resumes and links</h2>
            {resumes.length === 0 ? (
              <p className="mt-2 text-sm text-[#526987]">No resume uploaded.</p>
            ) : (
              <ul className="mt-3 grid gap-2">
                {resumes.map((resume) => (
                  <li key={resume.id} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-[#174A91]" />
                    <a
                      href={`/files/${resume.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium text-[#174A91] hover:underline"
                    >
                      {resume.fileName}
                    </a>
                    {resume.isDefault && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                  </li>
                ))}
              </ul>
            )}
            {student.skills.length > 0 && (
              <p className="mt-4 text-sm text-[#526987]">
                <span className="font-medium text-[#152C50]">Skills:</span> {student.skills.join(", ")}
              </p>
            )}
            {links.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-4 text-sm">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[#174A91] hover:underline"
                  >
                    {link.label} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </p>
            )}
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-[#152C50]">Verification</h2>
            {student.verificationStatus === "SUBMITTED" ? (
              <div className="grid gap-3">
                {missing.length > 0 && (
                  <p className="text-sm text-[#C81E23]">Incomplete: {missing.join(", ")}.</p>
                )}
                <ActionButton action={verifyStudent.bind(null, student.id)} label="Verify profile" />
                <ReasonDialogButton
                  action={rejectStudent.bind(null, student.id)}
                  label="Send back"
                  title="Send this profile back?"
                  description="The student is emailed your reason, fixes their details and submits again."
                />
              </div>
            ) : (
              <p className="text-sm text-[#526987]">
                {student.verificationStatus === "VERIFIED"
                  ? `Verified ${student.verifiedAt ? formatDateTime(student.verifiedAt) : ""}. Academic changes now go through correction requests.`
                  : student.verificationStatus === "REJECTED"
                    ? `Sent back: ${student.verificationNote}`
                    : "The student hasn't submitted their profile yet."}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#152C50]">History</h2>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-[#526987]">No decisions yet.</p>
            ) : (
              <ol className="mt-3 grid gap-3">
                {history.map((entry) => (
                  <li key={entry.id} className="border-l-2 border-[#D9E4F2] pl-3 text-sm">
                    <p className="font-medium text-[#152C50]">{actionLabels[entry.action] ?? entry.action}</p>
                    <p className="text-xs text-[#526987]">
                      {entry.actorEmail ?? "System"} · {formatDateTime(entry.at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
