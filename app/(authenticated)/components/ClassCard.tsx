"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ClassCardProps {
  subject: string;
  type: string;
  time: string;
  bgColor?: string;
  borderColor?: string;
  className?: string;
  onClick?: () => void; // [NEW] Added for interaction
}

// Your original helper function
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

const ClassCard: React.FC<ClassCardProps> = ({
  subject,
  type,
  time,
  bgColor = "#60A5FA",
  borderColor,
  className,
  onClick, // [NEW] Destructure onClick
}) => {
  const finalBorderColor = borderColor || darkenHex(bgColor, 30);

  return (
    <div
      onClick={onClick} // [NEW] Attach click handler
      className={cn(
        "flex flex-col p-4 border-l-4 rounded-md shadow-sm transition-all",
        // [NEW] Only add hover effects if clickable
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]", 
        className
      )}
      style={{ 
        backgroundColor: bgColor, 
        borderColor: finalBorderColor,
      }}
    >
      <h3 className="text-lg font-semibold text-gray-800 leading-tight">
        {subject} <span className="text-base font-normal opacity-80">({type})</span>
      </h3>
      <p className="text-sm text-gray-700 mt-1 font-medium opacity-90">{time}</p>
    </div>
  );
};

export default ClassCard;