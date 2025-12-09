"use client";

import React from "react";

export interface Subject {
  name: string;
  color: string; 
}

interface SubjectsListProps {
  subjects: Subject[];
}

const SubjectsList: React.FC<SubjectsListProps> = ({ subjects }) => {
  return (
    <div 
      className="p-6 rounded-2xl border border-[var(--color-border)] shadow-sm flex flex-col h-full min-h-[300px]"
      style={{ backgroundColor: 'var(--color-components-bg)' }}
    >
      <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 text-[#4169E1] border-b-2 pb-2">
        Subjects
      </h2>

      {subjects.length > 0 ? (
        <ul className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {subjects.map((subj, index) => (
            <li 
              key={index}
              className="px-5 py-3 rounded-lg shadow-sm text-gray-800 font-medium border border-black/5 transition-transform hover:translate-x-1"
              style={{ backgroundColor: subj.color }}
            >
              {subj.name}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
          <p className="text-sm text-[var(--color-text-secondary)] italic">
            No subjects enrolled.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubjectsList;