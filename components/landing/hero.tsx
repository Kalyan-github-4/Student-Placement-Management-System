import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { SignInButton } from "@/components/landing/sign-in-dialog";

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-[#082B63] text-white"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 70% at 85% 20%, rgba(23,74,145,0.9) 0%, rgba(8,43,99,0) 70%), radial-gradient(40% 50% at 0% 100%, rgba(241,45,50,0.18) 0%, rgba(8,43,99,0) 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pt-32 pb-20 sm:px-10 sm:pt-36 lg:min-h-[min(100svh,56rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-28 lg:pb-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F12D32]" />
            Connect &middot; Recruit &middot; Build your future
          </p>

          <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Student Placement Management{" "}
            <span className="text-[#F12D32]">System</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            One platform for Brainware University students, recruiting companies
            and the placement cell to manage job postings, applications and
            placement records.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <SignInButton className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#F12D32] px-7 text-base font-semibold text-white shadow-lg shadow-black/25 transition hover:bg-[#d4262b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Sign In
              <ArrowRight className="h-5 w-5" />
            </SignInButton>

            <Link
              href="#features"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/60 px-7 text-base font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore features
              <ArrowDown className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div
            className="absolute -top-4 -right-4 h-full w-full rounded-3xl bg-[#F12D32]"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/20">
            <Image
              src="/bwu-campus-wide.webp"
              alt="Brainware University campus"
              width={560}
              height={373}
              preload
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-3 rounded-2xl bg-white px-5 py-3 shadow-xl shadow-black/25 sm:-left-6">
            <p className="font-[family-name:var(--font-script)] text-xl leading-tight text-[#174A91] sm:text-2xl">
              Better placements,
              <br />
              brighter futures
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
