"use client";

import React from "react";
import ClassCard, { ClassCardProps } from "@/app/(authenticated)/components/ClassCard";

interface StudentOverviewProps {
  subjects: ClassCardProps[];
}

const darkenHex = (hex: string, percent: number): string => {
  let color = hex.replace(/^#/, '');
  if (color.length === 3) color = color.split('').map(c => c + c).join('');
  const num = parseInt(color, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  r = Math.floor(r * (100 - percent) / 100);
  g = Math.floor(g * (100 - percent) / 100);
  b = Math.floor(b * (100 - percent) / 100);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

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
          {subjects.map((subj, index) => {
            const finalBorderColor = subj.borderColor || (subj.bgColor ? darkenHex(subj.bgColor, 30) : undefined);
            return (
              <ClassCard
                key={index}
                subject={subj.subject}
                type={subj.type}
                time={subj.time}
                bgColor={subj.bgColor}
                borderColor={finalBorderColor}
                className="border-l-[6px] shadow-sm hover:translate-x-1 transition-transform"
              />
            );
          })}
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