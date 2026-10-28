import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canOpenPortal, portalPaths, type Role } from "@/lib/roles";

const portalRoles = Object.entries(portalPaths) as [Role, string][];

// Optimistic check only; portal pages verify the session again on the server.
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const portal = portalRoles.find(([, path]) => pathname.startsWith(path));
  if (!portal) return;

  const role = req.auth?.user?.role;
  // Sessions issued before a role was renamed carry a role with no portal.
  if (!role || !(role in portalPaths)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (!canOpenPortal(role as Role, portal[0])) {
    return NextResponse.redirect(new URL(portalPaths[role], req.nextUrl));
  }
});

export const config = {
  matcher: ["/student/:path*", "/company/:path*", "/tpo/:path*", "/admin/:path*"],
};
