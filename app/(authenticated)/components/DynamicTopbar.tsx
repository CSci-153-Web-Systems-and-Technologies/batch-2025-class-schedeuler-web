// components/DynamicTopbar.tsx
"use client";

import Topbar from "./Topbar"; 
import { useThemeContext } from "./ThemeContext";

interface DynamicTopbarProps {
  title?: string;
  userName?: string;
  userImage?: string;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

export default function DynamicTopbar(props: DynamicTopbarProps) {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <Topbar
      {...props}
      isDarkMode={theme === 'dark'} 
      toggleDarkMode={toggleTheme} 
    />
  );
}