// app/(authenticated)/student/components/StudentMobileSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Bell, Moon, Sun, User, Settings, LogOut, ArrowLeft, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { logout } from "@/app/(unauthenticated)/(auth)/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { useNotifications } from "@/app/context/NotificationContext";
import { getInitialsWithoutMiddle } from "@/utils/stringUtils";
import Link from "next/link";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userImage?: string;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
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
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const initials = getInitialsWithoutMiddle(userName);
  
  const [currentView, setCurrentView] = useState<'menu' | 'notifications'>('menu');

  useEffect(() => {
    if (!isOpen) setCurrentView('menu');
  }, [isOpen]);

  const handleLogout = async () => {
    const result = await logout();
    if (result?.success) {
      router.push((result.redirectUrl || '/landing') + '?toast=logout');
    } else {
      showToast("Error", "Logout failed", "error");
    }
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle size={16} className="text-green-500" />;
      case "warning": return <AlertTriangle size={16} className="text-amber-500" />;
      case "error": return <XCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div 
        className="lg:hidden fixed top-0 right-0 h-full w-72 bg-[var(--color-bar-bg)] border-l border-[var(--color-border)] shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
        }}
      >
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {currentView === 'notifications' && (
              <button 
                onClick={() => setCurrentView('menu')}
                className="p-1 -ml-2 mr-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <span className="font-bold text-xl text-[var(--color-text-primary)]">
              {currentView === 'notifications' ? 'Notifications' : 'Menu'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-[var(--color-text-primary)] hover:opacity-70 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {currentView === 'menu' ? (
            <>
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
                <button 
                  onClick={() => setCurrentView('notifications')}
                  className="flex items-center justify-between w-full p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[var(--color-bar-bg)]" />
                      )}
                    </div>
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
                      {unreadCount}
                    </span>
                  )}
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
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block w-full text-left px-3 py-3 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          ) : (
            <div className="flex flex-col h-full">
              {unreadCount > 0 && (
                <div className="px-4 py-2 border-b border-[var(--color-border)] flex justify-end">
                  <button 
                    onClick={() => markAllAsRead()}
                    className="text-xs text-[var(--color-primary)] hover:underline font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`group flex gap-3 p-4 border-b border-[var(--color-border)] transition-colors relative ${
                          !notif.is_read ? 'bg-[var(--color-primary)]/5' : ''
                      }`}
                    >
                      <div className="mt-1 flex-shrink-0">
                          {getIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                              <p className={`text-sm ${!notif.is_read ? 'font-semibold text-[var(--color-text-primary)]' : 'font-medium text-[var(--color-text-secondary)]'}`}>
                                  {notif.title}
                              </p>
                              <span className="text-[10px] text-[var(--color-muted)] whitespace-nowrap ml-2">
                                  {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                          </div>
                          
                          <p className="text-xs text-[var(--color-text-secondary)]">
                              {notif.message}
                          </p>

                          {notif.link && (
                              <Link 
                                  href={notif.link} 
                                  className="text-xs text-[var(--color-primary)] hover:underline block pt-2"
                                  onClick={() => {
                                    markAsRead(notif.id);
                                    onClose();
                                  }}
                              >
                                  View Details
                              </Link>
                          )}
                          
                          <div className="flex justify-end gap-3 mt-2">
                             {!notif.is_read && (
                                <button 
                                    onClick={() => markAsRead(notif.id)}
                                    className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] flex items-center gap-1"
                                >
                                    <Check size={12} /> Mark Read
                                </button>
                             )}
                             <button 
                                onClick={() => deleteNotification(notif.id)}
                                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                             >
                                <Trash2 size={12} /> Delete
                             </button>
                          </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {currentView === 'menu' && (
          <div className="p-4 border-t border-[var(--color-border)] space-y-2 flex-shrink-0">
            <Link 
              href="/student/profile"
              onClick={onClose}
              className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] rounded-lg transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            
            <Link 
              href="/student/settings"
              onClick={onClose}
              className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-muted)] rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            
            <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-4">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}