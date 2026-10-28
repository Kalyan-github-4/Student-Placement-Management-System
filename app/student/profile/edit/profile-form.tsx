"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormNotice } from "@/components/auth/auth-card";
import { SelectField, SubmitButton, TextField } from "@/components/forms/fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { branches } from "@/lib/branches";
import { saveProfile } from "../../actions";

export function ProfileForm({
  email,
  defaults,
  academicLocked,
  wasSubmitted,
}: {
  email: string;
  defaults: Record<string, string>;
  academicLocked: boolean;
  wasSubmitted: boolean;
}) {
  const [state, action, pending] = useActionState(saveProfile, undefined);
  // After a failed submit, keep what the student typed instead of the saved values.
  const values = state?.values ? { ...defaults, ...state.values } : defaults;
  const errors = state?.errors;
  const locked = academicLocked
    ? { disabled: true, title: "Locked after verification. Send a correction request instead." }
    : {};

  return (
    // Re-mount on each failed submit so defaultValue picks up the returned values.
    <form key={JSON.stringify(state?.values)} action={action} className="grid gap-8">
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold text-[#152C50]">Personal</legend>
        <TextField name="name" label="Full name" required autoComplete="name" defaultValue={values.name} error={errors?.name} />
        <div className="grid content-start gap-2">
          <Label htmlFor="email" className="text-[#152C50]">
            Email
          </Label>
          <Input id="email" value={email} disabled className="h-10" />
        </div>
        <TextField
          name="phone"
          label="Mobile number"
          type="tel"
          required
          autoComplete="tel-national"
          placeholder="9876543210"
          defaultValue={values.phone}
          error={errors?.phone}
        />
        <TextField
          name="skills"
          label="Skills"
          hint=" (comma separated)"
          placeholder="Java, SQL, React"
          defaultValue={values.skills}
          error={errors?.skills}
        />
        <TextField name="githubUrl" label="GitHub" hint=" (optional)" type="url" placeholder="https://github.com/you" defaultValue={values.githubUrl} error={errors?.githubUrl} />
        <TextField name="linkedinUrl" label="LinkedIn" hint=" (optional)" type="url" placeholder="https://www.linkedin.com/in/you" defaultValue={values.linkedinUrl} error={errors?.linkedinUrl} />
        <TextField name="portfolioUrl" label="Portfolio" hint=" (optional)" type="url" placeholder="https://you.dev" defaultValue={values.portfolioUrl} error={errors?.portfolioUrl} />
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold text-[#152C50]">Academic</legend>
        {academicLocked && (
          <p className="text-sm text-[#526987] sm:col-span-2">
            These are locked because your profile is verified. To change one, send a correction
            request from your profile page.
          </p>
        )}
        <TextField name="rollNumber" label="Roll number" required placeholder="BWU/BTECH/23/001" defaultValue={values.rollNumber} error={errors?.rollNumber} {...locked} />
        <SelectField
          name="branch"
          label="Branch"
          options={branches}
          placeholder="Select your branch"
          required
          defaultValue={values.branch}
          error={errors?.branch}
          disabled={academicLocked}
        />
        <TextField name="batch" label="Batch (passing year)" type="number" required min={2000} max={2100} placeholder="2027" inputMode="numeric" defaultValue={values.batch} error={errors?.batch} {...locked} />
        <TextField name="cgpa" label="CGPA" type="number" required step="0.01" min={0} max={10} inputMode="decimal" defaultValue={values.cgpa} error={errors?.cgpa} {...locked} />
        <TextField name="activeBacklogs" label="Active backlogs" type="number" required step={1} min={0} inputMode="numeric" defaultValue={values.activeBacklogs} error={errors?.activeBacklogs} {...locked} />
        <TextField name="marks10" label="Class 10 %" type="number" required step="0.01" min={0} max={100} inputMode="decimal" defaultValue={values.marks10} error={errors?.marks10} {...locked} />
        <TextField name="marks12" label="Class 12 %" type="number" required step="0.01" min={0} max={100} inputMode="decimal" defaultValue={values.marks12} error={errors?.marks12} {...locked} />
      </fieldset>

      {wasSubmitted && (
        <FormNotice tone="info">
          Your profile is waiting for verification. Saving changes takes it out of the queue; submit
          it again from your profile afterwards.
        </FormNotice>
      )}
      {errors && <FormNotice tone="error">Some details need fixing. Check the highlighted fields.</FormNotice>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/student/profile"
          className="rounded-lg border border-[#D9E4F2] px-5 py-2.5 text-center text-sm font-semibold text-[#526987] transition hover:bg-[#F0F6FD]"
        >
          Cancel
        </Link>
        <SubmitButton pending={pending} pendingLabel="Saving…" className="h-auto py-2.5 text-sm">
          Save profile
        </SubmitButton>
      </div>
    </form>
  );
}
