// app/(unauthenticated)/landing/page.tsx
"use client";

import React, { useEffect, useRef, Suspense } from 'react'; // Added Suspense
import { useSearchParams, useRouter } from 'next/navigation'; 
import { useToast } from '@/app/context/ToastContext'; 
import LandingHeader from "@/app/(unauthenticated)/landing/components/LandingHeader";
import Footer from "@/app/components/layout/Footer";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import StepSection from "./components/StepSection";
import BenefitSection from "./components/BenefitSection";

function ToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (searchParams.get('toast') === 'logout' && !toastShownRef.current) {
      showToast("Logged out", "You have been successfully logged out.", "info");
      
      toastShownRef.current = true;
      router.replace('/landing'); 
    }
  }, [searchParams, showToast, router]);

  return null; 
}

export default function Home() {
  return (
    <div className="font-sans grid min-h-screen grid-rows-[auto_1fr_auto] bg-landing">
      <Suspense fallback={null}>
        <ToastListener />
      </Suspense>

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