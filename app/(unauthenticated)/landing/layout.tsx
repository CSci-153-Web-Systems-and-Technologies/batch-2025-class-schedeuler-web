import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "@/app/globals.css";

const InterFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const PoppinsFont = Poppins({
  variable: "--font-poppins",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Class SchedEuler",
  description: "Plan with ease, no conflicts please!",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${PoppinsFont.variable} ${InterFont.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
