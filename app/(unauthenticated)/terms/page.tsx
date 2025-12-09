// app/(unauthenticated)/terms/page.tsx
"use client";

import React from "react";
import PublicHeader from "@/app/components/layout/PublicHeader";
import Footer from "@/app/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 text-gray-800">
        <h1 className="text-4xl font-bold mb-8 text-primary">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: December 2025</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed text-gray-600">
              By accessing or using SchedEuler, you agree to be bound by these Terms. If you disagree with any part of the terms, 
              then you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. User Accounts</h2>
            <p className="leading-relaxed text-gray-600">
              When you create an account with us, you must provide us information that is accurate, complete, and current at all times. 
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. Academic Integrity</h2>
            <p className="leading-relaxed text-gray-600">
              SchedEuler is a tool to assist in planning. You agree not to use the platform to manipulate enrollment data, 
              impersonate instructors, or disrupt the academic planning of others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Termination</h2>
            <p className="leading-relaxed text-gray-600">
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, 
              including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">5. Changes</h2>
            <p className="leading-relaxed text-gray-600">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}