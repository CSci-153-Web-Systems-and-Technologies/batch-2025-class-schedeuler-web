"use client";

import React, { useMemo } from "react";
import ClassCard from "@/app/(authenticated)/components/ClassCard";
import { useSubjects } from "@/app/(authenticated)/student/subjects/SubjectContext";
import { generateRecurringEvents } from "@/utils/calendarUtils";
import { EventType, CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";

interface InstructorClassesProps {
  onClassClick: (event: CalendarEvent) => void;
}

export default function InstructorClasses({ onClassClick }: InstructorClassesProps) {
  const { subjects: allSubjects, loading } = useSubjects();
  const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const todayClasses = useMemo(() => {
    const today = new Date();
    const eventsToday = generateRecurringEvents(allSubjects, today, 'day');
    
    return eventsToday
      .filter(e => e.type === EventType.SUBJECT)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [allSubjects]);

  return (
    <div 
      className="p-6 rounded-2xl border border-[var(--color-border)] shadow-sm h-full flex flex-col"
      style={{ backgroundColor: "var(--color-components-bg)" }}
    >
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-[var(--color-border)]">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Today's Classes</h2>
        <span className="text-sm font-bold text-[var(--color-text-secondary)]">{currentDate}</span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {loading ? (
           <p className="text-sm text-[var(--color-text-secondary)]">Loading schedule...</p>
        ) : todayClasses.length > 0 ? (
          todayClasses.map((event, index) => (
            <ClassCard
              key={index}
              subject={event.subjectCode ? `${event.subjectCode} - ${event.title}` : event.title}
              type={event.location || 'Room TBD'}
              time={`${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}`}
              bgColor={event.color}
              onClick={() => onClassClick(event)}
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <p className="text-lg font-medium text-[var(--color-text-primary)]">No classes scheduled for today.</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Check your calendar to add sessions.</p>
          </div>
        )}
      </div>
    </div>
  );
}