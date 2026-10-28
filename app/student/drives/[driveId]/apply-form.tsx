"use client";

import { useActionState } from "react";
import { FormNotice } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/forms/fields";
import { applyToDrive, withdrawApplication } from "../../actions";

export function ApplyForm({
  driveId,
  resumes,
}: {
  driveId: string;
  resumes: { id: string; fileName: string; isDefault: boolean }[];
}) {
  const [state, action, pending] = useActionState(applyToDrive.bind(null, driveId), undefined);
  const defaultId = (resumes.find((r) => r.isDefault) ?? resumes[0]).id;

  return (
    <form action={action} className="grid gap-4">
      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium text-[#152C50]">Resume to send</legend>
        {resumes.map((resume) => (
          <label
            key={resume.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#D9E4F2] px-3 py-2 text-sm text-[#152C50] has-checked:border-[#174A91] has-checked:bg-[#F0F6FD]"
          >
            <input type="radio" name="resumeId" value={resume.id} defaultChecked={resume.id === defaultId} />
            <span className="min-w-0 truncate">{resume.fileName}</span>
          </label>
        ))}
      </fieldset>
      {state?.message && <FormNotice tone="error">{state.message}</FormNotice>}
      <SubmitButton pending={pending} pendingLabel="Applying…" className="h-10 text-sm">
        Apply now
      </SubmitButton>
    </form>
  );
}

export function WithdrawButton({ applicationId }: { applicationId: string }) {
  const [state, action, pending] = useActionState(withdrawApplication.bind(null, applicationId), undefined);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Withdraw this application? You can't apply to this drive again.")) e.preventDefault();
      }}
      className="grid gap-2"
    >
      <button
        type="submit"
        disabled={pending}
        className="h-9 w-fit cursor-pointer rounded-lg border border-[#F12D32]/40 px-3 text-sm font-semibold text-[#C81E23] transition hover:bg-[#F12D32]/5 disabled:opacity-60"
      >
        {pending ? "Withdrawing…" : "Withdraw application"}
      </button>
      {state?.message && <p className="text-xs text-[#C81E23]">{state.message}</p>}
    </form>
  );
}
