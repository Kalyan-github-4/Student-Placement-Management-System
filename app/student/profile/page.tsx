import Link from "next/link";
import { ExternalLink, Lock, Pencil } from "lucide-react";
import { formatDateTime } from "@/components/portal/status-pill";
import { requireRole } from "@/lib/dal";
import { getCorrections, getResumes, getStudent } from "@/lib/data/student";
import {
  academicFields,
  formatAcademicValue,
  missingProfileItems,
  profileCompleteness,
  type AcademicField,
} from "@/lib/student";
import { cn } from "@/lib/utils";
import { VerificationBanner } from "../verification-banner";
import { CorrectionForm, ResumeRow, ResumeUpload } from "./profile-actions";

const correctionTones = {
  PENDING: "text-amber-700",
  APPROVED: "text-emerald-700",
  REJECTED: "text-[#C81E23]",
};

export default async function ProfilePage() {
  const user = await requireRole("STUDENT");
  const student = await getStudent(user.id);
  if (!student) return <p className="text-[#526987]">Student record not found.</p>;
  const [resumes, corrections] = await Promise.all([getResumes(user.id), getCorrections(student.id)]);

  const locked = student.verificationStatus === "VERIFIED";
  const missing = missingProfileItems(student, resumes.length > 0);
  const links = [
    { label: "GitHub", href: student.githubUrl },
    { label: "LinkedIn", href: student.linkedinUrl },
    { label: "Portfolio", href: student.portfolioUrl },
  ].filter((link) => link.href);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#152C50]">{student.name}</h1>
          <p className="mt-1 text-[#526987]">{user.email}</p>
        </div>
        <Link
          href="/student/profile/edit"
          className="flex items-center gap-2 rounded-lg border border-[#D9E4F2] bg-white px-4 py-2 text-sm font-semibold text-[#174A91] transition hover:border-[#174A91] hover:bg-[#F0F6FD]"
        >
          <Pencil className="h-4 w-4" /> Edit profile
        </Link>
      </div>

      <VerificationBanner
        student={student}
        missing={missing}
        completeness={profileCompleteness(student, resumes.length > 0)}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#152C50]">
            Academic details {locked && <Lock className="h-4 w-4 text-[#526987]" />}
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-4">
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
          <h2 className="text-lg font-semibold text-[#152C50]">Personal details</h2>
          <dl className="mt-4 grid gap-4">
            <div>
              <dt className="text-sm text-[#526987]">Mobile number</dt>
              <dd className="mt-0.5 font-medium text-[#152C50]">{student.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-[#526987]">Skills</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {student.skills.length === 0 ? (
                  <span className="font-medium text-[#152C50]">—</span>
                ) : (
                  student.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#F0F6FD] px-2.5 py-0.5 text-sm font-medium text-[#174A91]"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[#526987]">Links</dt>
              <dd className="mt-0.5 flex flex-wrap gap-4">
                {links.length === 0 ? (
                  <span className="font-medium text-[#152C50]">—</span>
                ) : (
                  links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[#174A91] hover:underline"
                    >
                      {link.label} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[#152C50]">Resumes</h2>
        <p className="mt-1 text-sm text-[#526987]">
          Up to 5 resumes. You choose which one to send with each application; the default is
          preselected.
        </p>
        {resumes.length > 0 && (
          <ul className="mt-3 divide-y divide-[#D9E4F2]">
            {resumes.map((resume) => (
              <ResumeRow
                key={resume.id}
                id={resume.id}
                fileName={resume.fileName}
                size={resume.size}
                isDefault={resume.isDefault}
              />
            ))}
          </ul>
        )}
        {resumes.length < 5 && (
          <div className="mt-4">
            <ResumeUpload />
          </div>
        )}
      </section>

      {locked && (
        <section className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[#152C50]">Request a correction</h2>
          <p className="mt-1 mb-4 text-sm text-[#526987]">
            Your academic details are locked after verification. If one is wrong, ask the placement
            cell to change it.
          </p>
          <CorrectionForm
            fields={Object.entries(academicFields).map(([value, label]) => ({ value, label }))}
          />
          {corrections.length > 0 && (
            <ul className="mt-6 divide-y divide-[#D9E4F2] border-t border-[#D9E4F2]">
              {corrections.map((request) => (
                <li key={request.id} className="grid gap-1 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-[#152C50]">
                      {academicFields[request.field as AcademicField]}:{" "}
                      {formatAcademicValue(request.field as AcademicField, request.currentValue)} →{" "}
                      {formatAcademicValue(request.field as AcademicField, request.requestedValue)}
                    </p>
                    <span className={cn("font-semibold capitalize", correctionTones[request.status])}>
                      {request.status.toLowerCase()}
                    </span>
                  </div>
                  {request.reviewNote && (
                    <p className="text-[#526987]">Placement cell: {request.reviewNote}</p>
                  )}
                  <p className="text-xs text-[#526987]">Sent {formatDateTime(request.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
