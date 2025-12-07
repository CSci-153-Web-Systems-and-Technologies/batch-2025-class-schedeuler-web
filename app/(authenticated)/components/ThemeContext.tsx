// components/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // [FIX] Initialize as 'light' to match Server-Side Rendering (SSR)
  // This prevents the "Hydration Mismatch" error.
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // [FIX] New Effect: Read storage only after component mounts (Client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setTheme('dark');
      }
    }
  }, []);

  useEffect(() => {
    // 1. Save preference
    localStorage.setItem('theme', theme);
    
    // 2. Force Body Background Color
    if (theme === 'dark') {
        document.body.style.backgroundColor = '#212A35'; // Dark bg
    } else {
        document.body.style.backgroundColor = '#E2E8F0'; // Light bg
    }
    
  }, [theme]);

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};