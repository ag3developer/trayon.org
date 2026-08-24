'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  const router = useRouter();
  const params = useParams();
  
  // Check if coming from dashboard - show normal home page
  // Otherwise redirect to dashboard
  useEffect(() => {
    const isDashboardRedirect = sessionStorage.getItem('from-home');
    if (!isDashboardRedirect) {
      const locale = params?.locale || 'en';
      router.replace(`/${locale}/dashboard`);
    }
  }, [params, router]);

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
