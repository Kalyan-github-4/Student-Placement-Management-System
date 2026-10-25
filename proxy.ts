import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { portalPaths, type Role } from "@/lib/roles";

const portalRoles = Object.entries(portalPaths) as [Role, string][];

// Optimistic check only; portal pages verify the session again on the server.
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const portal = portalRoles.find(([, path]) => pathname.startsWith(path));
  if (!portal) return;

  const role = req.auth?.user?.role;
  if (!role) {
    return NextResponse.redirect(
      new URL(`/login?role=${portal[0].toLowerCase()}`, req.nextUrl)
    );
  }
  if (role !== portal[0]) {
    return NextResponse.redirect(new URL(portalPaths[role], req.nextUrl));
  }
});

export const config = {
  matcher: ["/student/:path*", "/company/:path*", "/admin/:path*"],
};
