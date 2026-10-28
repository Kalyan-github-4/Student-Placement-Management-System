import Link from "next/link";
import { ReasonDialogButton } from "@/components/portal/action-buttons";
import { formatDateTime } from "@/components/portal/status-pill";
import { requireRole } from "@/lib/dal";
import { listPendingCorrections } from "@/lib/data/tpo";
import { academicFields, formatAcademicValue, type AcademicField } from "@/lib/student";
import { decideCorrection } from "../student-actions";

export default async function CorrectionsPage() {
  await requireRole("TPO", "SUPER_ADMIN");
  const requests = await listPendingCorrections();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#152C50]">Correction requests</h1>
        <p className="mt-1 text-[#526987]">
          Verified students can&apos;t edit academic details. They ask here; approving updates the
          profile and is recorded in the audit log.
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-[#D9E4F2] bg-white p-5 text-[#526987]">
          No pending requests.
        </p>
      ) : (
        <ul className="grid gap-4">
          {requests.map(({ request, studentName, rollNumber }) => {
            const field = request.field as AcademicField;
            return (
              <li key={request.id} className="rounded-2xl border border-[#D9E4F2] bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/tpo/students/${request.studentId}`}
                      className="font-semibold text-[#152C50] hover:text-[#174A91]"
                    >
                      {studentName}
                    </Link>
                    <span className="text-sm text-[#526987]"> · {rollNumber}</span>
                    <p className="mt-1 text-[#152C50]">
                      <span className="font-medium">{academicFields[field]}:</span>{" "}
                      {formatAcademicValue(field, request.currentValue)} →{" "}
                      <span className="font-semibold">{formatAcademicValue(field, request.requestedValue)}</span>
                    </p>
                    <p className="mt-1 text-sm text-[#526987]">&ldquo;{request.reason}&rdquo;</p>
                    <p className="mt-1 text-xs text-[#526987]">{formatDateTime(request.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ReasonDialogButton
                      action={decideCorrection.bind(null, request.id, true)}
                      label="Approve"
                      title="Approve this correction?"
                      description="The student's profile is updated with the new value."
                      fieldName="note"
                      fieldLabel="Note to the student"
                      required={false}
                      variant="primary"
                    />
                    <ReasonDialogButton
                      action={decideCorrection.bind(null, request.id, false)}
                      label="Decline"
                      title="Decline this correction?"
                      description="The student is emailed your note."
                      fieldName="note"
                      fieldLabel="Why it's declined"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
