import React from "react";
import ClassCard, {
  ClassCardProps,
} from "@/app/(authenticated)/components/ClassCard";

interface StudentOverviewProps {
  subjects: ClassCardProps[];
}

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
          {subjects.map((subj, index) => (
            <li key={index}>
              <ClassCard
                subject={subj.subject}
                type={subj.type}
                time={subj.time}
                bgColor={subj.bgColor}
                borderColor={subj.borderColor}
              />
            </li>
          ))}
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
