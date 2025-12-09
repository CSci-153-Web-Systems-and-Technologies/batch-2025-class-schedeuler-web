// app/(unauthenticated)/privacy/page.tsx
"use client";

import React from "react";
import PublicHeader from "@/app/components/layout/PublicHeader";
import Footer from "@/app/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 text-gray-800">
        <h1 className="text-4xl font-bold mb-8 text-primary">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: December 2025</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed text-gray-600">
              We collect information you provide directly to us, such as when you create an account, update your profile, 
              or use the scheduling features. This includes your name, email address, account type (Student or Instructor), 
              and class schedule data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">2. How We Use Your Information</h2>
            <p className="leading-relaxed text-gray-600">
              We use the information we collect to provide, maintain, and improve our services. specifically:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 ml-4">
              <li>To detect scheduling conflicts between students and classes.</li>
              <li>To facilitate communication between instructors and enrolled students.</li>
              <li>To send you technical notices, updates, and support messages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">3. Data Sharing</h2>
            <p className="leading-relaxed text-gray-600">
              We do not sell your personal data. However, as a core feature of SchedEuler:
              <br />
              <strong>If you are a Student:</strong> By joining a class, you grant the Instructor of that class permission 
              to view your schedule blocks to identify free time and conflicts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3">4. Security</h2>
            <p className="leading-relaxed text-gray-600">
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}