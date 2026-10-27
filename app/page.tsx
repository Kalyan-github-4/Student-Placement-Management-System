import PerspectiveTunnelHero from "@/components/perspective-tunnel-hero";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <PerspectiveTunnelHero />
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <About />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
