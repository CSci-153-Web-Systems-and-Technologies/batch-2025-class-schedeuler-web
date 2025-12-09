// app/components/layout/PublicHeader.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface PublicHeaderProps {
  className?: string;
}

const PublicHeader = ({ className }: PublicHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [supabase]);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleLoginClick = () => router.push("/login");
  const handleSignupClick = () => router.push("/signup");

  return (
    <header className={cn(
      "header-glass", // Reusing the global class for consistent styling
      scrolled && "backdrop-blur-lg shadow-lg",
      className
    )}>
      {/* Logo Section */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={handleLogoClick}
      >
        <Image src="/icons/schedule.png" alt="Logo" width={32} height={32} />
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold text-gradient">
            Class SchedEuler
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground">
            Plan With Ease, No Conflicts Please!
          </p>
        </div>
      </div>

      {/* Auth Buttons - Only shown if NOT authenticated */}
      {!loading && !isAuthenticated && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleLoginClick}
            className="rounded-2xl hover:scale-105 transition-transform"
          >
            Login
          </Button>
          <Button
            onClick={handleSignupClick}
            className="rounded-2xl hover:scale-105 transition-transform hidden sm:inline-flex" // Hidden on very small screens to save space if needed, or keep visible
          >
            Sign Up
          </Button>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;