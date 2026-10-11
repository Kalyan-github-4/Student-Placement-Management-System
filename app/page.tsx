import Image from "next/image";
import { Navbar } from "@/components/landing/navbar";
import { HeroContent } from "@/components/landing/hero-content";
import { FeatureCards } from "@/components/landing/feature-cards";
import { CurveDivider } from "@/components/landing/curve-divider";
import { Slogan } from "@/components/landing/slogan";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative isolate min-h-190 overflow-hidden bg-[#082B63] sm:min-h-215 lg:min-h-235">
        <Image
          src="/bwu-campus-wide.webp"
          alt="Brainware University campus building"
          fill
          priority
          className="object-cover object-[65%_center]"
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #082B63 0%, rgba(8,43,99,0.92) 30%, rgba(23,74,145,0.55) 55%, rgba(23,74,145,0.1) 78%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-transparent"
          aria-hidden="true"
        />

        <Navbar />
        <HeroContent />
        <CurveDivider />
        <Slogan />
      </section>

      <section id="about" className="relative bg-[#F0F6FD]">
        <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-10 sm:pb-20 lg:px-[5%] lg:pb-24">
          <div className="-mt-28 sm:-mt-32 lg:-mt-40">
            <FeatureCards />
          </div>
        </div>
      </section>
    </main>
  );
}
