import React from 'react';
import { Button } from '@/components/ui/Button';
import { SquarePlus } from 'lucide-react';

interface JoinClassButtonProps {
  onClick?: () => void;
  className?: string;
}

const JoinClassButton: React.FC<JoinClassButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  return (
    <Button
      onClick={onClick}
      className={`bg-[#4169E1] hover:bg-[#3557C5] text-white font-semibold !px-6 !py-6 rounded-full text-lg shadow-lg transition-all duration-200 ${className}`}
    >
      Join Class
      <SquarePlus className="ml-2 h-5 w-5" strokeWidth={3} />
    </Button>
  );
};

export default JoinClassButton;