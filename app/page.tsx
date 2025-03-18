"use client";

import React from "react";
import ThreeBackground from "@/components/index/ThreeBackground";
import { Header } from "@/components/index/header";
import { ThereeAnimation } from "@/components/index/three-animation";
import { Hero } from "@/components/index/hero";
import { Features } from "@/components/index/features";
import { Pricing } from "@/components/index/pricing";
import { CTA } from "@/components/index/cta";
import { Footer } from "@/components/index/footer";
import Inventory from "@/components/index/inventory";

export default function Page() {
  return (
    <main className="min-h-screen relative">
      <ThreeBackground />
      <div className="relative z-10">
        <Header />
        <ThereeAnimation />
        <Hero />
        <Features />
        <Inventory />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}
