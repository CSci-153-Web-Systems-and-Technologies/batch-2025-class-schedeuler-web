// app/(unauthenticated)/about/page.tsx
"use client";

import React from "react";
import PublicHeader from "@/app/components/layout/PublicHeader";
import Footer from "@/app/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 text-gray-800">
        <h1 className="text-4xl font-bold mb-6 text-primary">About SchedEuler</h1>
        
        <section className="mb-10">
          <p className="text-lg leading-relaxed mb-4">
            SchedEuler is an intelligent class scheduling platform designed to bridge the gap between students and instructors. 
            Born from the frustration of manual conflict checking and double-booked rooms, our mission is simple: 
            <strong> Plan with Ease, No Conflicts Please!</strong>
          </p>
          <p className="text-lg leading-relaxed">
            Whether you are a student trying to organize your study blocks or an instructor managing multiple class sections, 
            SchedEuler provides the tools you need to visualize, manage, and optimize your time.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            To empower educational institutions with a seamless, transparent, and conflict-free scheduling experience, 
            fostering a more productive academic environment for everyone.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">The Developer</h2>
          <p className="text-lg leading-relaxed">
            SchedEuler was developed by <strong>Israel M. Binongo</strong> as a solution to modernize academic planning. 
            Built with cutting-edge web technologies like Next.js and Supabase, it represents a commitment to performance, 
            user experience, and reliability.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}