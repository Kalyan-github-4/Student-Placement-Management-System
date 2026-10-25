"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { branches } from "@/lib/branches";
import { saveProfile } from "../../actions";

const branchItems = branches.map((branch) => ({ label: branch, value: branch }));

type Field = "name" | "rollNumber" | "branch" | "cgpa" | "backlogs" | "phone" | "resumeUrl";

export function ProfileForm({
  email,
  isNew,
  defaults,
}: {
  email: string;
  isNew: boolean;
  defaults: Partial<Record<Field, string>>;
}) {
  const [state, action, pending] = useActionState(saveProfile, undefined);
  // After a failed submit, keep what the student typed instead of the saved values.
  const values = state?.values ?? defaults;
  const error = (field: Field) => state?.errors?.[field];

  const field = (
    name: Field,
    label: string,
    props: React.ComponentProps<"input"> = {}
  ) => (
    <div className="grid gap-2">
      <Label htmlFor={name} className="text-[#152C50]">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        defaultValue={values[name]}
        aria-invalid={!!error(name)}
        aria-describedby={error(name) ? `${name}-error` : undefined}
        className="h-10"
        {...props}
      />
      {error(name) && (
        <p id={`${name}-error`} className="text-sm text-[#C81E23]">
          {error(name)}
        </p>
      )}
    </div>
  );

  return (
    // Re-mount on each failed submit so defaultValue picks up the returned values.
    <form key={JSON.stringify(state?.values)} action={action} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Full name", { required: true, autoComplete: "name" })}
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-[#152C50]">
            Email
          </Label>
          <Input id="email" value={email} disabled className="h-10" />
        </div>
        {field("rollNumber", "Roll number", { required: true, placeholder: "BWU/BTECH/22/001" })}
        <div className="grid gap-2">
          <Label htmlFor="branch" className="text-[#152C50]">
            Branch
          </Label>
          <Select
            name="branch"
            required
            items={branchItems}
            defaultValue={values.branch || null}
          >
            <SelectTrigger
              id="branch"
              aria-invalid={!!error("branch")}
              aria-describedby={error("branch") ? "branch-error" : undefined}
              className="h-10 w-full cursor-pointer text-base md:text-sm"
            >
              <SelectValue placeholder="Select your branch" />
            </SelectTrigger>
            {/* Always open below the field; scroll instead of flipping above when space is short. */}
            <SelectContent
              side="bottom"
              alignItemWithTrigger={false}
              collisionAvoidance={{ side: "none", fallbackAxisSide: "none" }}
              className="max-h-[min(var(--available-height),16rem)]"
            >
              {branchItems.map((item) => (
                <SelectItem key={item.value} value={item.value} className="cursor-pointer py-1.5">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error("branch") && (
            <p id="branch-error" className="text-sm text-[#C81E23]">
              {error("branch")}
            </p>
          )}
        </div>
        {field("cgpa", "CGPA", {
          required: true,
          type: "number",
          step: "0.01",
          min: 0,
          max: 10,
          inputMode: "decimal",
        })}
        {field("backlogs", "Active backlogs", {
          required: true,
          type: "number",
          step: 1,
          min: 0,
          inputMode: "numeric",
        })}
        {field("phone", "Mobile number", {
          required: true,
          type: "tel",
          autoComplete: "tel-national",
          placeholder: "9876543210",
        })}
        {field("resumeUrl", "Resume link (optional)", {
          type: "url",
          placeholder: "https://drive.google.com/…",
        })}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {!isNew && (
          <Link
            href="/student/profile"
            className="rounded-lg border border-[#D9E4F2] px-5 py-2.5 text-center text-sm font-semibold text-[#526987] transition hover:bg-[#F0F6FD]"
          >
            Cancel
          </Link>
        )}
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-lg bg-[#174A91] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#082B63] disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Saving…" : isNew ? "Create profile" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
