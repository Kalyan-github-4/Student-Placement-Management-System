import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { getRecruiterCompany } from "@/lib/data/company";
import { getApplicants, getDrive } from "@/lib/data/drives";
import { applicantRows, csvResponse, toCsv } from "@/lib/csv";

// CSV of a drive's applicants for its own company. No phone numbers before shortlisting.
export async function GET(_request: Request, { params }: RouteContext<"/company/drives/[driveId]/applicants">) {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER" || user.status === "SUSPENDED") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const { driveId } = await params;
  const [membership, drive] = await Promise.all([getRecruiterCompany(user.id), getDrive(driveId)]);
  if (!drive || drive.companyId !== membership?.companyId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const rows = applicantRows(await getApplicants(driveId), false);
  return csvResponse(`${drive.title}-applicants.csv`, toCsv(rows));
}
