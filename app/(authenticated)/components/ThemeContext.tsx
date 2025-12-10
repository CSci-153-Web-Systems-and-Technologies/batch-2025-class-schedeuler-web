// app/(authenticated)/components/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
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
    
    // 2. Apply global class to HTML for Toasts and Portals
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
        document.body.style.backgroundColor = '#212A35'; // Sync body bg
    } else {
        root.classList.remove('dark');
        document.body.style.backgroundColor = '#E2E8F0'; // Sync body bg
    }

    // 3. CLEANUP: Reset when leaving authenticated routes (e.g. logging out)
    return () => {
        root.classList.remove('dark');
        document.body.style.backgroundColor = '';
    };
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