import React from "react";

export const SkeletonHeader = () => (
  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
    <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-36 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
    ))}
  </div>
);

export const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse ${className}`} />
);

export const SkeletonGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
    {children}
  </div>
);