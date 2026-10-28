import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SignInButton } from "@/components/landing/sign-in-dialog";
import { HeroVideo } from "@/components/landing/hero-video";

// Pinned full-screen video; the rest of the page scrolls up over it.
export function Hero() {
  return (
    <section
      id="home"
      className="sticky top-0 z-0 h-svh w-full overflow-hidden bg-[#082B63] text-white"
    >
      <HeroVideo src="/videos/campus.mp4" poster="/bwu-campus-wide.webp" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,43,99,0.6) 0%, rgba(0,0,0,0.3) 45%, rgba(8,43,99,0.75) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center sm:px-10">
        <h1 className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
          <span className="block text-[15vw] leading-none font-extrabold tracking-[0.04em] whitespace-nowrap text-transparent uppercase [-webkit-text-stroke:2px_#fff] sm:text-8xl lg:text-9xl xl:text-[9.5rem] lg:[-webkit-text-stroke:3px_#fff]">
            Brainware
          </span>
          <span className="mt-[0.08em] block text-[10vw] leading-none font-bold tracking-[0.04em] whitespace-nowrap text-transparent [-webkit-text-stroke:2px_#F12D32] sm:text-6xl lg:text-7xl xl:text-8xl lg:[-webkit-text-stroke:3px_#F12D32]">
            University
          </span>
        </h1>

        <p className="mt-6 max-w-[90vw] text-lg leading-snug text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.6)] sm:text-xl lg:text-2xl">
          Where curious minds grow into confident leaders.
        </p>

        <SignInButton className="mt-8 inline-flex h-12 cursor-pointer items-center justify-center rounded-full border-[3px] border-transparent px-8 text-base font-semibold text-[#082B63] animated-ring transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:text-lg">
          Sign In
        </SignInButton>
      </div>

      <Link
        href="#about"
        aria-label="Scroll to about section"
        className="absolute bottom-[5%] left-1/2 z-10 -translate-x-1/2 animate-bounce rounded-full p-2 text-white focus-visible:outline-2 focus-visible:outline-white"
      >
        <ChevronDown className="h-6 w-6" />
      </Link>
    </section>
  );
}
