"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PasswordInput } from "./password-input";

function FieldError({ name, error }: { name: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${name}-error`} className="text-sm text-[#C81E23]">
      {error}
    </p>
  );
}

function FieldLabel({ htmlFor, label, hint }: { htmlFor: string; label: string; hint?: string }) {
  return (
    <Label htmlFor={htmlFor} className="text-[#152C50]">
      {label}
      {hint && <span className="font-normal text-[#526987]">{hint}</span>}
    </Label>
  );
}

export function TextField({
  name,
  label,
  hint,
  error,
  className,
  type,
  ...props
}: React.ComponentProps<"input"> & { name: string; label: string; hint?: string; error?: string }) {
  const inputProps = {
    id: name,
    name,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${name}-error` : undefined,
    className: "h-10",
    ...props,
  };

  return (
    <div className={cn("grid content-start gap-2", className)}>
      <FieldLabel htmlFor={name} label={label} hint={hint} />
      {type === "password" ? (
        <PasswordInput {...inputProps} />
      ) : (
        <Input type={type} {...inputProps} />
      )}
      <FieldError name={name} error={error} />
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  error,
  className,
  ...props
}: React.ComponentProps<"textarea"> & {
  name: string;
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <FieldLabel htmlFor={name} label={label} hint={hint} />
      <Textarea
        id={name}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      <FieldError name={name} error={error} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  options,
  placeholder,
  defaultValue,
  error,
  required,
  disabled,
  className,
}: {
  name: string;
  label: string;
  options: readonly string[];
  placeholder: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const items = options.map((option) => ({ label: option, value: option }));
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <FieldLabel htmlFor={name} label={label} />
      <Select
        name={name}
        required={required}
        disabled={disabled}
        items={items}
        defaultValue={defaultValue || null}
      >
        <SelectTrigger
          id={name}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className="h-10 w-full cursor-pointer text-base md:text-sm"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {/* Always open below the field; scroll instead of flipping above when space is short. */}
        <SelectContent
          side="bottom"
          alignItemWithTrigger={false}
          collisionAvoidance={{ side: "none", fallbackAxisSide: "none" }}
          className="max-h-[min(var(--available-height),16rem)]"
        >
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="cursor-pointer py-1.5">
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError name={name} error={error} />
    </div>
  );
}

export function SubmitButton({
  pending,
  pendingLabel,
  className,
  children,
}: {
  pending: boolean;
  pendingLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "h-11 cursor-pointer rounded-lg bg-[#174A91] px-5 font-semibold text-white transition hover:bg-[#082B63] disabled:cursor-wait disabled:opacity-70",
        className
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
