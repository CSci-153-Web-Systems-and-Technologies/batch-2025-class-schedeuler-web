"use client";

import { useState } from "react";
import StudentSidebar from './components/StudentSidebar';
import DynamicTopbar from '@/app/(authenticated)/components/DynamicTopbar'; 
import StudentMobileSidebar from './components/StudentMobileSidebar';
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";
import { useCurrentTitle } from "@/hooks/useCurrentTitle";
import { TaskProvider } from './tasks/TaskContext'; 
import { SubjectProvider } from './subjects/SubjectContext'; 
import { useUser } from "@/app/context/UserContext";
import { useAlertSystem } from "@/hooks/useAlertSystem"; 

function StudentLayoutContent({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeContext();
  const { profile, loading } = useUser();
  const userName = profile?.name || "User";
  const userImage = profile?.avatar_url || undefined;
  const currentTitle = useCurrentTitle();

  useAlertSystem();

  return (
    <>
      <div className="hidden lg:block">
        <StudentSidebar/>
      </div>

      <StudentMobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userName={userName}
        userImage={userImage} 
        isDarkMode={theme === 'dark'}
        toggleDarkMode={toggleTheme}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <DynamicTopbar 
          title={currentTitle}
          userName={loading ? "Loading..." : userName} 
          userImage={userImage} 
          showMobileMenu={true}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubjectProvider> 
      <TaskProvider> 
        <StudentLayoutContent>{children}</StudentLayoutContent>
      </TaskProvider>
    </SubjectProvider>
  );
}