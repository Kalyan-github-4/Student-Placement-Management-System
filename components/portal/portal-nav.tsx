"use client";

import { Suspense, useLayoutEffect, useRef, useState } from "react";
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

// The first item is the portal root, which should only match exactly; otherwise the
// longest matching prefix wins.
function activeFor(items: NavItem[], pathname: string | null) {
  if (pathname === null) return null;
  return (
    items
      .filter((item, index) => (index === 0 ? pathname === item.href : pathname.startsWith(item.href)))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null
  );
}

function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string | null }) {
  // The tab just tapped is highlighted straight away, until the URL catches up with it.
  const [tapped, setTapped] = useState<{ href: string; from: string | null } | null>(null);
  const activeHref = tapped && tapped.from === pathname ? tapped.href : activeFor(items, pathname);

  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  // Slides the underline under the active tab. Positioned through the DOM rather than
  // state so it follows resizes without re-rendering.
  useLayoutEffect(() => {
    const list = listRef.current;
    const bar = barRef.current;
    if (!list || !bar) return;

    const place = () => {
      const link = list.querySelector<HTMLElement>('[aria-current="page"]');
      bar.style.opacity = link ? "1" : "0";
      if (!link) return;
      bar.style.width = `${link.offsetWidth}px`;
      bar.style.transform = `translateX(${link.offsetLeft}px)`;
    };
    place();
    // Only animate moves after the first placement, so it doesn't slide in on page load.
    const frame = requestAnimationFrame(() => (bar.dataset.ready = "true"));
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activeHref]);

  return (
    <nav className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-10">
      <ul ref={listRef} className="relative flex gap-1">
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                  setTapped({ href: item.href, from: pathname });
                }}
                className={cn(
                  "block px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200",
                  active ? "text-[#174A91]" : "text-[#526987] hover:text-[#152C50]"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <span
          ref={barRef}
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-[#174A91] opacity-0 data-[ready=true]:transition-[transform,width] data-[ready=true]:duration-300 data-[ready=true]:ease-out motion-reduce:transition-none!"
        />
      </ul>
    </nav>
  );
}
