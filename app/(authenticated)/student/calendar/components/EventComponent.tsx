// components/Calendar/EventComponent.tsx
import React from 'react';
import { EventProps } from 'react-big-calendar';
import { CalendarEvent, EventType } from '@/types/calendar';
import { CheckCircle, Book, Flag, School, Clock } from 'lucide-react'; 

interface CustomEventProps 
  extends EventProps<CalendarEvent>, 
  Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    view?: string; 
    selected?: boolean;
    label?: string;
}

const EventComponent: React.FC<CustomEventProps> = ({ 
  event, 
  className, 
  style, 
  view,
  continuesPrior,
  continuesAfter,
  isAllDay,
  localizer,
  slotStart,
  slotEnd,
  selected,
  title,
  label,
  ...rest 
}) => {
  const isTask = event.type === EventType.TASK;
  const isSubject = event.type === EventType.SUBJECT;
  
  const isWeekView = view === 'week';
  const isDayView = view === 'day';
  const isTimeView = isWeekView || isDayView;

  const PrimaryIcon = () => {
    if (isSubject) {
        return <School size={12} className="text-gray-700 flex-shrink-0" />;
    }
    if (isTask) {
      return event.completed ? (
        <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
      ) : (
        <Flag size={12} className="text-red-500 flex-shrink-0" />
      );
    }
    return <Book size={12} className="text-gray-700 flex-shrink-0" />; 
  };

  const containerClasses = isWeekView 
    ? 'flex flex-col h-full justify-start items-start text-left md:justify-center md:items-center md:text-center'
    : isDayView 
        ? 'flex flex-col justify-center items-center h-full text-center'
        : '';

  const innerContainerClasses = isWeekView
    ? 'items-start md:items-center'
    : isDayView
        ? 'items-center'
        : '';

  const headerClasses = isWeekView
    ? 'w-full justify-start md:justify-center'
    : isDayView
        ? 'w-full justify-center'
        : '';

  const timeClasses = isWeekView
    ? 'justify-start md:justify-center'
    : 'justify-center';

  const iconClass = isWeekView ? 'hidden md:block' : '';

  return (
    <div 
      className={`p-1 text-xs event-component ${className} ${containerClasses}`}
      style={style}
      {...rest}
    >
      <div 
        className={`flex flex-col w-full ${event.completed ? 'opacity-60' : ''} ${innerContainerClasses}`}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`flex items-center gap-1 mb-0.5 ${headerClasses}`}>
            <div className={iconClass}>
                <PrimaryIcon />
            </div>
            
            <div className="font-semibold text-gray-900 leading-tight whitespace-normal break-words min-w-0">
                {event.subjectCode && (
                    <span className="font-bold mr-1">[{event.subjectCode}]</span>
                )}
                {event.title}
            </div>
        </div>

        {!event.allDay && isTimeView && (
            <div className={`flex items-center gap-1 text-[10px] text-gray-700 font-medium opacity-90 mt-auto ${timeClasses}`}>
                <div className={iconClass}>
                    <Clock size={10} className="text-gray-600 flex-shrink-0" />
                </div>
                <span className="whitespace-nowrap">
                    {event.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
            </div>
        )}       
      </div>
    </div>
  );
};

export default EventComponent;