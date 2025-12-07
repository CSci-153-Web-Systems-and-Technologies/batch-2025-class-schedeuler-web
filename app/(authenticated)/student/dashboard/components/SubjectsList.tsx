// app/(authenticated)/student/dashboard/components/SubjectsList.tsx
import React from "react";

export interface Subject {
  name: string;
  color: string; 
}

interface SubjectsListProps {
  subjects: Subject[];
}

const SubjectsList: React.FC<SubjectsListProps> = ({ subjects }) => {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-[var(--color-text-secondary)] italic">
          No subjects enrolled.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {subjects.map((subj, index) => (
        <li 
          key={index}
          className="px-5 py-2 rounded-lg shadow-sm text-gray-800 font-medium border border-black/5"
          style={{ backgroundColor: subj.color }}
        >
          {subj.name}
        </li>
      ))}
    </ul>
  );
};

export default SubjectsList;