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
    <ul className="space-y-3">
      {subjects.map((subj, index) => (
        <li 
          key={index}
          className="px-5 py-2 rounded-lg shadow-sm"
          style={{ backgroundColor: subj.color }}
        >
          {subj.name}
        </li>
      ))}
    </ul>
  );
};

export default SubjectsList;
