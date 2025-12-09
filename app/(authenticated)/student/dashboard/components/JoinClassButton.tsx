// app/(authenticated)/student/dashboard/components/JoinClassButton.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SquarePlus } from 'lucide-react';
import JoinClassModal from './JoinClassModal';

interface JoinClassButtonProps {
  className?: string;
}

const JoinClassButton: React.FC<JoinClassButtonProps> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`bg-[#4169E1] hover:bg-[#3557C5] text-white font-semibold !px-6 !py-6 rounded-full text-lg shadow-lg transition-all duration-200 ${className}`}
      >
        Join Class
        <SquarePlus className="ml-2 h-5 w-5" strokeWidth={3} />
      </Button>

      <JoinClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default JoinClassButton;