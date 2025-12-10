// app/(authenticated)/instructor/report/page.tsx
"use client";

import React from 'react';
import AppBreadcrumb from '@/app/components/ui/AppBreadCrumb';
import BugReport from '@/app/(authenticated)/student/report/components/BugReport';

export default function InstructorReportPage() {
  return (
    <div 
      className="min-h-screen py-6 px-2 sm:px-6 lg:px-12" 
      style={{ backgroundColor: "var(--color-main-bg)" }}
    >
      <AppBreadcrumb />
      <BugReport />
    </div>
  );
}