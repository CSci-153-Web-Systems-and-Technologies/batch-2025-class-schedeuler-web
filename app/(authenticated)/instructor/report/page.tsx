// app/(authenticated)/instructor/report/page.tsx
"use client";

import React from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';
// Reuse the bug report form from the student directory
import BugReport from '@/app/(authenticated)/student/report/components/BugReport';

export default function InstructorReportPage() {
  return (
    <div 
      className="min-h-screen py-6 px-4 sm:px-6 lg:px-12" 
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      <AppBreadcrumb />
      
      {/* The BugReport component handles the form UI and submission logic.
        It uses the same 'reports' table in Supabase, which includes a 'user_id' 
        column, so it will correctly attribute reports to the logged-in instructor.
      */}
      <BugReport />
    </div>
  );
}