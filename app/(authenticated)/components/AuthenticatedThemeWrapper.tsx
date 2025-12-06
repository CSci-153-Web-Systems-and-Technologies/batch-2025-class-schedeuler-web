// components/AuthenticatedThemeWrapper.tsx
"use client";

import { useThemeContext } from "./ThemeContext"; 
export default function AuthenticatedThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeContext();
  
  const themeClasses = theme === 'dark' ? 'authenticated dark' : 'authenticated';

  return (
    <div className={themeClasses}>
      {children}
    </div>
  );
}