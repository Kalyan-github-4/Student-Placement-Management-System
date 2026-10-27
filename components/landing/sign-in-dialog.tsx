"use client";

import Link from "next/link";
import { Building2, ChevronRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const options = [
  {
    href: "/login",
    title: "Sign in",
    description: "Students, recruiters and placement cell staff use the same sign-in.",
    icon: LogIn,
    iconClass: "bg-[#174A91]/10 text-[#174A91]",
  },
  {
    href: "/register/company",
    title: "Register your company",
    description: "Recruiters can sign up; the placement cell reviews each company.",
    icon: Building2,
    iconClass: "bg-[#F12D32]/10 text-[#F12D32]",
  },
];

export function SignInButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger className={cn("cursor-pointer", className)}>
        {children}
      </DialogTrigger>
      <DialogContent className="gap-5 rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#152C50]">
            Welcome
          </DialogTitle>
          <DialogDescription className="text-[#526987]">
            Sign in to your account, or register your company to recruit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {options.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="group flex items-center gap-4 rounded-xl border border-[#D9E4F2] bg-white p-4 transition hover:border-[#174A91] hover:bg-[#F0F6FD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174A91]"
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  option.iconClass
                )}
              >
                <option.icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-base font-semibold text-[#152C50]">
                  {option.title}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-[#526987]">
                  {option.description}
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-[#9FB2CC] transition group-hover:translate-x-0.5 group-hover:text-[#174A91]" />
            </Link>
          ))}
        </div>

        <p className="text-center text-sm text-[#526987]">
          Students are added by the placement cell and receive an activation email.
        </p>
      </DialogContent>
    </Dialog>
  );
}
