import Link from "next/link";
import { Briefcase, ArrowRight, PlayCircle } from "lucide-react";

export function HeroContent() {
  return (
    <div className="relative z-10 flex flex-col px-6 pt-32 pb-64 sm:px-10 sm:pt-36 sm:pb-72 lg:px-[5%] lg:pt-44 lg:pb-80">
      <p className="text-sm font-medium tracking-wide text-white/85 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)] sm:text-base">
        Connect &middot; Recruit &middot; Build Your Future
      </p>

      <h1 className="mt-4 max-w-2xl text-4xl leading-[1.08] font-extrabold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] sm:text-5xl lg:text-[60px]">
        Student Placement
        <br />
        Management <span className="text-[#F12D32]">System</span>
      </h1>

      <p className="mt-6 max-w-[520px] text-base leading-relaxed text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.3)] sm:text-lg">
        A centralized platform to manage student placements, company recruitment
        drives, applications and placement records efficiently.
      </p>

      <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href="/register"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#F12D32] px-7 text-base font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#d4262b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Briefcase className="h-5 w-5" />
          Get Started
          <ArrowRight className="h-5 w-5" />
        </Link>

        <Link
          href="#features"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/70 bg-[#174A91]/30 px-7 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-[#174A91]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <PlayCircle className="h-5 w-5" />
          Learn More
        </Link>
      </div>
    </div>
  );
}
