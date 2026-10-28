"use client";

import { TextAreaField, TextField } from "@/components/forms/fields";
import { branches } from "@/lib/branches";
import { driveTypeLabels } from "@/lib/drives";

type Values = Record<string, string | undefined>;

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5 sm:grid-cols-2">
      <legend className="mb-1 text-base font-semibold text-[#152C50]">{title}</legend>
      {hint && <p className="-mt-3 text-sm text-[#526987] sm:col-span-2">{hint}</p>}
      {children}
    </fieldset>
  );
}

// Fields for creating or editing a drive, used by both the TPO and recruiters.
export function DriveFields({ values, errors }: { values: Values; errors?: Record<string, string> }) {
  const selectedBranches = new Set((values.branches ?? "").split("|").filter(Boolean));
  const type = values.type || "FULL_TIME";

  return (
    <>
      <Section title="Role">
        <TextField
          name="title"
          label="Role title"
          required
          placeholder="Graduate Engineer Trainee"
          defaultValue={values.title}
          error={errors?.title}
          className="sm:col-span-2"
        />
        <fieldset className="grid gap-2 sm:col-span-2">
          <legend className="mb-1 text-sm font-medium text-[#152C50]">Role type</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(driveTypeLabels).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#D9E4F2] px-3 py-2 text-sm text-[#152C50] has-checked:border-[#174A91] has-checked:bg-[#F0F6FD]"
              >
                <input type="radio" name="type" value={value} defaultChecked={value === type} />
                {label}
              </label>
            ))}
          </div>
          {errors?.type && <p className="text-sm text-[#C81E23]">{errors.type}</p>}
        </fieldset>
        <TextField
          name="ctcLpa"
          label="CTC (LPA)"
          hint=" (full-time)"
          type="number"
          step="0.01"
          min={0}
          placeholder="6.5"
          inputMode="decimal"
          defaultValue={values.ctcLpa}
          error={errors?.ctcLpa}
        />
        <TextField
          name="stipend"
          label="Stipend"
          hint=" (internship)"
          placeholder="₹25,000 / month"
          defaultValue={values.stipend}
          error={errors?.stipend}
        />
        <TextField
          name="location"
          label="Location"
          required
          placeholder="Kolkata (Hybrid)"
          defaultValue={values.location}
          error={errors?.location}
        />
        <TextField
          name="deadline"
          label="Application deadline (IST)"
          type="datetime-local"
          required
          defaultValue={values.deadline}
          error={errors?.deadline}
        />
        <TextAreaField
          name="description"
          label="Job description"
          rows={6}
          required
          defaultValue={values.description}
          error={errors?.description}
          className="sm:col-span-2"
        />
        <TextField
          name="bondDetails"
          label="Bond details"
          hint=" (optional)"
          placeholder="1-year service agreement"
          defaultValue={values.bondDetails}
          error={errors?.bondDetails}
          className="sm:col-span-2"
        />
      </Section>

      <Section
        title="Eligibility"
        hint="Leave a field empty for no restriction. The system checks these rules automatically; ineligible students don't see the drive."
      >
        <TextField name="minCgpa" label="Minimum CGPA" type="number" step="0.01" min={0} max={10} inputMode="decimal" defaultValue={values.minCgpa} error={errors?.minCgpa} />
        <TextField name="maxBacklogs" label="Max active backlogs" type="number" step={1} min={0} inputMode="numeric" defaultValue={values.maxBacklogs} error={errors?.maxBacklogs} />
        <TextField name="batch" label="Batch (passing year)" type="number" min={2000} max={2100} placeholder="2027" inputMode="numeric" defaultValue={values.batch} error={errors?.batch} />
        <div className="hidden sm:block" />
        <TextField name="min10" label="Minimum Class 10 %" type="number" step="0.01" min={0} max={100} inputMode="decimal" defaultValue={values.min10} error={errors?.min10} />
        <TextField name="min12" label="Minimum Class 12 %" type="number" step="0.01" min={0} max={100} inputMode="decimal" defaultValue={values.min12} error={errors?.min12} />
        <fieldset className="grid gap-2 sm:col-span-2">
          <legend className="mb-1 text-sm font-medium text-[#152C50]">
            Branches <span className="font-normal text-[#526987]">(none selected = all branches)</span>
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {branches.map((branch) => (
              <label key={branch} className="flex cursor-pointer items-center gap-2 text-sm text-[#152C50]">
                <input
                  type="checkbox"
                  name="branches"
                  value={branch}
                  defaultChecked={selectedBranches.has(branch)}
                />
                {branch}
              </label>
            ))}
          </div>
          {errors?.branches && <p className="text-sm text-[#C81E23]">{errors.branches}</p>}
        </fieldset>
      </Section>
    </>
  );
}
