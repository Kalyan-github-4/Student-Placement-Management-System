import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/auth";
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

      {/* Each page, and the skeleton before it, fades in as it mounts. */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-10 sm:py-10 [&>*]:animate-in [&>*]:fade-in [&>*]:slide-in-from-bottom-1 [&>*]:duration-300 motion-reduce:[&>*]:animate-none">
        <Suspense fallback={<p className="text-[#526987]">Loading…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
