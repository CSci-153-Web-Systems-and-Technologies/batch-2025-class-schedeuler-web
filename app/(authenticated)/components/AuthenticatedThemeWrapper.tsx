// components/AuthenticatedThemeWrapper.tsx
"use client";

import React from "react";
import { useThemeContext } from "./ThemeContext"; 

export default function AuthenticatedThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeContext();
  
  const themeClasses = theme === 'dark' ? 'authenticated dark' : 'authenticated';

  return (
    <div 
      className={`${themeClasses} min-h-screen w-full transition-colors duration-200`}
      style={{ 
        backgroundColor: 'var(--color-main-bg)',
        color: 'var(--color-text-primary)'
      }}
    >
      {children}
    </div>
  );
}