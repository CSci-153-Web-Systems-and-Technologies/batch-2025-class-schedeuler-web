// app/components/layout/PublicHeader.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface PublicHeaderProps {
  className?: string;
}

const PublicHeader = ({ className }: PublicHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
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

  return (
    <header className={cn(
      "header-glass", 
      scrolled && "backdrop-blur-lg shadow-lg",
      className
    )}>
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <Image src="/icons/schedule.png" alt="Logo" width={32} height={32} />
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold text-gradient">
            Class SchedEuler
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground">
            Plan With Ease, No Conflicts Please!
          </p>
        </div>
      </Link>

      {!loading && !isAuthenticated && (
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="rounded-2xl hover:scale-105 transition-transform"
          >
            <Link href="/login">Login</Link>
          </Button>
          
          <Button
            asChild
            className="rounded-2xl hover:scale-105 transition-transform hidden sm:inline-flex"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;