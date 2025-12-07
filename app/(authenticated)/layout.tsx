// app/(authenticated)/layout.tsx
import React from 'react';
import { ThemeProvider } from './components/ThemeContext';
import AuthenticatedThemeWrapper from './components/AuthenticatedThemeWrapper';
import { UserProvider } from '@/app/context/UserContext';
import { NotificationProvider } from '@/app/context/NotificationContext';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <AuthenticatedThemeWrapper>
            <div className="flex min-h-screen"> 
              {children}
            </div>
          </AuthenticatedThemeWrapper>
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}