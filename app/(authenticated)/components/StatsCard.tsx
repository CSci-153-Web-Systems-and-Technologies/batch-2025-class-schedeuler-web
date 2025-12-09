// StatsCard.tsx
import React from "react";

interface StatsCardProps {
  value: string | number;
  label: string;
  subtext?: string;
  icon?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  subtext,
  icon,
}) => {
  return (
    <div className="flex items-center p-4 bg-white rounded-md shadow space-x-4">
      {icon && <div className="text-2xl">{icon}</div>}
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-gray-500">{label}</p>
        {subtext && <p className="text-sm text-gray-400">{subtext}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
