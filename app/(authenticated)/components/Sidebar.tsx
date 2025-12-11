"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Home,
  BookOpen,
  CalendarDays,
  Calendar,
  CheckSquare,
  Clock,
  Flag,
  Menu,
  ChevronsLeft,
} from "lucide-react";

export interface MenuItem {
  icon: string;
  label: string;
  active: boolean;
  href: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  title?: string;
  logo?: React.ReactNode;
}

const iconMap: Record<string, React.ElementType> = {
  Home,
  BookOpen,
  CalendarDays,
  Calendar,
  CheckSquare,
  Clock,
  Flag,
};

export default function Sidebar({
  menuItems,
  title = "SchedEuler",
  logo,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <div
        className="fixed left-0 top-0 h-screen border-r transition-[width] duration-300 ease-in-out flex flex-col z-40"
        style={{
          width: isCollapsed ? "80px" : "220px",
          backgroundColor: 'var(--color-bar-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div 
          className={`px-4 py-4.5 border-b flex items-center ${isCollapsed ? "justify-center py-6" : "justify-between"}`}
          style={{
            borderColor: 'var(--color-border)',
          }}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {logo || (
                <Image
                  src="/icons/schedule.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              )}
              <span 
                className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                {title}
              </span>
            </div>
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ color: 'var(--color-text-primary)' }}
            className="hover:opacity-70 transition-opacity"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronsLeft size={20} />}
          </button>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = iconMap[item.icon];

              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                    style={{
                      backgroundColor: item.active 
                        ? 'var(--color-primary)' 
                        : 'transparent',
                      color: item.active 
                        ? '#ffffff' 
                        : 'var(--color-text-primary)',
                      boxShadow: item.active 
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!item.active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }
                    }}
                  >
                    {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div
        className="transition-[width] duration-300 ease-in-out flex-shrink-0"
        style={{
          width: isCollapsed ? "80px" : "220px",
        }}
      />
    </>
  );
}