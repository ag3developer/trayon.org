import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Protocol } from "@/components/Protocol";
import { UseCases } from "@/components/UseCases";
import { Architecture } from "@/components/Architecture";
import { Roadmap } from "@/components/Roadmap";
import { Token } from "@/components/Token";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Protocol />
        <UseCases />
        <Architecture />
        <Roadmap />
        <Token />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
