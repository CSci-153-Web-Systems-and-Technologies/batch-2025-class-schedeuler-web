"use client";

import { useState } from "react";
import InstructorSidebar from './components/InstructorSidebar';
import InstructorMobileSidebar from './components/InstructorMobileSidebar';
import DynamicTopbar from '@/app/(authenticated)/components/DynamicTopbar'; 
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";
import { useCurrentTitle } from "@/hooks/useCurrentTitle";
import { useUser } from "@/app/context/UserContext";
import { SubjectProvider } from '@/app/(authenticated)/student/subjects/SubjectContext'; 
import { TaskProvider } from '@/app/(authenticated)/student/tasks/TaskContext'; 

function InstructorLayoutContent({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeContext();
  const { profile, loading } = useUser();
  const userName = profile?.name || "Instructor";
  const userImage = profile?.avatar_url || undefined;
  const currentTitle = useCurrentTitle();

  return (
    <>
      <div className="hidden lg:block">
        <InstructorSidebar />
      </div>

      <InstructorMobileSidebar 
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

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubjectProvider> 
      <TaskProvider> 
        <InstructorLayoutContent>{children}</InstructorLayoutContent>
      </TaskProvider>
    </SubjectProvider>
  );
}