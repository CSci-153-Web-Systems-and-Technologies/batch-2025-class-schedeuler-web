import React from "react";
import "@/app/globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-custom-primary-bg)] flex min-h-screen items-center p-10 lg:px-30 lg:py-12">
      {children}
    </div>
  );
}