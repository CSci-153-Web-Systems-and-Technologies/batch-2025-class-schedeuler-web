// app/(unauthenticated)/(auth)/layout.tsx
import React from "react";
import "@/app/globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-custom-primary-bg)] flex min-h-screen items-center justify-center p-4 sm:p-10 lg:px-32 lg:py-12">
      <div className="w-full max-w-[1200px]">
        {children}
      </div>
    </div>
  );
}