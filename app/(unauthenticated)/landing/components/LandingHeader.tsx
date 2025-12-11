// app/(unauthenticated)/landing/components/LandingHeader.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { NavLink, SectionProps } from "@/types/sections";
import { cn } from "@/lib/utils";

const NAV_LINKS: NavLink[] = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#benefits", label: "Benefits" },
];

const NAV_LINK_CLASSES =
  "px-2 py-[6px] md:py-[2px] rounded-xl hover:bg-primary/10 transition-colors";

const LandingHeader = ({ className }: SectionProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollToElement } = useSmoothScroll();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    scrollToElement(href);
    closeMenu();
  };

  const handleLogoClick = () => {
    if (scrolled) {
      scrollToElement("body");
    }
  };

  const renderNavLinks = (links: NavLink[], mobile: boolean = false) => (
    <ul
      className={cn(
        "text-foreground",
        mobile ? "flex flex-col gap-2" : "flex gap-4 md:gap-1"
      )}
    >
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className={cn(
              NAV_LINK_CLASSES,
              mobile && "block text-center active:bg-primary/20"
            )}
            onClick={(e) => handleNavClick(e, link.href)}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );

  const renderAuthButtons = () => (
    <div className="hidden md:flex gap-2">
      <Button asChild variant="outline" className="rounded-2xl hover:scale-110">
        <Link href="/login">Login</Link>
      </Button>

      <Button asChild className="hidden lg:block rounded-2xl hover:scale-110">
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );

  const renderMobileMenu = () => (
    <div className="md:hidden absolute top-full right-4 mt-2 bg-background/95 backdrop-blur-lg shadow-lg z-40 rounded-xl overflow-hidden min-w-[200px]">
      <nav className="p-4">
        {renderNavLinks(NAV_LINKS, true)}
        <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-border">
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="w-full rounded-xl">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </nav>
    </div>
  );

  const renderHamburgerButton = () => (
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="md:hidden flex flex-col gap-1.5 p-2"
      aria-label="Toggle menu"
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            "block w-6 h-0.5 bg-foreground transition-all duration-300",
            menuOpen && index === 0 && "rotate-45 translate-y-2",
            menuOpen && index === 1 && "opacity-0",
            menuOpen && index === 2 && "-rotate-45 -translate-y-2"
          )}
        />
      ))}
    </button>
  );

  return (
    <header
      className={cn(
        "header-glass",
        scrolled && "backdrop-blur-lg shadow-lg",
        className
      )}
    >
      <div
        className={cn("flex items-center gap-2", scrolled && "cursor-pointer")}
        onClick={handleLogoClick}
        role={scrolled ? "button" : undefined}
        tabIndex={scrolled ? 0 : -1}
        onKeyDown={(e) => {
          if (scrolled && (e.key === "Enter" || e.key === " ")) {
            handleLogoClick();
          }
        }}
      >
        <Image src="/icons/schedule.png" alt="Logo" width={32} height={32} />
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Class SchedEuler
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground">
            Plan With Ease, No Conflicts Please!
          </p>
        </div>
      </div>

      <nav className="hidden md:block">{renderNavLinks(NAV_LINKS)}</nav>

      {renderHamburgerButton()}

      {menuOpen && renderMobileMenu()}

      {renderAuthButtons()}
    </header>
  );
};

export default LandingHeader;
