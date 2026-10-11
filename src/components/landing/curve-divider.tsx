import { cn } from "@/lib/utils";

export function CurveDivider({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute inset-x-0 bottom-0 h-24 w-full sm:h-32 lg:h-40", className)}
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,120 C 360,40 1080,170 1440,70 L1440,200 L0,200 Z"
        fill="#F0F6FD"
      />
      <path
        d="M0,108 C 360,28 1080,158 1440,58"
        fill="none"
        stroke="#174A91"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M0,90 C 360,10 1080,140 1440,40"
        fill="none"
        stroke="#F12D32"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
