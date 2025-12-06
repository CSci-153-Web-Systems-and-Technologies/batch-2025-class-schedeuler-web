// ClassCard.tsx
import React from "react";

export interface ClassCardProps {
  subject: string;
  type: string;
  time: string;
  bgColor?: string;
  borderColor?: string;
}

const ClassCard: React.FC<ClassCardProps> = ({
  subject,
  type,
  time,
  bgColor = "#60A5FA",    
  borderColor = "#2563EB", 
}) => {
  return (
    <div
      className="flex flex-col p-4 border-l-4 rounded-md shadow-sm"
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
    >
      <h3 className="text-lg font-semibold text-gray-800">
        {subject} ({type})
      </h3>
      <p className="text-sm text-gray-600 mt-1">{time}</p>
    </div>
  );
};

export default ClassCard;
