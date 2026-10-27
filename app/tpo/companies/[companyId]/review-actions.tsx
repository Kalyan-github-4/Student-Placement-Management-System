"use client";

import { useActionState, useState } from "react";
import { FormNotice } from "@/components/auth/auth-card";
import { SubmitButton, TextAreaField } from "@/components/forms/fields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FormState } from "@/lib/forms";
import { decideCompany } from "../../actions";

type CompanyStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

function InstantAction({
  companyId,
  decision,
  label,
}: {
  companyId: string;
  decision: "approve" | "reinstate";
  label: string;
}) {
  const [state, action, pending] = useActionState(
    decideCompany.bind(null, companyId, decision),
    undefined
  );
  return (
    <form action={action} className="grid gap-3">
      <SubmitButton pending={pending} pendingLabel="Saving…" className="h-10 text-sm">
        {label}
      </SubmitButton>
      {state?.message && <FormNotice tone="error">{state.message}</FormNotice>}
    </form>
  );
}

function ReasonAction({
  companyId,
  decision,
  label,
  title,
  description,
}: {
  companyId: string;
  decision: "reject" | "suspend";
  label: string;
  title: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const result = await decideCompany(companyId, decision, prev, formData);
      // Success returns nothing; close the dialog and let the refreshed page show the change.
      if (!result) setOpen(false);
      return result;
    },
    undefined
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="h-10 cursor-pointer rounded-lg border border-[#F12D32]/40 px-4 text-sm font-semibold text-[#C81E23] transition hover:bg-[#F12D32]/5">
        {label}
      </DialogTrigger>
      <DialogContent className="gap-5 rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#152C50]">{title}</DialogTitle>
          <DialogDescription className="text-[#526987]">{description}</DialogDescription>
        </DialogHeader>
        <form action={action} className="grid gap-4">
          <TextAreaField name="reason" label="Reason" rows={4} required error={state?.errors?.reason} />
          {state?.message && <FormNotice tone="error">{state.message}</FormNotice>}
          <SubmitButton
            pending={pending}
            pendingLabel="Saving…"
            className="h-10 bg-[#C81E23] text-sm hover:bg-[#A3161B]"
          >
            {label}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewActions({ companyId, status }: { companyId: string; status: CompanyStatus }) {
  switch (status) {
    case "PENDING":
      return (
        <div className="grid gap-3">
          <InstantAction companyId={companyId} decision="approve" label="Approve company" />
          <ReasonAction
            companyId={companyId}
            decision="reject"
            label="Reject"
            title="Reject this company?"
            description="The recruiter gets an email with your reason and can fix their details and resubmit."
          />
        </div>
      );
    case "APPROVED":
      return (
        <ReasonAction
          companyId={companyId}
          decision="suspend"
          label="Suspend company"
          title="Suspend this company?"
          description="Its openings are hidden from students until you reinstate it. The recruiter is emailed your reason."
        />
      );
    case "SUSPENDED":
      return <InstantAction companyId={companyId} decision="reinstate" label="Reinstate company" />;
    case "REJECTED":
      return (
        <p className="text-sm text-[#526987]">
          Waiting for the recruiter to update their details and resubmit.
        </p>
      );
  }
}
