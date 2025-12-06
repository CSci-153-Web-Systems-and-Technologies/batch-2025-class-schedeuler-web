// app/(authenticated)/student/layout.tsx (Client Component)
"use client";

import { useState, useEffect } from "react";
import StudentSidebar from './components/StudentSidebar';
import DynamicTopbar from '@/app/(authenticated)/components/DynamicTopbar'; 
import StudentMobileSidebar from './components/StudentMobileSidebar';
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";
import { createClient } from '@/utils/supabase/client'; 
import { useCurrentTitle } from "@/hooks/useCurrentTitle";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeContext();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient(); 
  const currentTitle = useCurrentTitle();
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {

          const { data: profile, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (profile) {
            setUserName(profile.name || "User");
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [supabase]);

  return (
    <>
      <div className="hidden lg:block">
        <StudentSidebar/>
      </div>

      <StudentMobileSidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userName={userName}
        isDarkMode={theme === 'dark'}
        toggleDarkMode={toggleTheme}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <DynamicTopbar 
          title={currentTitle}
          userName={isLoading ? "Loading..." : userName} 
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