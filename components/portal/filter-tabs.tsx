import Link from "next/link";
import { cn } from "@/lib/utils";

// Status filter pills that link to `?status=`; the first option should be "All".
export function FilterTabs<T extends string>({
  basePath,
  options,
  active,
}: {
  basePath: string;
  options: { label: string; status?: T }[];
  active: T | undefined;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Link
          key={option.label}
          href={option.status ? `${basePath}?status=${option.status}` : basePath}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition",
            option.status === active
              ? "border-[#174A91] bg-[#174A91] text-white"
              : "border-[#D9E4F2] bg-white text-[#526987] hover:border-[#174A91] hover:text-[#174A91]"
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

// Reads `?status=` and returns it only if it's one of the allowed values.
export function pickStatus<T extends string>(param: string | string[] | undefined, allowed: readonly T[]) {
  return typeof param === "string" && (allowed as readonly string[]).includes(param) ? (param as T) : undefined;
}
