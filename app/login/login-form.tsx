"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

const roles = [
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "company", label: "Company", icon: Building2 },
  { value: "admin", label: "TPO", icon: ShieldCheck },
];

export function LoginForm() {
  const searchParams = useSearchParams();
  const initialRole = roles.some((r) => r.value === searchParams.get("role"))
    ? searchParams.get("role")!
    : "student";
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="grid gap-5">
      <fieldset className="grid grid-cols-3 gap-2">
        <legend className="sr-only">Account type</legend>
        {roles.map((role) => (
          <label
            key={role.value}
            className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-[#D9E4F2] p-3 text-sm font-medium text-[#526987] transition has-checked:border-[#174A91] has-checked:bg-[#F0F6FD] has-checked:text-[#174A91] has-focus-visible:outline-2 has-focus-visible:outline-[#174A91]"
          >
            <input
              type="radio"
              name="role"
              value={role.value}
              defaultChecked={role.value === initialRole}
              className="sr-only"
            />
            <role.icon className="h-5 w-5" />
            {role.label}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="email" className="text-[#152C50]">
          Email
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-10" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password" className="text-[#152C50]">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10"
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-[#F12D32]/10 px-3 py-2 text-sm text-[#C81E23]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-11 cursor-pointer rounded-lg bg-[#174A91] font-semibold text-white transition hover:bg-[#082B63] disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-[#526987]">
        <Link href="/" className="font-semibold text-[#174A91] underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </form>
  );
}
