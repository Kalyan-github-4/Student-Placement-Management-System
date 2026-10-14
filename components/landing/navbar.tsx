"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignInButton } from "@/components/landing/sign-in-dialog";

const navLinks = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Features", id: "features" },
  { label: "How it works", id: "how-it-works" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const link of navLinks) {
      const section = document.getElementById(link.id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        solid
          ? "bg-white/95 shadow-[0_1px_0_rgba(8,43,99,0.08),0_8px_24px_-12px_rgba(8,43,99,0.25)] backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-6 sm:px-10">
        <Link href="#home" className="flex items-center gap-3">
          <span
            className={cn(
              "text-base leading-tight font-extrabold tracking-wide uppercase sm:text-lg",
              solid ? "text-[#082B63]" : "text-white"
            )}
          >
            Brainware
            <br />
            University
          </span>
          <span
            className={cn(
              "hidden h-9 w-px sm:block",
              solid ? "bg-[#082B63]/20" : "bg-white/40"
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              "hidden text-xs leading-tight font-medium sm:block",
              solid ? "text-[#526987]" : "text-white/85"
            )}
          >
            Student Placement
            <br />
            Management System
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={`#${link.id}`}
              aria-current={active === link.id ? "true" : undefined}
              className={cn(
                "relative py-1.5 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-[#F12D32] after:transition-transform",
                active === link.id && "after:scale-x-100",
                solid
                  ? active === link.id
                    ? "text-[#082B63]"
                    : "text-[#526987] hover:text-[#082B63]"
                  : active === link.id
                    ? "text-white"
                    : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SignInButton
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2",
              solid
                ? "bg-[#174A91] text-white hover:bg-[#082B63] focus-visible:outline-[#174A91]"
                : "border border-white/70 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus-visible:outline-white"
            )}
          >
            <User className="h-4 w-4" />
            Sign In
          </SignInButton>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border md:hidden",
              solid
                ? "border-[#082B63]/20 text-[#082B63]"
                : "border-white/60 text-white"
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-[#082B63]/10 px-6 py-3 text-sm font-semibold md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setOpen(false)}
              className={cn(
                "py-2.5",
                active === link.id ? "text-[#F12D32]" : "text-[#152C50]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
