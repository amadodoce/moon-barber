import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { About } from "@/components/landing/About";
import { Barbers } from "@/components/landing/Barbers";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <HowItWorks />
      <About />
      <Barbers />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
