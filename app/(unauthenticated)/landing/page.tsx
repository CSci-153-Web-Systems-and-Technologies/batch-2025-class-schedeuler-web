"use client";
import LandingHeader from "@/app/(unauthenticated)/landing/components/LandingHeader";
import Footer from "@/app/components/layout/Footer";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import StepSection from "./components/StepSection";
import BenefitSection from "./components/BenefitSection";
export default function Home() {
  return (
    <div className="font-sans grid min-h-screen grid-rows-[auto_1fr_auto] bg-landing">
      <LandingHeader />
      <main>
        <HeroSection className="px-8 lg:px-16" />
        <FeatureSection id="features" className="px-8 lg:px-0" />
        <StepSection id="how-it-works" className="px-8 lg:px-16 mb-12" />
        <BenefitSection id="benefits" className="px-8 lg:px-16" />
      </main>
      <Footer />
    </div>
  );
}
