import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { About } from "@/components/landing/About";
import { Barbers } from "@/components/landing/Barbers";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { getLandingData } from "@/lib/landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getLandingData();

  return (
    <main>
      <Navbar />
      <Hero shopName={data.content.shop_name} subtitle={data.content.hero_subtitle} />
      <Services services={data.services.map((s) => ({
        name: s.name,
        description: s.description,
        price: s.price.toLocaleString("fa-IR"),
        duration: `${s.durationMinutes} دقیقه`,
      }))} />
      <HowItWorks />
      <About text={data.content.about_text} />
      <Barbers barbers={data.barbers.map(b => ({
        name: b.user.name,
        specialty: b.bio?.split(" ").slice(0, 3).join(" ") ?? "آرایشگر حرفه‌ای",
        experience: b.experienceYears ? `${b.experienceYears} سال سابقه` : "",
      }))} />
      <Testimonials />
      <FinalCTA />
      <Footer
        phone={data.content.phone}
        address={data.content.address}
        workingHours={data.content.working_hours_text}
      />
    </main>
  );
}
