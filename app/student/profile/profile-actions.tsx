"use client";

import { useActionState, useRef } from "react";
import { FileText, Star, Trash2, Upload } from "lucide-react";
import { FormNotice } from "@/components/auth/auth-card";
import { SelectField, SubmitButton, TextAreaField, TextField } from "@/components/forms/fields";
import {
  deleteResume,
  requestCorrection,
  setDefaultResume,
  submitForVerification,
  uploadResume,
} from "../actions";

export function SubmitVerificationButton() {
  const [state, action, pending] = useActionState(submitForVerification, undefined);
  return (
    <form action={action} className="grid gap-2">
      <SubmitButton pending={pending} pendingLabel="Submitting…" className="h-10 text-sm">
        Submit for verification
      </SubmitButton>
      {state?.message && <FormNotice tone="error">{state.message}</FormNotice>}
    </form>
  );
}

export function ResumeUpload() {
  const [state, action, pending] = useActionState(uploadResume, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const ok = state?.message === "Resume uploaded.";

  return (
    <form ref={formRef} action={action} className="grid gap-3">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#D9E4F2] p-5 text-center text-sm text-[#526987] transition hover:border-[#174A91] hover:bg-[#F0F6FD]">
        <Upload className="h-5 w-5 text-[#174A91]" />
        <span>
          <span className="font-semibold text-[#174A91]">Choose a PDF</span> (up to 2 MB). It
          uploads as soon as you pick it.
        </span>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          className="sr-only"
          disabled={pending}
          onChange={(e) => e.currentTarget.files?.length && formRef.current?.requestSubmit()}
        />
      </label>
      {pending && <FormNotice tone="info">Uploading…</FormNotice>}
      {state?.message && !pending && (
        <FormNotice tone={ok ? "success" : "error"}>{state.message}</FormNotice>
      )}
    </form>
  );
}

export function ResumeRow({
  id,
  fileName,
  size,
  isDefault,
}: {
  id: string;
  fileName: string;
  size: number;
  isDefault: boolean;
}) {
  const [defaultState, makeDefault, settingDefault] = useActionState(
    setDefaultResume.bind(null, id),
    undefined
  );
  const [deleteState, remove, deleting] = useActionState(deleteResume.bind(null, id), undefined);
  const message = deleteState?.message ?? defaultState?.message;

  return (
    <li className="grid gap-2 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <FileText className="h-5 w-5 shrink-0 text-[#174A91]" />
        <a
          href={`/files/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 truncate font-medium text-[#152C50] hover:text-[#174A91] hover:underline"
        >
          {fileName}
        </a>
        <span className="text-xs text-[#526987]">{Math.ceil(size / 1024)} KB</span>
        {isDefault ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-700">
            <Star className="h-3.5 w-3.5 fill-current" /> Default
          </span>
        ) : (
          <form action={makeDefault}>
            <button
              type="submit"
              disabled={settingDefault}
              className="cursor-pointer text-xs font-semibold text-[#174A91] hover:underline disabled:opacity-60"
            >
              Make default
            </button>
          </form>
        )}
        <form action={remove}>
          <button
            type="submit"
            disabled={deleting}
            aria-label={`Delete ${fileName}`}
            className="cursor-pointer rounded-md p-1 text-[#526987] transition hover:bg-[#F12D32]/10 hover:text-[#C81E23] disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      </div>
      {message && <p className="text-xs text-[#C81E23]">{message}</p>}
    </li>
  );
}

export function CorrectionForm({ fields }: { fields: { value: string; label: string }[] }) {
  const [state, action, pending] = useActionState(requestCorrection, undefined);
  const values = state?.errors ? state.values : undefined;
  const labels = fields.map((f) => f.label);
  const toValue = Object.fromEntries(fields.map((f) => [f.label, f.value]));

  return (
    <form
      key={state?.message ?? JSON.stringify(values)}
      action={(formData) => {
        // The select shows labels; send the field key.
        formData.set("field", toValue[String(formData.get("fieldLabel"))] ?? "");
        return action(formData);
      }}
      className="grid gap-4"
    >
      {state?.message && <FormNotice>{state.message}</FormNotice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="fieldLabel"
          label="Field"
          options={labels}
          placeholder="Choose a field"
          required
          defaultValue={fields.find((f) => f.value === values?.field)?.label}
          error={state?.errors?.field}
        />
        <TextField
          name="requestedValue"
          label="Correct value"
          required
          defaultValue={values?.requestedValue}
          error={state?.errors?.requestedValue}
        />
      </div>
      <TextAreaField
        name="reason"
        label="Reason"
        rows={2}
        required
        placeholder="e.g. My CGPA was updated after the revaluation results."
        defaultValue={values?.reason}
        error={state?.errors?.reason}
      />
      <SubmitButton pending={pending} pendingLabel="Sending…" className="h-10 w-full text-sm sm:w-fit">
        Send request
      </SubmitButton>
    </form>
  );
}
