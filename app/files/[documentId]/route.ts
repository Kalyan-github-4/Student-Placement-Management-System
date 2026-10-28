import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, companyUsers, documents, drives } from "@/db/schema";
import { getCurrentUser } from "@/lib/dal";
import { isStorageConfigured, signedFileUrl } from "@/lib/storage";

// Who may open a document:
// - its owner, and TPO / Super Admin staff;
// - a recruiter, for resumes sent with an application to their company's drives,
//   and for documents uploaded by colleagues at the same company.
async function canView(user: { id: string; role: string }, doc: typeof documents.$inferSelect) {
  if (doc.ownerId === user.id || user.role === "TPO" || user.role === "SUPER_ADMIN") return true;
  if (user.role !== "RECRUITER") return false;

  const [member] = await db.select().from(companyUsers).where(eq(companyUsers.userId, user.id));
  if (!member) return false;

  if (doc.type === "RESUME") {
    const [sent] = await db
      .select({ id: applications.id })
      .from(applications)
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .where(and(eq(applications.resumeId, doc.id), eq(drives.companyId, member.companyId)));
    return !!sent;
  }
  const [colleague] = await db
    .select({ id: companyUsers.userId })
    .from(companyUsers)
    .where(and(eq(companyUsers.userId, doc.ownerId), eq(companyUsers.companyId, member.companyId)));
  return !!colleague;
}

export async function GET(request: NextRequest, { params }: RouteContext<"/files/[documentId]">) {
  const user = await getCurrentUser();
  if (!user || user.status === "SUSPENDED") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { documentId } = await params;
  const [doc] = await db.select().from(documents).where(eq(documents.id, documentId));
  // Same answer for "missing" and "not yours", so ids can't be probed.
  if (!doc || !(await canView(user, doc))) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!isStorageConfigured()) {
    return new NextResponse("File storage is not configured.", { status: 503 });
  }

  const response = NextResponse.redirect(signedFileUrl(doc.storageKey));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
