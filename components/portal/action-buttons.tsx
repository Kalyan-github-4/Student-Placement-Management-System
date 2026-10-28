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
import { cn } from "@/lib/utils";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

const variants = {
  primary: "bg-[#174A91] text-white hover:bg-[#082B63]",
  outline: "border border-[#D9E4F2] bg-white text-[#174A91] hover:border-[#174A91] hover:bg-[#F0F6FD]",
  danger: "border border-[#F12D32]/40 bg-white text-[#C81E23] hover:bg-[#F12D32]/5",
};

// A one-click action (bound Server Action) that shows its error message, if any.
export function ActionButton({
  action,
  label,
  pendingLabel = "Saving…",
  variant = "primary",
  confirmText,
}: {
  action: Action;
  label: string;
  pendingLabel?: string;
  variant?: keyof typeof variants;
  confirmText?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmText && !confirm(confirmText)) e.preventDefault();
      }}
      className="grid gap-2"
    >
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "h-10 cursor-pointer rounded-lg px-4 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70",
          variants[variant]
        )}
      >
        {pending ? pendingLabel : label}
      </button>
      {state?.message && <FormNotice tone="error">{state.message}</FormNotice>}
    </form>
  );
}

// An action that needs a written reason or note, collected in a dialog.
export function ReasonDialogButton({
  action,
  label,
  title,
  description,
  fieldName = "reason",
  fieldLabel = "Reason",
  required = true,
  variant = "danger",
}: {
  action: Action;
  label: string;
  title: string;
  description: string;
  fieldName?: string;
  fieldLabel?: string;
  required?: boolean;
  variant?: keyof typeof variants;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await action(prev, formData);
    // Success returns nothing; close and let the refreshed page show the change.
    if (!result) setOpen(false);
    return result;
  }, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn("h-10 cursor-pointer rounded-lg px-4 text-sm font-semibold transition", variants[variant])}
      >
        {label}
      </DialogTrigger>
      <DialogContent className="gap-5 rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#152C50]">{title}</DialogTitle>
          <DialogDescription className="text-[#526987]">{description}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <TextAreaField
            name={fieldName}
            label={fieldLabel}
            hint={required ? undefined : " (optional)"}
            rows={4}
            required={required}
            error={state?.errors?.[fieldName]}
          />
          {state?.message && <FormNotice tone="error">{state.message}</FormNotice>}
          <SubmitButton
            pending={pending}
            pendingLabel="Saving…"
            className={cn("h-10 text-sm", variant === "danger" && "bg-[#C81E23] hover:bg-[#A3161B]")}
          >
            {label}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
