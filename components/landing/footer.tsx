import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignInButton } from "@/components/landing/sign-in-dialog";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
];

export function Footer() {
  return (
    <footer className="bg-[#082B63] text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/15 py-16 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-3 max-w-xl text-base text-white/80">
              Sign in as a student, a company or a placement cell member to
              open your portal.
            </p>
          </div>
          <SignInButton className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-full bg-[#F12D32] px-7 text-base font-semibold text-white shadow-lg shadow-black/25 transition hover:bg-[#d4262b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Sign In
            <ArrowRight className="h-5 w-5" />
          </SignInButton>
        </div>

        <div className="flex flex-col gap-6 py-8 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>
            <span className="font-bold tracking-wide text-white uppercase">
              Brainware University
            </span>{" "}
            &middot; Student Placement Management System
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
