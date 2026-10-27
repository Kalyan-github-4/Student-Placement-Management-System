"use client";

import { SelectField, TextAreaField, TextField } from "@/components/forms/fields";
import { companySizes, industries } from "@/lib/company";

type Values = Record<string, string | undefined>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5 sm:grid-cols-2">
      <legend className="mb-4 text-base font-semibold text-[#152C50]">{title}</legend>
      {children}
    </fieldset>
  );
}

// Company fields shared by registration and the company profile editor.
// `legalLocked` disables the fields that need TPO re-approval once a company is approved.
export function CompanyFields({
  values,
  errors,
  legalLocked = false,
}: {
  values: Values;
  errors?: Record<string, string>;
  legalLocked?: boolean;
}) {
  const locked = legalLocked
    ? { disabled: true, title: "Contact the placement cell to change this field." }
    : {};

  return (
    <>
      <Section title="Company">
        <TextField
          name="name"
          label="Company name"
          required
          defaultValue={values.name}
          error={errors?.name}
          {...locked}
        />
        <TextField
          name="website"
          label="Website"
          type="url"
          required
          placeholder="https://acme.com"
          defaultValue={values.website}
          error={errors?.website}
          {...locked}
        />
        <SelectField
          name="industry"
          label="Industry"
          options={industries}
          placeholder="Select an industry"
          required
          defaultValue={values.industry}
          error={errors?.industry}
        />
        <SelectField
          name="size"
          label="Company size (employees)"
          options={companySizes}
          placeholder="Select a range"
          required
          defaultValue={values.size}
          error={errors?.size}
        />
        <TextField
          name="linkedinUrl"
          label="LinkedIn page"
          type="url"
          required
          placeholder="https://www.linkedin.com/company/acme"
          defaultValue={values.linkedinUrl}
          error={errors?.linkedinUrl}
        />
        <TextAreaField
          name="address"
          label="Registered address"
          required
          rows={2}
          defaultValue={values.address}
          error={errors?.address}
        />
        <TextAreaField
          name="description"
          label="About the company"
          hint=" (optional)"
          rows={3}
          className="sm:col-span-2"
          defaultValue={values.description}
          error={errors?.description}
        />
      </Section>

      <Section title="Legal details">
        <TextField
          name="gstinOrCin"
          label="GSTIN or CIN"
          hint=" (required before approval)"
          defaultValue={values.gstinOrCin}
          error={errors?.gstinOrCin}
          className="uppercase"
          {...locked}
        />
        <TextField
          name="pan"
          label="PAN"
          hint=" (optional)"
          defaultValue={values.pan}
          error={errors?.pan}
          {...locked}
        />
        {legalLocked && (
          <p className="text-sm text-[#526987] sm:col-span-2">
            Company name, website and legal details are locked after approval. Contact the
            placement cell to change them.
          </p>
        )}
      </Section>

      <Section title="Hiring intent (optional)">
        <TextField
          name="hiringRoles"
          label="Roles"
          placeholder="Software Engineer, Analyst"
          defaultValue={values.hiringRoles}
          error={errors?.hiringRoles}
        />
        <TextField
          name="hiringCtc"
          label="CTC range"
          placeholder="6–9 LPA"
          defaultValue={values.hiringCtc}
          error={errors?.hiringCtc}
        />
        <TextField
          name="hiringBatch"
          label="Batch"
          placeholder="2027"
          defaultValue={values.hiringBatch}
          error={errors?.hiringBatch}
        />
      </Section>
    </>
  );
}
