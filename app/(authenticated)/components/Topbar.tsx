// components/Topbar.tsx
"use client";
import { Bell, Moon, ChevronDown, Sun, Menu } from "lucide-react";
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

import { logout } from "@/app/(unauthenticated)/(auth)/actions";

interface TopbarProps {
  title?: string;
  userName?: string;
  userImage?: string;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

function getInitialsWithoutMiddle(fullName: string): string {
  const nameParts = fullName.trim().split(/\s+/);

  if (nameParts.length === 0) {
    return "";
  }

  let firstNameInitial = "";
  let lastNameInitial = "";

  if (nameParts.length >= 1) {
    firstNameInitial = nameParts[0].charAt(0).toUpperCase();
  }

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
}: TopbarProps) {
  let username = userName.trim().split(" ");

  const firstName = username[0];
  const lastName = username[username.length - 1];

  const fullName = firstName + " " + lastName;

  const initials = getInitialsWithoutMiddle(userName);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header
      className="border-b px-4 sm:px-6 py-4 sticky top-0"
      style={{
        backgroundColor: "var(--color-bar-bg)",
        borderColor: isDarkMode ? "#2D3748" : "#E5E7EB",
        zIndex: 40,
      }}
    >
      <div className="flex items-center justify-between">
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h1>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full transition-all duration-200"
              style={{
                color: isDarkMode ? "#9CA3AF" : "#4B5563",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Bell className="h-5 w-5" />
            </Button>

            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span className="sr-only">Toggle dark mode</span>
                <span
                  className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDarkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  <span
                    className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                      isDarkMode
                        ? "opacity-0 duration-100 ease-out"
                        : "opacity-100 duration-200 ease-in"
                    }`}
                    aria-hidden="true"
                  >
                    <Sun className="h-4 w-4 text-yellow-500" />
                  </span>
                  <span
                    className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity ${
                      isDarkMode
                        ? "opacity-100 duration-200 ease-in"
                        : "opacity-0 duration-100 ease-out"
                    }`}
                    aria-hidden="true"
                  >
                    <Moon className="h-4 w-4 text-blue-500" />
                  </span>
                </span>
              </button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full pl-1 pr-3"
                  style={{
                    backgroundColor: isDarkMode ? "transparent" : "transparent",
                  }}
                >
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage src={userImage} alt={userName} />
                    <AvatarFallback
                      className="text-sm font-medium"
                      style={{
                        backgroundColor: isDarkMode ? "#374151" : "#E5E7EB",
                        color: isDarkMode ? "#F9FAFB" : "#374151",
                      }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {fullName}
                  </span>
                  <ChevronDown
                    className="h-4 w-4"
                    style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="text-red-600"
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Hamburger menu button - shown on mobile/tablet */}
          {showMobileMenu && (
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{
                color: isDarkMode ? "#9CA3AF" : "#4B5563",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
