"use client";

import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/app/components/ui/Badge';
import { useThemeContext } from "@/app/(authenticated)/components/ThemeContext";

export interface EnrolledClassProps {
  id: string;
  name: string;
  code: string;
  instructor: string;
  schedule: string;
  room: string;
  status: 'pending' | 'approved' | 'rejected';
  onClick?: () => void;
}

const EnrolledClassCard: React.FC<EnrolledClassProps> = ({
  name,
  code,
  instructor,
  schedule,
  room,
  status,
  onClick
}) => {
  const { theme } = useThemeContext();

  const getStatusStyle = (status: string) => {
    if (theme === 'dark') {
      switch (status) {
        case 'approved': 
          return { backgroundColor: 'rgba(20, 83, 45, 0.3)', color: '#4ade80', border: '1px solid transparent' };
        case 'pending': 
          return { backgroundColor: 'rgba(120, 53, 15, 0.3)', color: '#fbbf24', border: '1px solid transparent' };
        case 'rejected': 
          return { backgroundColor: 'rgba(127, 29, 29, 0.3)', color: '#f87171', border: '1px solid transparent' };
        default: 
          return { backgroundColor: '#374151', color: '#9CA3AF' };
      }
    } else {
      switch (status) {
        case 'approved': 
          return { backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' };
        case 'pending': 
          return { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' };
        case 'rejected': 
          return { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' };
        default: 
          return { backgroundColor: '#F3F4F6', color: '#374151' };
      }
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
      style={{ backgroundColor: 'var(--color-components-bg)' }}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5" 
        style={{ backgroundColor: 'var(--color-primary)' }} 
      />

      <div className="flex-1 pl-3 space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {code} - {name}
          </h3>
        </div>

        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center gap-1.5">
            <Briefcase size={16} className="opacity-70" />
            <span>{instructor}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="opacity-70" />
            <span>{schedule}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="opacity-70" />
            <span>{room}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 self-start md:self-center">
        <Badge 
          variant="secondary"
          className="px-3 py-1 rounded-full text-xs font-bold capitalize"
          style={getStatusStyle(status)}
        >
          {status === 'approved' ? 'Active' : status}
        </Badge>
      </div>
    </div>
  );
};

export default EnrolledClassCard;