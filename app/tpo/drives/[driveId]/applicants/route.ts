import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { getApplicants, getDrive } from "@/lib/data/drives";
import { applicantRows, csvResponse, toCsv } from "@/lib/csv";
import { placementRoles } from "@/lib/roles";

// CSV of a drive's applicants for the TPO (includes phone numbers).
export async function GET(_request: Request, { params }: RouteContext<"/tpo/drives/[driveId]/applicants">) {
  const user = await getCurrentUser();
  if (!user || !placementRoles.includes(user.role) || user.status === "SUSPENDED") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const { driveId } = await params;
  const drive = await getDrive(driveId);
  if (!drive) return new NextResponse("Not found", { status: 404 });

  const rows = applicantRows(await getApplicants(driveId), true);
  return csvResponse(`${drive.company.name}-${drive.title}-applicants.csv`, toCsv(rows));
}
