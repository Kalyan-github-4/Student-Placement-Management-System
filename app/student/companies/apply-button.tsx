"use client";

import { useActionState } from "react";
import { applyToJob } from "../actions";

export function ApplyButton({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(applyToJob.bind(null, jobId), undefined);

  return (
    <form action={action} className="flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-lg bg-[#174A91] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#082B63] disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Applying…" : "Apply now"}
      </button>
      {state?.error && (
        <p role="alert" className="text-sm text-[#C81E23]">
          {state.error}
        </p>
      )}
    </form>
  );
}
