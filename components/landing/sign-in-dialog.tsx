"use client";

import Link from "next/link";
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
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
    role: "student",
    title: "Student",
    description: "Browse openings, apply and track your applications.",
    icon: GraduationCap,
    iconClass: "bg-[#174A91]/10 text-[#174A91]",
  },
  {
    role: "company",
    title: "Company",
    description: "Post job openings and review student applications.",
    icon: Building2,
    iconClass: "bg-[#F12D32]/10 text-[#F12D32]",
  },
  {
    role: "admin",
    title: "Placement Cell",
    description: "Approve companies and postings, and manage records.",
    icon: ShieldCheck,
    iconClass: "bg-[#082B63]/10 text-[#082B63]",
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
            Sign in as
          </DialogTitle>
          <DialogDescription className="text-[#526987]">
            Choose the account type you want to continue with.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {options.map((option) => (
            <Link
              key={option.role}
              href={`/login?role=${option.role}`}
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
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#174A91] underline-offset-4 hover:underline"
          >
            Register
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
