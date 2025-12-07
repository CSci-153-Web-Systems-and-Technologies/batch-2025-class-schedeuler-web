"use client";

import { X, Bell, Moon, Sun, User, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { logout } from "@/app/(unauthenticated)/(auth)/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userImage?: string;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

function getInitialsWithoutMiddle(fullName: string): string {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 0) return "";
  
  let firstNameInitial = nameParts[0].charAt(0).toUpperCase();
  let lastNameInitial = nameParts.length >= 2 
    ? nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    : firstNameInitial;

  return firstNameInitial + lastNameInitial;
}

const mobileMenuItems = [
  { name: "Home", href: "/student/dashboard" },
  { name: "My Classes", href: "/student/classes" },
  { name: "My Schedule", href: "/student/schedule" },
  { name: "Calendar", href: "/student/calendar" },
  { name: "Tasks", href: "/student/tasks" },
  { name: "Pomodoro", href: "/student/pomodoro" },
  { name: "Report", href: "/student/report" },
];

export default function StudentMobileSidebar({ 
  isOpen, 
  onClose, 
  userName = "User",
  userImage,
  isDarkMode = false,
  toggleDarkMode
}: MobileSidebarProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const initials = getInitialsWithoutMiddle(userName);

  const handleLogout = async () => {
    const result = await logout();
    if (result?.success) {
      router.push((result.redirectUrl || '/landing') + '?toast=logout');
    } else {
      showToast("Error", "Logout failed", "error");
    }
    onClose();
  };

  const handleProfile = () => {
    router.push("/student/profile");
    onClose();
  };

  const handleSettings = () => {
    router.push("/student/settings");
    onClose();
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div 
        className="lg:hidden fixed top-0 right-0 h-full w-64 bg-[var(--color-bar-bg)] border-l border-[var(--color-border)] shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
          <span className="font-bold text-xl text-[var(--color-text-primary)]">Menu</span>
          <button 
            onClick={onClose}
            className="p-1 text-[var(--color-text-primary)] hover:opacity-70 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback 
                  className="text-sm font-medium"
                  style={{
                    backgroundColor: isDarkMode ? '#374151' : '#E5E7EB',
                    color: isDarkMode ? '#F9FAFB' : '#374151',
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">{userName}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">Student</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-[var(--color-border)] space-y-3">
            <button className="flex items-center gap-3 w-full p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </button>
            
            {toggleDarkMode && (
              <button 
                onClick={toggleDarkMode}
                className="flex items-center justify-between w-full p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <span>Dark Mode</span>
                </div>
                <div className={`w-10 h-6 rounded-full relative ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : ''}`} />
                </div>
              </button>
            )}
          </div>

          <nav className="p-4 border-b border-[var(--color-border)]">
            <ul className="space-y-2">
              {mobileMenuItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="block w-full text-left px-3 py-3 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-[var(--color-border)] space-y-2 flex-shrink-0">
          <button 
            onClick={handleProfile}
            className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] rounded-lg transition-colors"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>
          
          <button 
            onClick={handleSettings}
            className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          
          <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-4">
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
}