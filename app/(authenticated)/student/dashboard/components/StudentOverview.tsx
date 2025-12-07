// app/(authenticated)/student/dashboard/components/StudentOverview.tsx
import React from "react";
import ClassCard, {
  ClassCardProps,
} from "@/app/(authenticated)/components/ClassCard";

interface StudentOverviewProps {
  subjects: ClassCardProps[];
}

const darkenHex = (hex: string, percent: number): string => {
  let color = hex.replace(/^#/, '');

  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }

  const num = parseInt(color, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.floor(r * (100 - percent) / 100);
  g = Math.floor(g * (100 - percent) / 100);
  b = Math.floor(b * (100 - percent) / 100);

  const newHex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  
  return `#${newHex}`;
};

const StudentOverview: React.FC<StudentOverviewProps> = ({ subjects }) => {
  const now: Date = new Date();

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const formattedDate: string = now.toLocaleDateString("en-US", options);
  
  return (
    <div
      className="lg:px-12 px-6 pt-8 pb-10 rounded-xl flex-1"
      style={{ backgroundColor: "var(--color-components-bg)" }}
    >
      <div className="flex justify-between border-b-2 mb-5 items-end">
        <h1
          className="text-2xl font-bold pb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Today's Overview
        </h1>
        <p
          className="text-xs font-bold pb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          {formattedDate}
        </p>
      </div>

      {subjects.length > 0 ? (
        <ul className="space-y-4">
          {subjects.map((subj, index) => {
            const finalBorderColor = subj.borderColor || (subj.bgColor ? darkenHex(subj.bgColor, 30) : undefined);

            return (
              <li key={index}>
                <ClassCard
                  subject={subj.subject}
                  type={subj.type}
                  time={subj.time}
                  bgColor={subj.bgColor}
                  borderColor={finalBorderColor}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <h1
          className="text-xl font-semibold mt-4 text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          No subjects for today
        </h1>
      )}
    </div>
  );
};

export default StudentOverview;