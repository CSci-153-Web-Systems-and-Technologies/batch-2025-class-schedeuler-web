// app/(authenticated)/instructor/calendar/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb'; 

const CalendarView = dynamic(() => import('@/app/(authenticated)/student/calendar/components/CalendarView'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-[var(--color-main-bg)]">
      <div className="text-lg text-[var(--color-text-primary)]">Loading calendar...</div> 
    </div>
  ),
});

export default function InstructorCalendarPage() {
  return (
    <div
      className="min-h-screen py-6 px-4 sm:px-6 lg:px-8" 
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      <AppBreadcrumb />
      
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center bg-[var(--color-main-bg)]">
          <div className="text-lg text-[var(--color-text-primary)]">Loading...</div>
        </div>
      }> 
        <CalendarView 
            disableSubjectCreation={true}
        />
      </Suspense>
    </div>
  );
}