import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  description,
  wide,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#F0F6FD] px-4 py-12">
      <div
        className={cn(
          "w-full rounded-2xl border border-[#D9E4F2] bg-white p-6 shadow-[0_8px_24px_-12px_rgba(8,43,99,0.25)] sm:p-8",
          wide ? "max-w-3xl" : "max-w-md"
        )}
      >
        <h1 className="text-2xl font-bold text-[#152C50]">{title}</h1>
        {description && <p className="mt-1 mb-6 text-sm text-[#526987]">{description}</p>}
        {children}
      </div>
    </main>
  );
}

const tones = {
  success: "bg-emerald-50 text-emerald-800",
  error: "bg-[#F12D32]/10 text-[#C81E23]",
  info: "bg-[#174A91]/10 text-[#174A91]",
};

export function FormNotice({
  tone = "success",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg px-3 py-2 text-sm", tones[tone], className)}
    >
      {children}
    </p>
  );
}
