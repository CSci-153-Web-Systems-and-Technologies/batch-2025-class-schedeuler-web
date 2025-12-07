"use client";

import React from 'react';
import { Briefcase, Calendar, MapPin, User } from 'lucide-react';
import { Badge } from '@/app/components/ui/Badge';

export interface EnrolledClassProps {
  id: string;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  room: string;
  status: 'pending' | 'approved' | 'rejected';
}

const EnrolledClassCard: React.FC<EnrolledClassProps> = ({
  name,
  code,
  instructor,
  schedule,
  room,
  status
}) => {
  return (
    <div 
      className="relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden transition-all hover:shadow-md"
      style={{ backgroundColor: 'var(--color-components-bg)' }}
    >
      {/* Blue Left Border Accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5" 
        style={{ backgroundColor: 'var(--color-primary)' }} 
      />

      <div className="flex-1 pl-3 space-y-2">
        {/* Header */}
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {code} - {name}
          </h3>
        </div>

        {/* Details Row */}
        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {/* Instructor */}
          <div className="flex items-center gap-1.5">
            <Briefcase size={16} className="opacity-70" />
            <span>{instructor}</span>
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="opacity-70" />
            <span>{schedule}</span>
          </div>

          {/* Room */}
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="opacity-70" />
            <span>{room}</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 self-start md:self-center">
        <span 
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            status === 'approved' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : status === 'pending'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {status === 'approved' ? 'Active' : status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default EnrolledClassCard;