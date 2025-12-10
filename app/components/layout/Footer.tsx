// app/components/layout/Footer.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { NavLink } from "@/types/sections";
import { cn } from "@/lib/utils";

const NAV_LINKS: NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/support", label: "Support" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const SOCIAL_LINKS = [
  { href: "https://github.com/BinongoIsrael", icon: "/icons/github.svg", alt: "GitHub" },
  { href: "https://www.linkedin.com/in/israel-binongo-9ba151272/", icon: "/icons/linkedin.svg", alt: "LinkedIn" },
  { href: "https://www.facebook.com/israel.binongo.7", icon: "/icons/facebook.svg", alt: "Facebook" },
] as const;

const NAV_LINK_CLASSES = "font-bold lg:text-base md:text-[10px] text-foreground px-2 py-[6px] hover:bg-primary/10 rounded-xl transition-colors active:bg-primary/20";

const Footer = () => {
  const renderNavLinks = (mobile: boolean = false) => (
    <ul className={cn(
      mobile ? "flex flex-wrap justify-center gap-4" : "hidden md:flex gap-1 lg:gap-4"
    )}>
      {NAV_LINKS.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className={NAV_LINK_CLASSES}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const renderSocialLinks = (mobile: boolean = false) => (
    <ul className={cn("flex gap-4", mobile ? "flex" : "hidden md:flex")}>
      {SOCIAL_LINKS.map((social) => (
        <li key={social.alt}>
          <a 
            href={social.href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-70 transition-opacity"
          >
            <Image src={social.icon} alt={social.alt} width={24} height={24} />
          </a>
        </li>
      ))}
    </ul>
  );

  const renderCopyright = (mobile: boolean = false) => (
    <p className={cn(
      "font-inter text-xs text-muted-foreground",
      mobile ? "text-center" : "hidden md:block"
    )}>
      &copy; 2025 SchedEuler&mdash;Israel M. Binongo. All rights reserved.
    </p>
  );

  const renderBrandInfo = () => (
    <div className="hidden md:flex flex-col">
      <h3 className="text-base font-bold text-foreground">SchedEuler</h3>
      <p className="text-sm text-muted-foreground font-bold">
        Plan With Ease, No Conflicts Please!
      </p>
      {renderCopyright()}
    </div>
  );

  const renderMobileView = () => (
    <div className="flex md:hidden flex-col items-center gap-2">
      {renderSocialLinks(true)}
      {renderNavLinks(true)}
      {renderCopyright(true)}
    </div>
  );

  return (
    <footer className="flex flex-col md:flex-row justify-between items-center w-full px-8 lg:px-16 py-4 md:py-2 mt-auto gap-6 md:gap-0 border-t border-border">
      {renderBrandInfo()}
      {renderMobileView()}
      {renderNavLinks()}
      {renderSocialLinks()}
    </footer>
  );
};

export default Footer;