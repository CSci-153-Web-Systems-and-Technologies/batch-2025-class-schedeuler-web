"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useNotifications } from "@/app/context/NotificationContext";
import Link from "next/link";
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/app/components/ui/Dropdown-menu";

export default function NotificationPopover() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  const { theme } = useThemeContext();
  const themeClass = theme === 'dark' ? 'authenticated dark' : 'authenticated';

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle size={16} className="text-green-500" />;
      case "warning": return <AlertTriangle size={16} className="text-amber-500" />;
      case "error": return <XCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full transition-all duration-200 bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[var(--color-bar-bg)]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className={`w-80 p-0 overflow-hidden bg-[var(--color-components-bg)] border-[var(--color-border)] ${themeClass}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <span className="font-semibold text-sm text-[var(--color-text-primary)]">Notifications</span>
          {unreadCount > 0 && (
            <button 
                onClick={() => markAllAsRead()}
                className="text-xs text-[var(--color-primary)] hover:underline"
            >
                Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)] text-sm">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`group flex gap-3 p-3 border-b border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors relative ${
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
                    
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                        {notif.message}
                    </p>

                    {notif.link && (
                        <Link 
                            href={notif.link} 
                            className="text-xs text-[var(--color-primary)] hover:underline block pt-1"
                            onClick={() => markAsRead(notif.id)}
                        >
                            View Details
                        </Link>
                    )}
                </div>

                {/* Actions (Visible on Hover) */}
                <div className="absolute right-2 top-8 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-hover)] pl-2 rounded-md">
                    {!notif.is_read && (
                        <button 
                            onClick={() => markAsRead(notif.id)}
                            className="p-1 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-secondary)]"
                            title="Mark as read"
                        >
                            <Check size={14} />
                        </button>
                    )}
                    <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1 rounded-full hover:bg-red-100 text-[var(--color-text-secondary)] hover:text-red-500"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}