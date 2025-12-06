// app/calendar/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import AuthenticatedThemeWrapper from '@/app/(authenticated)/components/AuthenticatedThemeWrapper'; // Add this

// Dynamically import calendar to avoid SSR issues
const CalendarView = dynamic(() => import('./components/CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-[var(--color-main-bg)]">
      <div className="text-lg text-[var(--color-text-primary)]">Loading calendar...</div> 
    </div>
  ),
});

export default function CalendarPage() {
  return (
    <AuthenticatedThemeWrapper> {/* Wrap with your ThemeWrapper */}
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center bg-[var(--color-main-bg)]">
          <div className="text-lg text-[var(--color-text-primary)]">Loading...</div>
        </div>
      }> 
        <CalendarView />
      </Suspense>
    </AuthenticatedThemeWrapper>
  );
}