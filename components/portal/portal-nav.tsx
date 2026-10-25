"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

// usePathname() is runtime data on dynamic routes, so the active state streams in
// behind Suspense while the tabs themselves stay in the static shell.
export function PortalNav({ items }: { items: NavItem[] }) {
  return (
    <Suspense fallback={<NavLinks items={items} pathname={null} />}>
      <ActiveNavLinks items={items} />
    </Suspense>
  );
}

function ActiveNavLinks({ items }: { items: NavItem[] }) {
  return <NavLinks items={items} pathname={usePathname()} />;
}

function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string | null }) {
  // The first item is the portal root, which should only match exactly.
  const isActive = (href: string, index: number) =>
    pathname !== null && (index === 0 ? pathname === href : pathname.startsWith(href));

  return (
    <nav className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-10">
      <ul className="flex gap-1">
        {items.map((item, index) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "block border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition",
                isActive(item.href, index)
                  ? "border-[#174A91] text-[#174A91]"
                  : "border-transparent text-[#526987] hover:text-[#152C50]"
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
