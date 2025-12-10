// app/(unauthenticated)/support/page.tsx
"use client";

import React from "react";
import PublicHeader from "@/app/components/layout/PublicHeader";
import Footer from "@/app/components/layout/Footer";
import { Mail, MessageCircle, FileQuestion } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicHeader />
      
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 text-gray-800">
        <h1 className="text-4xl font-bold mb-6 text-primary text-center">Help & Support</h1>
        <p className="text-xl text-center text-gray-500 mb-12">
          Have questions? We're here to help you get the most out of SchedEuler.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-2xl shadow-sm bg-gray-50/50 text-center relative overflow-hidden">
            <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileQuestion size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-700">FAQs</h3>
            <p className="text-gray-500 mb-6">
              A comprehensive list of common questions and troubleshooting guides will be available here soon.
            </p>
            <span className="inline-block px-4 py-1.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
              Coming Soon
            </span>
          </div>

          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center bg-white">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Need personalized help? Drop us an email and we'll get back to you.</p>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=israelbinongo@gmail.com&su=SchedEuler%20Support%20Request"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline inline-block"
            >
              Contact Us (Gmail)
            </a>
          </div>

          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center bg-white">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Report a Bug</h3>
            <p className="text-gray-600 mb-4">Found something broken? Let us know so we can fix it immediately.</p>
            <span className="text-sm text-gray-500 font-medium">
              (Log in to report bugs directly)
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}