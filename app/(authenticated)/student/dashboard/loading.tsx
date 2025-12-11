import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--color-main-bg)" }}>
      {/* 1. Breadcrumb Placeholder */}
      <div className="h-4 w-32 bg-gray-300 dark:bg-gray-800 rounded mb-4 animate-pulse" />

      {/* 2. Header: Greeting & Join Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-300 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        {/* Matches JoinClassButton shape */}
        <div className="h-14 w-40 bg-gray-300 dark:bg-gray-800 rounded-full animate-pulse shadow-sm" />
      </div>

      {/* 3. Vote Card */}
      <div className="h-28 w-full bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse mb-6 border border-gray-400/20 dark:border-gray-700" />

      {/* 4. Main Content Row */}
      <div className="flex flex-col xl:flex-row gap-6 mb-6">
        
        {/* Left: Overview */}
        <div className="w-full xl:w-2/3 h-[550px] bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-400/20 dark:border-gray-700" />

        {/* Right: Calendar & Pomodoro */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          {/* Calendar Container */}
          <div className="h-[380px] bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-400/20 dark:border-gray-700" />
          
          {/* Pomodoro Container */}
          <div className="h-48 bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-400/20 dark:border-gray-700" />
        </div>
      </div>

      {/* 5. Bottom Row: Tasks & Subjects */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tasks Deadline */}
        <div className="flex-1 min-w-0 h-96 bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-400/20 dark:border-gray-700" />
        
        {/* Subjects List */}
        <div className="flex-1 min-w-0 h-96 bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-400/20 dark:border-gray-700" />
      </div>
    </div>
  );
}