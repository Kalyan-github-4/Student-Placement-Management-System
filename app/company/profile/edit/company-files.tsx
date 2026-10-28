"use client";

import { useActionState, useRef } from "react";
import { Upload } from "lucide-react";
import { FormNotice } from "@/components/auth/auth-card";
import { uploadCompanyFile } from "../../drive-actions";

export function CompanyFileUpload({
  kind,
  label,
  hint,
  accept,
  current,
}: {
  kind: "LOGO" | "AUTH_LETTER";
  label: string;
  hint: string;
  accept: string;
  current: React.ReactNode;
}) {
  const [state, action, pending] = useActionState(uploadCompanyFile.bind(null, kind), undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const ok = state?.message?.endsWith("updated.") || state?.message?.endsWith("uploaded.");

  return (
    <form ref={formRef} action={action} className="grid content-start gap-3">
      <div>
        <p className="font-medium text-[#152C50]">{label}</p>
        <p className="text-sm text-[#526987]">{hint}</p>
      </div>
      {current}
      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-[#D9E4F2] px-4 py-2 text-sm font-semibold text-[#174A91] transition hover:border-[#174A91] hover:bg-[#F0F6FD]">
        <Upload className="h-4 w-4" /> {pending ? "Uploading…" : "Choose file"}
        <input
          type="file"
          name="file"
          accept={accept}
          className="sr-only"
          disabled={pending}
          onChange={(e) => e.currentTarget.files?.length && formRef.current?.requestSubmit()}
        />
      </label>
      {state?.message && !pending && <FormNotice tone={ok ? "success" : "error"}>{state.message}</FormNotice>}
    </form>
  );
}
