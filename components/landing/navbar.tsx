"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#", active: true },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Login", href: "/login" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-6 sm:px-10 lg:px-[5%]">
        <Link href="#" className="flex items-center gap-4">
          <span className="text-lg leading-tight font-extrabold tracking-wide text-white uppercase [text-shadow:0_1px_4px_rgba(0,0,0,0.35)] sm:text-xl">
            Brainware
            <br />
            University
          </span>
          <span className="hidden h-10 w-px bg-white/40 sm:block" aria-hidden="true" />
          <span className="hidden text-sm leading-tight font-medium text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)] sm:block">
            Student Placement
            <br />
            Management System
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-white md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? "relative pb-1.5 text-white after:absolute after:inset-x-0 after:-bottom-0 after:h-0.5 after:rounded-full after:bg-[#F12D32]"
                  : "pb-1.5 text-white/90 transition hover:text-white"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:inline-flex"
        >
          <User className="h-4 w-4" />
          Sign In
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-white md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-6 rounded-2xl border border-white/15 bg-[#082B63]/95 p-4 backdrop-blur-sm md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-white">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className={link.active ? "text-[#F12D32]" : "text-white/90"}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
            >
              <User className="h-4 w-4" />
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
