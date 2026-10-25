import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { requireRole } from "@/lib/dal";
import { roleLabels, type Role } from "@/lib/roles";
import { PortalNav, type NavItem } from "./portal-nav";

export function PortalShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav?: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-[#F0F6FD]">
      <header className="border-b border-[#D9E4F2] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-10">
          <span className="font-extrabold tracking-wide text-[#082B63] uppercase">{title}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#526987] transition hover:bg-[#F0F6FD] hover:text-[#152C50]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
        {nav && <PortalNav items={nav} />}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-10 sm:py-10">
        <Suspense fallback={<p className="text-[#526987]">Loading…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}

export async function PortalWelcome({ role }: { role: Role }) {
  const user = await requireRole(role);
  return (
    <div className="rounded-2xl border border-[#D9E4F2] bg-white p-6 sm:p-8">
      <p className="text-sm font-medium text-[#174A91]">{roleLabels[role]}</p>
      <h1 className="mt-1 text-2xl font-bold text-[#152C50]">Welcome back</h1>
      <p className="mt-2 text-[#526987]">
        Signed in as <span className="font-medium text-[#152C50]">{user.email}</span>
      </p>
    </div>
  );
}
