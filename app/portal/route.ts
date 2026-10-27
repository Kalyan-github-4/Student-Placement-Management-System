import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { portalPaths } from "@/lib/roles";

// Post-login landing: sends each account to its own portal based on the stored role.
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const path = !user
    ? "/login"
    : user.status === "SUSPENDED"
      ? "/login?error=suspended"
      : portalPaths[user.role];
  return NextResponse.redirect(new URL(path, request.url));
}
