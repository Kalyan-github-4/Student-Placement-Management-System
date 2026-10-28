import Link from "next/link";
import type { listDrives } from "@/lib/data/drives";
import { driveTypeLabels, formatDeadline, formatPay } from "@/lib/drives";
import { DriveStatusPill } from "./drive-status";

// Drive rows for the TPO and company lists.
export function DriveList({
  drives,
  hrefBase,
  showCompany,
}: {
  drives: Awaited<ReturnType<typeof listDrives>>;
  hrefBase: string;
  showCompany: boolean;
}) {
  if (drives.length === 0) {
    return <p className="p-5 text-sm text-[#526987] sm:p-6">No drives here.</p>;
  }
  return (
    <ul className="divide-y divide-[#D9E4F2]">
      {drives.map((drive) => (
        <li key={drive.id}>
          <Link
            href={`${hrefBase}/${drive.id}`}
            className="flex flex-col gap-2 p-5 transition hover:bg-[#F0F6FD] sm:flex-row sm:items-center sm:gap-4 sm:px-6"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#152C50]">{drive.title}</p>
              <p className="truncate text-sm text-[#526987]">
                {showCompany && `${drive.company.name} · `}
                {driveTypeLabels[drive.type]} · {formatPay(drive)} · {drive.location}
              </p>
              <p className="text-xs text-[#526987]">Deadline {formatDeadline(drive.deadline)}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#526987]">
              <span>
                {drive.applicantCount} applicant{drive.applicantCount === 1 ? "" : "s"}
              </span>
              <DriveStatusPill status={drive.status} deadlinePassed={drive.deadlinePassed} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
