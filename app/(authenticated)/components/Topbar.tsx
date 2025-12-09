// app/(authenticated)/components/Topbar.tsx
"use client";
import { Moon, ChevronDown, Sun, Menu, User, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/Dropdown-menu";
import Link from "next/link"; 
import { logout } from "@/app/(unauthenticated)/(auth)/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import NotificationPopover from "./NotificationPopover";
import { cn } from "@/lib/utils"; 

interface TopbarProps {
  title?: string;
  userName?: string;
  userImage?: string;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
  userRole?: 'student' | 'instructor'; 
}

function getInitialsWithoutMiddle(fullName: string): string {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 0) return "";
  let firstNameInitial = "";
  let lastNameInitial = "";
  if (nameParts.length >= 1) firstNameInitial = nameParts[0].charAt(0).toUpperCase();
  if (nameParts.length >= 2) {
    lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  } else if (nameParts.length === 1) {
    lastNameInitial = firstNameInitial;
  }
  return firstNameInitial + lastNameInitial;
}

export default function Topbar({
  title = "Dashboard",
  userName = "John Smith",
  userImage,
  isDarkMode = false,
  toggleDarkMode,
  showMobileMenu = false,
  onMobileMenuToggle,
  userRole = 'student'
}: TopbarProps) {
  
  const nameParts = userName.trim().split(/\s+/);
  let displayName = userName;

  if (nameParts.length > 1) {
      displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
  } 
  
  const initials = getInitialsWithoutMiddle(userName);
  const router = useRouter();
  const { showToast } = useToast();

  const profileHref = `/${userRole}/profile`;
  const settingsHref = `/${userRole}/settings`;

  const handleLogout = async () => {
    const result = await logout();
    if (result?.success) {
      router.push((result.redirectUrl || '/landing') + '?toast=logout');
    } else {
      showToast("Error", "Logout failed", "error");
    }
  };

  const menuItemClass = "cursor-pointer flex items-center gap-2 focus:bg-[var(--color-hover)] focus:text-[var(--color-text-primary)]";

  return (
    <header className="border-b px-4 sm:px-6 py-4 sticky top-0"
      style={{ backgroundColor: "var(--color-bar-bg)", borderColor: isDarkMode ? "#2D3748" : "#E5E7EB", zIndex: 40 }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h1>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-3">
            
            <NotificationPopover />

            {toggleDarkMode && (
              <button onClick={toggleDarkMode} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} role="switch" aria-checked={isDarkMode}>
                <span className="sr-only">Toggle dark mode</span>
                <span className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDarkMode ? "translate-x-5" : "translate-x-0"}`}>
                  <span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${isDarkMode ? "opacity-0 duration-100 ease-out" : "opacity-100 duration-200 ease-in"}`} aria-hidden="true">
                    <Sun className="h-4 w-4 text-yellow-500" />
                  </span>
                  <span className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${isDarkMode ? "opacity-100 duration-200 ease-in" : "opacity-0 duration-100 ease-out"}`} aria-hidden="true">
                    <Moon className="h-4 w-4 text-blue-500" />
                  </span>
                </span>
              </button>
            )}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-full pl-1 pr-3" style={{ backgroundColor: "transparent" }}>
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage src={userImage} alt={userName} />
                    <AvatarFallback className="text-sm font-medium" style={{ backgroundColor: isDarkMode ? "#374151" : "#E5E7EB", color: isDarkMode ? "#F9FAFB" : "#374151" }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{displayName}</span>
                  <ChevronDown className="h-4 w-4" style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }} />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-56 bg-[var(--color-components-bg)] border-[var(--color-border)] text-[var(--color-text-primary)]",
                  isDarkMode ? "authenticated dark" : "authenticated"
                )}
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[var(--color-border)]" />
                
                <DropdownMenuItem asChild className={menuItemClass}>
                  <Link href={profileHref}>
                    <User size={16} />
                    Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className={menuItemClass}>
                  <Link href={settingsHref}>
                    <SettingsIcon size={16} />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-[var(--color-border)]" />
                <DropdownMenuItem 
                  onSelect={(e) => { e.preventDefault(); handleLogout(); }} 
                  className={`text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20 ${menuItemClass.replace('focus:text-[var(--color-text-primary)]', '')}`}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {showMobileMenu && (
            <button onClick={onMobileMenuToggle} className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={{ color: isDarkMode ? "#9CA3AF" : "#4B5563", backgroundColor: "transparent" }}>
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}