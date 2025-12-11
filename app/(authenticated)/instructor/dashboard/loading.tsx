import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "var(--color-main-bg)" }}>
      {/* 1. Breadcrumb Placeholder */}
      <div className="h-4 w-32 bg-gray-300 dark:bg-gray-800 rounded mb-4 animate-pulse" />

      {/* 2. Header: Greeting & Create Class Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-300 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-300 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        {/* Matches CreateClassButton shape */}
        <div className="h-14 w-44 bg-gray-300 dark:bg-gray-800 rounded-full animate-pulse shadow-sm" />
      </div>

      {/* 3. Stats Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-400/20 dark:border-gray-700" />
        ))}
      </div>

      {/* 4. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        
        {/* Left: Classes */}
        <div className="lg:col-span-2 min-h-[600px] bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-400/20 dark:border-gray-700" />

        {/* Right: Calendar & Tasks Sidebar */}
        <div className="flex flex-col gap-6">
          
          {/* Calendar Container */}
          <div className="h-[380px] bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-400/20 dark:border-gray-700" />

          {/* Tasks Container */}
          <div className="flex-1 min-h-[300px] bg-gray-300 dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-400/20 dark:border-gray-700" />
        </div>
      </div>
    </div>
  );
}