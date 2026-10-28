import { Intro } from "@/components/landing/intro";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Intro />
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <div className="relative z-10 overflow-clip rounded-t-2xl bg-white shadow-[0_-24px_60px_rgba(0,0,0,0.28)] md:rounded-t-3xl xl:rounded-t-[32px]">
          <About />
          <Features />
          <HowItWorks />
        </div>
      </main>
      <Footer />
    </>
  );
}
