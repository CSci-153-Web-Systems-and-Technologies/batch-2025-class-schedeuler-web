"use client";

import React from "react";
import ClassCard, { ClassCardProps } from "@/app/(authenticated)/components/ClassCard";

interface StudentOverviewProps {
  subjects: ClassCardProps[];
}

const StudentOverview: React.FC<StudentOverviewProps> = ({ subjects }) => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  
  return (
    <div 
      className="p-6 rounded-2xl border border-[var(--color-border)] shadow-sm h-full min-h-[500px]"
      style={{ backgroundColor: "var(--color-components-bg)" }}
    >
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-[var(--color-border)]">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Today's Overview</h2>
        <span className="text-sm font-bold text-[var(--color-text-secondary)]">{formattedDate}</span>
      </div>

      {subjects.length > 0 ? (
        <div className="space-y-4">
          {subjects.map((subj, index) => (
            <ClassCard
              key={index}
              {...subj} 
              className="border-l-[6px] shadow-sm hover:translate-x-1 transition-transform"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center opacity-60">
          <p className="text-lg font-medium text-[var(--color-text-primary)]">No classes scheduled for today.</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Enjoy your free time!</p>
        </div>
      )}
    </div>
  );
};

export default StudentOverview;