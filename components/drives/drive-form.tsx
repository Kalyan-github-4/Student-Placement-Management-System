"use client";

import { useActionState } from "react";
import Link from "next/link";
import { FormNotice } from "@/components/auth/auth-card";
import { SelectField } from "@/components/forms/fields";
import type { FormState } from "@/lib/forms";
import { DriveFields } from "./drive-fields";

// Create / edit form for drives. Two submit buttons send `intent` so one form can
// "save as draft" or "publish / submit for approval".
export function DriveForm({
  action,
  defaults = {},
  companies,
  cancelHref,
  primaryLabel,
  secondaryLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: Record<string, string>;
  companies?: { id: string; name: string }[];
  cancelHref: string;
  primaryLabel: string;
  secondaryLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: FormState, formData: FormData) => {
      // The select shows company names; send the id.
      if (companies) {
        const company = companies.find((c) => c.name === formData.get("companyName"));
        formData.set("companyId", company?.id ?? "");
      }
      return action(prev, formData);
    },
    undefined
  );
  const values = state?.values ? { ...defaults, ...state.values } : defaults;
  const errors = state?.errors;

  return (
    // Re-mount on each failed submit so defaultValue picks up the returned values.
    <form key={JSON.stringify(state?.values)} action={formAction} className="grid gap-8">
      {companies && (
        <SelectField
          name="companyName"
          label="Company"
          options={companies.map((c) => c.name)}
          placeholder={companies.length ? "Choose an approved company" : "No approved companies yet"}
          required
          defaultValue={companies.find((c) => c.id === values.companyId)?.name}
          error={errors?.companyId}
          className="sm:max-w-md"
        />
      )}
      <DriveFields values={values} errors={errors} />

      {state?.message && <FormNotice tone="error">{state.message}</FormNotice>}
      {errors && <FormNotice tone="error">Some details need fixing. Check the highlighted fields.</FormNotice>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="rounded-lg border border-[#D9E4F2] px-5 py-2.5 text-center text-sm font-semibold text-[#526987] transition hover:bg-[#F0F6FD]"
        >
          Cancel
        </Link>
        {secondaryLabel && (
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="cursor-pointer rounded-lg border border-[#174A91] px-5 py-2.5 text-sm font-semibold text-[#174A91] transition hover:bg-[#F0F6FD] disabled:cursor-wait disabled:opacity-70"
          >
            {secondaryLabel}
          </button>
        )}
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="cursor-pointer rounded-lg bg-[#174A91] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#082B63] disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Saving…" : primaryLabel}
        </button>
      </div>
    </form>
  );
}
