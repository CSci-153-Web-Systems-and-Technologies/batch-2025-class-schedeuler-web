// components/Calendar/EventComponent.tsx
import React from 'react';
import { EventProps } from 'react-big-calendar';
import { CalendarEvent, EventType } from '@/types/calendar'; // <-- FIX: Imported EventType
import { CheckCircle, Book, Flag, School } from 'lucide-react'; 

// FIX: Use Omit to prevent the conflicting 'title' property when merging EventProps and HTMLAttributes.
interface CustomEventProps 
  extends EventProps<CalendarEvent>, 
  Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {}

const EventComponent: React.FC<CustomEventProps> = ({ event, className, style, ...rest }) => {
  const isTask = event.type === EventType.TASK;
  const isSubject = event.type === EventType.SUBJECT;
  
  // Determine the primary icon
  const PrimaryIcon = () => {
    if (isSubject) {
        return <School size={10} />;
    }
    if (isTask) {
      // Task/Homework icons
      return event.completed ? (
        <CheckCircle size={10} className="text-green-500" />
      ) : (
        <Flag size={10} className="text-red-500" />
      );
    }
    
    // Exam icon (using Book as a generic academic symbol)
    return <Book size={10} />; 
  };

  return (
    // SPREAD ALL PROPS HERE
    <div 
      className={`p-1 text-xs event-component ${className}`}
      style={style}
      {...rest}
    >
      <div 
        className={`flex items-center gap-1 ${event.completed ? 'opacity-60' : ''}`}
        style={{ pointerEvents: 'none' }}
      >
        
        {/* ICON (SUBJECT, TASK or EXAM) */}
        <PrimaryIcon />

        {/* CONTENT (TITLE ONLY) - Hide content entirely on small screens when needed */}
        <div className="flex-1 min-w-0">
            <div className="font-medium truncate text-white">
                {event.subjectCode && (
                    <span className="font-bold mr-1">[{event.subjectCode}]</span>
                )}
                {event.title}
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default EventComponent;